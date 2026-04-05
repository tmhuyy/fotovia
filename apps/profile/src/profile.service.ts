import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ASSET_SERVICE } from '@repo/common';
import { AssetPurpose, AssetUsageRole, UserRole } from '@repo/types';

import { CreateProfileFromAuthDto } from './dtos/create-profile-from-auth.dto';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { CreateProfilePortfolioItemDto } from './dtos/create-profile-portfolio-item.dto';
import { UpdateProfileAvatarDto } from './dtos/update-profile-avatar.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateProfilePortfolioItemDto } from './dtos/update-profile-portfolio-item.dto';
import { ProfilePortfolioItem } from './entities/profile-portfolio-item.entity';
import { Profile } from './entities/profile.entity';
import { ProfilePortfolioItemRepository } from './repositories/profile-portfolio-item.repository';
import { ProfileRepository } from './repositories/profile.repository';

const ASSET_GET_BY_ID_PATTERN = 'asset.get_by_id';
const ASSET_GET_READ_URL_PATTERN = 'asset.get_read_url';
const ASSET_ATTACH_USAGE_PATTERN = 'asset.attach_usage';
const ASSET_GET_USAGES_PATTERN = 'asset.get_usages';
const ASSET_DETACH_USAGE_PATTERN = 'asset.detach_usage';

type AssetRecord = {
    id: string;
    purpose: AssetPurpose;
    originalFilename?: string | null;
    mimeType?: string | null;
    sizeBytes?: string | number | null;
};

type AssetReadUrlResponse = {
    assetId: string;
    url: string;
    expiresInSeconds: number | null;
};

type AssetUsageRecord = {
    id: string;
    entityType: string;
    entityId: string;
    fieldName: string;
    detachedAt?: string | null;
};

type AttachAssetUsagePayload = {
    userId: string;
    dto: {
        assetId: string;
        serviceName: string;
        entityType: string;
        entityId: string;
        fieldName: string;
        usageRole: AssetUsageRole;
        replaceExistingActiveUsage: boolean;
    };
};

type DetachAssetUsagePayload = {
    userId: string;
    usageId: string;
};

