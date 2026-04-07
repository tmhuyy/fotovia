import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Queue } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { ASSET_SERVICE } from '@repo/common';

import { ProfilePortfolioItem } from '../entities/profile-portfolio-item.entity';
import { ProfilePortfolioItemImageClassificationRepository } from '../repositories/profile-portfolio-item-image-classification.repository';
import { ProfilePortfolioItemRepository } from '../repositories/profile-portfolio-item.repository';
import {
    CLASSIFY_PORTFOLIO_ITEM_JOB,
    PORTFOLIO_ITEM_CLASSIFICATION_QUEUE,
} from './portfolio-item-classification.constants';
import { PortfolioItemClassificationMapper } from './portfolio-item-classification.mapper';
import {
    ClassificationServiceBatchResponse,
    ClassificationServiceImageInput,
    PortfolioImageRole,
    QueuePortfolioItemClassificationPayload,
} from './portfolio-item-classification.types';

const ASSET_GET_READ_URL_PATTERN = 'asset.get_read_url';

type AssetReadUrlResponse = {
    assetId: string;
    url: string;
    expiresInSeconds: number | null;
};

type ResolvedClassifiableImage = {
    imageKey: string;
    assetId: string;
    role: PortfolioImageRole;
    url: string;
};

@Injectable()
export class PortfolioItemClassificationService {
    private readonly logger = new Logger(
        PortfolioItemClassificationService.name,
    );

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly profilePortfolioItemRepository: ProfilePortfolioItemRepository,
        private readonly profilePortfolioItemImageClassificationRepository: ProfilePortfolioItemImageClassificationRepository,
        private readonly portfolioItemClassificationMapper: PortfolioItemClassificationMapper,
        @InjectQueue(PORTFOLIO_ITEM_CLASSIFICATION_QUEUE)
        private readonly classificationQueue: Queue,
        @Inject(ASSET_SERVICE)
        private readonly assetClient: ClientProxy,
    ) {}

    async queuePortfolioItemClassification(
        payload: QueuePortfolioItemClassificationPayload,
    ): Promise<void> {
        const jobId = `portfolio-item-${payload.portfolioItemId}-${Date.now()}`;

        await this.profilePortfolioItemImageClassificationRepository.deleteByPortfolioItemId(
            payload.portfolioItemId,
        );

        await this.profilePortfolioItemRepository.updatePortfolioItem(
            payload.portfolioItemId,
            payload.profileId,
            {
                classificationStatus: 'queued',
                classificationJobId: jobId,
                classificationRequestedAt: new Date(),
                classificationStartedAt: null,
                classificationCompletedAt: null,
                classificationFailedAt: null,
                classificationError: null,
                detectedPrimaryStyle: null,
                detectedPrimaryScore: null,
                detectedSecondaryStyles: null,
                detectedStyleDistribution: null,
            },
        );

        try {
            await this.classificationQueue.add(
                CLASSIFY_PORTFOLIO_ITEM_JOB,
                payload,
                {
                    jobId,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                    removeOnComplete: 50,
                    removeOnFail: 100,
                },
            );
        } catch (error) {
            await this.markClassificationFailed(
                payload,
                jobId,
                'Could not enqueue the portfolio item classification job.',
            );

            // this.logger.error(
            //     `Failed to enqueue classification job for portfolio item ${payload.portfolioItemId}`,
            //     this.serializeError(error),
            // );
            this.logger.error(
                `Failed to enqueue classification job for portfolio item ${payload.portfolioItemId}: ${this.serializeError(error)}`,
            );

            console.error('enqueue classification error:', error);
        }
    }

    async processPortfolioItemClassification(
        payload: QueuePortfolioItemClassificationPayload,
        jobId: string,
    ): Promise<void> {
        const currentItem =
            await this.profilePortfolioItemRepository.getByIdForProfile(
                payload.portfolioItemId,
                payload.profileId,
            );

        if (
            currentItem.classificationJobId &&
            currentItem.classificationJobId !== jobId
        ) {
            this.logger.warn(
                `Skipping stale classification job ${jobId} for portfolio item ${payload.portfolioItemId}`,
            );
            return;
        }

        await this.profilePortfolioItemRepository.updatePortfolioItem(
            payload.portfolioItemId,
            payload.profileId,
            {
                classificationStatus: 'processing',
                classificationStartedAt: new Date(),
                classificationCompletedAt: null,
                classificationFailedAt: null,
                classificationError: null,
            },
        );

        try {
            const classifiableImages = await this.buildClassifiableImages(
                currentItem,
                payload.userId,
            );

            if (classifiableImages.length === 0) {
                throw new Error(
                    'Portfolio item does not contain any classifiable images.',
                );
            }

            const batchResponse =
                await this.classifyPortfolioItemImages(classifiableImages);

            const latestItem =
                await this.profilePortfolioItemRepository.getByIdForProfile(
                    payload.portfolioItemId,
                    payload.profileId,
                );

            if (
                latestItem.classificationJobId &&
                latestItem.classificationJobId !== jobId
            ) {
                this.logger.warn(
                    `Discarding stale completed job ${jobId} for portfolio item ${payload.portfolioItemId}`,
                );
                return;
            }

            const coverResult = batchResponse.data.results.find(
                (result) => result.role === 'cover',
            );

            if (
                !coverResult ||
                coverResult.status !== 'completed' ||
                coverResult.predictions.length === 0
            ) {
                throw new Error(
                    'Cover image classification failed, so the portfolio item summary was not updated.',
                );
            }

            const summary = this.portfolioItemClassificationMapper.buildSummary(
                batchResponse.data.results,
            );

            if (
                !summary.detectedPrimaryStyle ||
                !summary.detectedStyleDistribution
            ) {
                throw new Error(
                    'No usable classification predictions were produced for this portfolio item.',
                );
            }

            const imageLookup = new Map(
                classifiableImages.map((image) => [image.imageKey, image]),
            );

            await this.profilePortfolioItemImageClassificationRepository.replaceForPortfolioItem(
                payload.portfolioItemId,
                batchResponse.data.results
                    .map((result) => {
                        const image = imageLookup.get(result.imageKey);
                        const topPrediction = result.predictions?.[0];

                        if (!image) {
                            return null;
                        }

                        return {
                            portfolioItemId: payload.portfolioItemId,
                            assetId: image.assetId,
                            imageKey: result.imageKey,
                            role: result.role,
                            status: result.status,
                            predictionsJson: result.predictions ?? [],
                            topLabel: topPrediction?.label ?? null,
                            topConfidence: topPrediction?.confidence ?? null,
                            error: result.error ?? null,
                            classifiedAt:
                                result.status === 'completed'
                                    ? new Date()
                                    : null,
                        };
                    })
                    .filter(Boolean) as Array<{
                    portfolioItemId: string;
                    assetId: string;
                    imageKey: string;
                    role: string;
                    status: string;
                    predictionsJson: Array<{
                        label: string;
                        confidence: number;
                    }> | null;
                    topLabel: string | null;
                    topConfidence: number | null;
                    error: string | null;
                    classifiedAt: Date | null;
                }>,
            );

            await this.profilePortfolioItemRepository.updatePortfolioItem(
                payload.portfolioItemId,
                payload.profileId,
                {
                    classificationStatus: 'completed',
                    classificationCompletedAt: new Date(),
                    classificationFailedAt: null,
                    classificationError: null,
                    detectedPrimaryStyle: summary.detectedPrimaryStyle,
                    detectedPrimaryScore: summary.detectedPrimaryScore,
                    detectedSecondaryStyles: summary.detectedSecondaryStyles,
                    detectedStyleDistribution:
                        summary.detectedStyleDistribution,
                },
            );
        } catch (error) {
            await this.markClassificationFailed(
                payload,
                jobId,
                this.serializeError(error),
            );

            // this.logger.error(
            //     `Classification job ${jobId} failed for portfolio item ${payload.portfolioItemId}`,
            //     this.serializeError(error),
            // );
            this.logger.error(
                `Classification job ${jobId} failed for portfolio item ${payload.portfolioItemId}: ${this.serializeError(error)}`,
            );

            console.error('process classification error:', error);

            throw error;
        }
    }

    private async classifyPortfolioItemImages(
        images: ResolvedClassifiableImage[],
    ): Promise<ClassificationServiceBatchResponse> {
        const timeoutMs = Number(
            this.configService.get('AI_CLASSIFIER_TIMEOUT_MS') ?? 20000,
        );
        const topK = Number(this.configService.get('AI_CLASSIFIER_TOP_K') ?? 3);

        const response = await firstValueFrom(
            this.httpService.post<ClassificationServiceBatchResponse>(
                '/classify/batch-urls',
                {
                    images: images.map<ClassificationServiceImageInput>(
                        (image) => ({
                            imageKey: image.imageKey,
                            url: image.url,
                            role: image.role,
                        }),
                    ),
                    topK,
                    timeoutSeconds: timeoutMs / 1000,
                },
            ),
        );

        if (response.data.statusCode !== 200) {
            throw new Error(
                `AI classifier returned an unexpected statusCode: ${response.data.statusCode}`,
            );
        }

        return response.data;
    }

    private async buildClassifiableImages(
        portfolioItem: ProfilePortfolioItem,
        userId: string,
    ): Promise<ResolvedClassifiableImage[]> {
        const coverUrl = await this.getAssetReadUrl(
            portfolioItem.assetId,
            userId,
        );

        const galleryImages = await Promise.all(
            (portfolioItem.galleryImages ?? []).map(
                async (
                    galleryImage,
                    index,
                ): Promise<ResolvedClassifiableImage> => {
                    const galleryUrl = await this.getAssetReadUrl(
                        galleryImage.assetId,
                        userId,
                    );

                    return {
                        imageKey: `gallery:${index + 1}:${galleryImage.assetId}`,
                        assetId: galleryImage.assetId,
                        role: 'gallery',
                        url: galleryUrl,
                    };
                },
            ),
        );

        return [
            {
                imageKey: `cover:${portfolioItem.assetId}`,
                assetId: portfolioItem.assetId,
                role: 'cover',
                url: coverUrl,
            },
            ...galleryImages,
        ];
    }

    private async getAssetReadUrl(
        assetId: string,
        userId: string,
    ): Promise<string> {
        const readUrl = await this.sendAssetRpc<AssetReadUrlResponse>(
            ASSET_GET_READ_URL_PATTERN,
            {
                assetId,
                userId,
            },
        );

        if (!readUrl.url) {
            throw new Error(
                `Could not resolve a readable URL for asset ${assetId}.`,
            );
        }

        return readUrl.url;
    }

    private async markClassificationFailed(
        payload: QueuePortfolioItemClassificationPayload,
        jobId: string,
        errorMessage: string,
    ): Promise<void> {
        const latestItem = await this.profilePortfolioItemRepository
            .getByIdForProfile(payload.portfolioItemId, payload.profileId)
            .catch(() => null);

        if (
            latestItem?.classificationJobId &&
            latestItem.classificationJobId !== jobId
        ) {
            return;
        }

        await this.profilePortfolioItemImageClassificationRepository.deleteByPortfolioItemId(
            payload.portfolioItemId,
        );

        await this.profilePortfolioItemRepository.updatePortfolioItem(
            payload.portfolioItemId,
            payload.profileId,
            {
                classificationStatus: 'failed',
                classificationFailedAt: new Date(),
                classificationCompletedAt: null,
                classificationError: errorMessage,
                detectedPrimaryStyle: null,
                detectedPrimaryScore: null,
                detectedSecondaryStyles: null,
                detectedStyleDistribution: null,
            },
        );
    }

    private async sendAssetRpc<T>(
        pattern: string,
        payload: unknown,
    ): Promise<T> {
        return firstValueFrom(this.assetClient.send<T>(pattern, payload));
    }

    private serializeError(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }

        if (typeof error === 'string') {
            return error;
        }

        return 'Unknown portfolio classification error';
    }
}
