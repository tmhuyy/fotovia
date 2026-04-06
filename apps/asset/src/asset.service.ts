import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
    AssetPurpose,
    AssetResourceType,
    AssetStatus,
    AssetUsageRole,
    AssetVisibility,
    StorageProvider,
    UploadSessionStatus,
} from '@repo/types';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { IsNull, Repository } from 'typeorm';

import { AttachAssetUsageDto } from './dtos/attach-asset-usage.dto';
import { ConfirmUploadSessionDto } from './dtos/confirm-upload-session.dto';
import { CreateUploadSessionDto } from './dtos/create-upload-session.dto';
import { AssetUploadSession } from './entities/asset-upload-session.entity';
import { AssetUsage } from './entities/asset-usage.entity';
import { Asset } from './entities/asset.entity';
import { SupabaseStorageService } from './infrastructure/supabase/supabase-storage.service';

@Injectable()
export class AssetService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        @InjectRepository(AssetUploadSession)
        private readonly uploadSessionRepository: Repository<AssetUploadSession>,
        @InjectRepository(AssetUsage)
        private readonly assetUsageRepository: Repository<AssetUsage>,
        private readonly configService: ConfigService,
        private readonly supabaseStorageService: SupabaseStorageService,
    ) {}

    private assertAssetOwner(asset: Asset, userId: string) {
        if (asset.ownerUserId !== userId) {
            throw new NotFoundException('Asset not found.');
        }
    }

    private resolveBucketName(
        purpose: AssetPurpose,
        visibility: AssetVisibility,
    ): string {
        if (purpose === AssetPurpose.AVATAR) {
            return this.configService.getOrThrow<string>(
                'STORAGE_AVATARS_BUCKET',
            );
        }

        if (
            purpose === AssetPurpose.PORTFOLIO_IMAGE ||
            purpose === AssetPurpose.PORTFOLIO_COVER
        ) {
            return this.configService.getOrThrow<string>(
                'STORAGE_PORTFOLIO_BUCKET',
            );
        }

        if (visibility === AssetVisibility.PRIVATE) {
            return this.configService.getOrThrow<string>(
                'STORAGE_PRIVATE_BUCKET',
            );
        }

        return this.configService.getOrThrow<string>('STORAGE_PRIVATE_BUCKET');
    }

    private resolveFileExtension(
        originalFilename: string,
        mimeType: string,
    ): string | null {
        const filenameExtension = extname(originalFilename)
            .replace('.', '')
            .trim();

        if (filenameExtension) {
            return filenameExtension.toLowerCase();
        }

        const mimeToExtension: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'application/pdf': 'pdf',
        };

        return mimeToExtension[mimeType] ?? null;
    }

    private buildObjectKey(params: {
        purpose: AssetPurpose;
        ownerUserId: string;
        fileExtension: string | null;
    }): string {
        const today = new Date().toISOString().slice(0, 10);
        const purposeSegment = params.purpose.toLowerCase();
        const extensionSegment = params.fileExtension
            ? `.${params.fileExtension}`
            : '';

        return `${purposeSegment}/${params.ownerUserId}/${today}/${randomUUID()}${extensionSegment}`;
    }

    async createUploadSession(dto: CreateUploadSessionDto, userId: string) {
        const visibility = dto.visibility ?? AssetVisibility.PUBLIC;
        const resourceType = dto.resourceType ?? AssetResourceType.IMAGE;
        const fileExtension = this.resolveFileExtension(
            dto.originalFilename,
            dto.mimeType,
        );
        const bucketName = this.resolveBucketName(dto.purpose, visibility);
        const objectKey = this.buildObjectKey({
            purpose: dto.purpose,
            ownerUserId: userId,
            fileExtension,
        });

        const asset = this.assetRepository.create({
            ownerUserId: userId,
            provider: StorageProvider.SUPABASE_STORAGE,
            bucketName,
            objectKey,
            originalFilename: dto.originalFilename,
            fileExtension,
            mimeType: dto.mimeType,
            sizeBytes: String(dto.sizeBytes),
            resourceType,
            purpose: dto.purpose,
            visibility,
            status: AssetStatus.PENDING_UPLOAD,
            metadataJson: null,
            uploadedAt: null,
            deletedAt: null,
            width: null,
            height: null,
            durationMs: null,
            checksumSha256: null,
            failureReason: null,
        });

        const savedAsset = await this.assetRepository.save(asset);

        const uploadSession = this.uploadSessionRepository.create({
            assetId: savedAsset.id,
            requestedByUserId: userId,
            uploadMethod: 'signed_url',
            expectedMimeType: dto.mimeType,
            maxSizeBytes: String(dto.sizeBytes),
            clientFilename: dto.originalFilename,
            status: UploadSessionStatus.ISSUED,
            expiresAt: new Date(
                Date.now() +
                    Number(
                        this.configService.get<string>(
                            'ASSET_SIGNED_UPLOAD_URL_EXPIRES_IN',
                        ) ?? '7200',
                    ) *
                        1000,
            ),
            uploadedAt: null,
            confirmedAt: null,
            failureReason: null,
        });

        const savedUploadSession =
            await this.uploadSessionRepository.save(uploadSession);

        const uploadData =
            await this.supabaseStorageService.createSignedUploadUrl(
                bucketName,
                objectKey,
            );

        return {
            asset: savedAsset,
            uploadSession: savedUploadSession,
            uploadData,
        };
    }

    async confirmUploadSession(
        sessionId: string,
        dto: ConfirmUploadSessionDto,
        userId: string,
    ) {
        const uploadSession = await this.uploadSessionRepository.findOne({
            where: { id: sessionId },
            relations: {
                asset: true,
            },
        });

        if (!uploadSession) {
            throw new NotFoundException('Upload session not found.');
        }

        this.assertAssetOwner(uploadSession.asset, userId);

        if (uploadSession.status === UploadSessionStatus.CONFIRMED) {
            return {
                asset: uploadSession.asset,
                uploadSession,
            };
        }

        uploadSession.status = UploadSessionStatus.CONFIRMED;
        uploadSession.confirmedAt = new Date();
        uploadSession.uploadedAt = new Date();

        uploadSession.asset.status = AssetStatus.READY;
        uploadSession.asset.uploadedAt = new Date();
        uploadSession.asset.width = dto.width ?? null;
        uploadSession.asset.height = dto.height ?? null;
        uploadSession.asset.durationMs = dto.durationMs ?? null;
        uploadSession.asset.checksumSha256 = dto.checksumSha256 ?? null;
        uploadSession.asset.metadataJson = dto.metadataJson ?? null;

        const savedAsset = await this.assetRepository.save(uploadSession.asset);
        const savedUploadSession =
            await this.uploadSessionRepository.save(uploadSession);

        return {
            asset: savedAsset,
            uploadSession: savedUploadSession,
        };
    }

    async attachUsage(dto: AttachAssetUsageDto, userId: string) {
        const asset = await this.assetRepository.findOne({
            where: { id: dto.assetId },
        });

        if (!asset) {
            throw new NotFoundException('Asset not found.');
        }

        this.assertAssetOwner(asset, userId);

        if (asset.status !== AssetStatus.READY) {
            throw new BadRequestException(
                'Only READY assets can be attached to a business usage slot.',
            );
        }

        if (dto.replaceExistingActiveUsage) {
            await this.assetUsageRepository.update(
                {
                    entityType: dto.entityType,
                    entityId: dto.entityId,
                    fieldName: dto.fieldName,
                    detachedAt: IsNull(),
                },
                {
                    detachedAt: new Date(),
                },
            );
        }

        const usage = this.assetUsageRepository.create({
            assetId: dto.assetId,
            serviceName: dto.serviceName,
            entityType: dto.entityType,
            entityId: dto.entityId,
            fieldName: dto.fieldName,
            usageRole: dto.usageRole ?? AssetUsageRole.PRIMARY,
            sortOrder: dto.sortOrder ?? null,
            attachedByUserId: userId,
            detachedAt: null,
        });

        return this.assetUsageRepository.save(usage);
    }

    async detachUsage(usageId: string, userId: string) {
        const usage = await this.assetUsageRepository.findOne({
            where: { id: usageId },
            relations: {
                asset: true,
            },
        });

        if (!usage) {
            throw new NotFoundException('Asset usage not found.');
        }

        this.assertAssetOwner(usage.asset, userId);

        if (usage.detachedAt) {
            return usage;
        }

        usage.detachedAt = new Date();

        return this.assetUsageRepository.save(usage);
    }

    async getReadUrl(assetId: string, userId: string) {
        const asset = await this.assetRepository.findOne({
            where: { id: assetId },
        });

        if (!asset) {
            throw new NotFoundException('Asset not found.');
        }

        this.assertAssetOwner(asset, userId);

        if (asset.status !== AssetStatus.READY) {
            throw new BadRequestException(
                'Only READY assets can resolve a readable URL.',
            );
        }

        const expiresInSeconds =
            asset.visibility === AssetVisibility.PRIVATE
                ? Number(
                      this.configService.get<string>(
                          'ASSET_SIGNED_READ_URL_EXPIRES_IN',
                      ) ?? '3600',
                  )
                : null;

        const url =
            asset.visibility === AssetVisibility.PUBLIC
                ? this.supabaseStorageService.getPublicUrl(
                      asset.bucketName,
                      asset.objectKey,
                  )
                : await this.supabaseStorageService.createSignedReadUrl(
                      asset.bucketName,
                      asset.objectKey,
                      expiresInSeconds ?? undefined,
                  );

        return {
            assetId: asset.id,
            visibility: asset.visibility,
            url,
            expiresInSeconds,
        };
    }

    async getAssetUsages(assetId: string, userId: string) {
        const asset = await this.assetRepository.findOne({
            where: { id: assetId },
        });

        if (!asset) {
            throw new NotFoundException('Asset not found.');
        }

        this.assertAssetOwner(asset, userId);

        return this.assetUsageRepository.find({
            where: {
                assetId,
                detachedAt: IsNull(),
            },
            order: {
                sortOrder: 'ASC',
                createdAt: 'ASC',
            },
        });
    }

    async getAsset(assetId: string, userId: string) {
        const asset = await this.assetRepository.findOne({
            where: { id: assetId },
            relations: {
                uploadSessions: true,
                usages: true,
            },
        });

        if (!asset) {
            throw new NotFoundException('Asset not found.');
        }

        this.assertAssetOwner(asset, userId);

        return asset;
    }

    async deleteIfOrphaned(assetId: string, userId: string) {
        const asset = await this.assetRepository.findOne({
            where: { id: assetId },
        });

        if (!asset) {
            throw new NotFoundException('Asset not found.');
        }

        this.assertAssetOwner(asset, userId);

        const activeUsageCount = await this.assetUsageRepository.count({
            where: {
                assetId,
                detachedAt: IsNull(),
            },
        });

        if (activeUsageCount > 0) {
            return {
                assetId,
                deleted: false,
                reason: 'asset_still_has_active_usages',
            };
        }

        await this.supabaseStorageService.deleteObject(
            asset.bucketName,
            asset.objectKey,
        );

        return {
            assetId,
            deleted: true,
            reason: null,
        };
    }
}