@Injectable()
export class ProfileService {
    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly profilePortfolioItemRepository: ProfilePortfolioItemRepository,
        @Inject(ASSET_SERVICE) private readonly assetClient: ClientProxy,
    ) {}

    async createProfile(
        createProfileDto: CreateProfileDto,
        userId: string,
    ): Promise<Profile> {
        return this.profileRepository.createProfile(createProfileDto, userId);
    }

    async createProfileFromSignup(
        createProfileFromAuthDto: CreateProfileFromAuthDto,
    ): Promise<Profile> {
        return this.profileRepository.createProfileFromSignup(
            createProfileFromAuthDto,
        );
    }

    async updateProfile(
        updateProfileDto: UpdateProfileDto,
        userId: string,
    ): Promise<Profile> {
        return this.profileRepository.updateProfile(updateProfileDto, userId);
    }

    async getMyProfile(userId: string): Promise<Profile> {
        return this.profileRepository.getProfileByUserId(userId);
    }

    async updateMyAvatar(
        updateProfileAvatarDto: UpdateProfileAvatarDto,
        userId: string,
    ): Promise<Profile> {
        const profile = await this.profileRepository.getProfileByUserId(userId);

        const asset = await this.sendAssetRpc<AssetRecord>(
            ASSET_GET_BY_ID_PATTERN,
            {
                assetId: updateProfileAvatarDto.assetId,
                userId,
            },
        );

        if (asset.purpose !== AssetPurpose.AVATAR) {
            throw new BadRequestException(
                'Selected asset is not an avatar asset.',
            );
        }

        await this.sendAssetRpc(ASSET_ATTACH_USAGE_PATTERN, <
            AttachAssetUsagePayload
        >{
            userId,
            dto: {
                assetId: updateProfileAvatarDto.assetId,
                serviceName: 'profile',
                entityType: 'profile',
                entityId: profile.id,
                fieldName: 'avatar',
                usageRole: AssetUsageRole.PRIMARY,
                replaceExistingActiveUsage: true,
            },
        });

        const readUrl = await this.sendAssetRpc<AssetReadUrlResponse>(
            ASSET_GET_READ_URL_PATTERN,
            {
                assetId: updateProfileAvatarDto.assetId,
                userId,
            },
        );

        if (!readUrl.url) {
            throw new BadRequestException(
                'Could not resolve a readable URL for the avatar asset.',
            );
        }

        return this.profileRepository.updateAvatar(
            userId,
            updateProfileAvatarDto.assetId,
            readUrl.url,
        );
    }

    async getMyPortfolioItems(userId: string): Promise<ProfilePortfolioItem[]> {
        const profile = await this.getPhotographerProfile(userId);

        return this.profilePortfolioItemRepository.listByProfileId(profile.id);
    }

    async createMyPortfolioItem(
        dto: CreateProfilePortfolioItemDto,
        userId: string,
    ): Promise<ProfilePortfolioItem> {
        const profile = await this.getPhotographerProfile(userId);
        const resolvedAsset = await this.resolvePortfolioAsset(
            dto.assetId,
            userId,
        );
        const sortOrder =
            await this.profilePortfolioItemRepository.getNextSortOrder(
                profile.id,
            );

        const createdItem =
            await this.profilePortfolioItemRepository.createPortfolioItem({
                profileId: profile.id,
                title: dto.title.trim(),
                description: dto.description.trim(),
                assetId: dto.assetId,
                assetUrl: resolvedAsset.readUrl.url,
                assetFileName: resolvedAsset.asset.originalFilename ?? null,
                assetMimeType: resolvedAsset.asset.mimeType ?? null,
                assetSizeBytes: this.normalizeAssetSizeBytes(
                    resolvedAsset.asset.sizeBytes,
                ),
                category: dto.category.trim().toLowerCase(),
                isFeatured: dto.isFeatured ?? false,
                sortOrder,
            });

        try {
            await this.attachPortfolioAssetUsage(
                createdItem.id,
                dto.assetId,
                userId,
            );
            return createdItem;
        } catch (error) {
            await this.profilePortfolioItemRepository.deletePortfolioItem(
                createdItem.id,
                profile.id,
            );
            throw error;
        }
    }

    async updateMyPortfolioItem(
        itemId: string,
        dto: UpdateProfilePortfolioItemDto,
        userId: string,
    ): Promise<ProfilePortfolioItem> {
        const profile = await this.getPhotographerProfile(userId);
        const currentItem =
            await this.profilePortfolioItemRepository.getByIdForProfile(
                itemId,
                profile.id,
            );

        const nextValues: Partial<ProfilePortfolioItem> = {};

        if (typeof dto.title === 'string') {
            nextValues.title = dto.title.trim();
        }

        if (typeof dto.description === 'string') {
            nextValues.description = dto.description.trim();
        }

        if (typeof dto.category === 'string') {
            nextValues.category = dto.category.trim().toLowerCase();
        }

        if (typeof dto.isFeatured === 'boolean') {
            nextValues.isFeatured = dto.isFeatured;
        }

        if (dto.assetId && dto.assetId !== currentItem.assetId) {
            const resolvedAsset = await this.resolvePortfolioAsset(
                dto.assetId,
                userId,
            );

            await this.attachPortfolioAssetUsage(
                currentItem.id,
                dto.assetId,
                userId,
            );

            nextValues.assetId = dto.assetId;
            nextValues.assetUrl = resolvedAsset.readUrl.url;
            nextValues.assetFileName =
                resolvedAsset.asset.originalFilename ?? null;
            nextValues.assetMimeType = resolvedAsset.asset.mimeType ?? null;
            nextValues.assetSizeBytes = this.normalizeAssetSizeBytes(
                resolvedAsset.asset.sizeBytes,
            );
        }

        return this.profilePortfolioItemRepository.updatePortfolioItem(
            itemId,
            profile.id,
            nextValues,
        );
    }

    async deleteMyPortfolioItem(
        itemId: string,
        userId: string,
    ): Promise<{ deleted: true }> {
        const profile = await this.getPhotographerProfile(userId);
        const currentItem =
            await this.profilePortfolioItemRepository.getByIdForProfile(
                itemId,
                profile.id,
            );

        await this.detachPortfolioAssetUsage(currentItem, userId);
        await this.profilePortfolioItemRepository.deletePortfolioItem(
            currentItem.id,
            profile.id,
        );

        return { deleted: true };
    }

    private async getPhotographerProfile(userId: string): Promise<Profile> {
        const profile = await this.profileRepository.getProfileByUserId(userId);

        if (profile.role !== UserRole.PHOTOGRAPHER) {
            throw new ForbiddenException(
                'Portfolio management is only available for photographer accounts.',
            );
        }

        return profile;
    }

    private async resolvePortfolioAsset(assetId: string, userId: string) {
        const asset = await this.sendAssetRpc<AssetRecord>(
            ASSET_GET_BY_ID_PATTERN,
            {
                assetId,
                userId,
            },
        );

        if (asset.purpose !== AssetPurpose.PORTFOLIO_IMAGE) {
            throw new BadRequestException(
                'Selected asset is not a portfolio image asset.',
            );
        }

        const readUrl = await this.sendAssetRpc<AssetReadUrlResponse>(
            ASSET_GET_READ_URL_PATTERN,
            {
                assetId,
                userId,
            },
        );

        if (!readUrl.url) {
            throw new BadRequestException(
                'Could not resolve a readable URL for the portfolio asset.',
            );
        }

        return {
            asset,
            readUrl,
        };
    }

    private async attachPortfolioAssetUsage(
        portfolioItemId: string,
        assetId: string,
        userId: string,
    ) {
        await this.sendAssetRpc(ASSET_ATTACH_USAGE_PATTERN, <
            AttachAssetUsagePayload
        >{
            userId,
            dto: {
                assetId,
                serviceName: 'profile',
                entityType: 'portfolio_item',
                entityId: portfolioItemId,
                fieldName: 'primaryImage',
                usageRole: AssetUsageRole.PRIMARY,
                replaceExistingActiveUsage: true,
            },
        });
    }

    private async detachPortfolioAssetUsage(
        portfolioItem: ProfilePortfolioItem,
        userId: string,
    ) {
        const usages = await this.sendAssetRpc<AssetUsageRecord[]>(
            ASSET_GET_USAGES_PATTERN,
            {
                assetId: portfolioItem.assetId,
                userId,
            },
        );

        const activeUsage = usages.find((usage) => {
            return (
                usage.entityType === 'portfolio_item' &&
                usage.entityId === portfolioItem.id &&
                usage.fieldName === 'primaryImage' &&
                !usage.detachedAt
            );
        });

        if (!activeUsage) {
            return;
        }

        await this.sendAssetRpc(ASSET_DETACH_USAGE_PATTERN, <
            DetachAssetUsagePayload
        >{
            userId,
            usageId: activeUsage.id,
        });
    }

    private normalizeAssetSizeBytes(
        value: string | number | null | undefined,
    ): number | null {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        if (
            typeof value === 'string' &&
            value.trim() &&
            !Number.isNaN(Number(value))
        ) {
            return Number(value);
        }

        return null;
    }

    private async sendAssetRpc<T>(
        pattern: string,
        payload: unknown,
    ): Promise<T> {
        return firstValueFrom(
            this.assetClient.send<T, unknown>(pattern, payload),
        );
    }
}
