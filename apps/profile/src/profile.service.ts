import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    Logger,
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
import { ProfilePortfolioItemImage } from './entities/profile-portfolio-item-image.entity';
import { ProfilePortfolioItem } from './entities/profile-portfolio-item.entity';
import { Profile } from './entities/profile.entity';
import { ProfilePortfolioItemImageRepository } from './repositories/profile-portfolio-item-image.repository';
import { ProfilePortfolioItemRepository } from './repositories/profile-portfolio-item.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { PortfolioItemClassificationService } from './classification/portfolio-item-classification.service';

const ASSET_GET_BY_ID_PATTERN = 'asset.get_by_id';
const ASSET_GET_READ_URL_PATTERN = 'asset.get_read_url';
const ASSET_ATTACH_USAGE_PATTERN = 'asset.attach_usage';
const ASSET_GET_USAGES_PATTERN = 'asset.get_usages';
const ASSET_DETACH_USAGE_PATTERN = 'asset.detach_usage';
const ASSET_DELETE_IF_ORPHANED_PATTERN = 'asset.delete_if_orphaned';

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

type PublicPhotographerSummary = {
    id: string;
    slug: string;
    name: string;
    specialty: string;
    styles: string[];
    location: string;
    bio: string;
    avatarUrl: string | null;
    rating: number | null;
    reviewCount: number | null;
    startingPrice: number | null;
    tags: string[];
};

type PublicPhotographerPortfolioItem = {
    id: string;
    title: string;
    description: string;
    coverImageUrl: string;
    galleryImages: string[];
    styleLabel: string | null;
    styleSource: 'ai' | 'legacy' | 'none';
    isFeatured: boolean;
};

type PublicPhotographerDetail = PublicPhotographerSummary & {
    intro: string;
    experienceYears: number | null;
    availability: string;
    services: [];
    portfolio: PublicPhotographerPortfolioItem[];
    testimonials: [];
    specialties: string[];
};

@Injectable()
export class ProfileService {
    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly profilePortfolioItemRepository: ProfilePortfolioItemRepository,
        private readonly profilePortfolioItemImageRepository: ProfilePortfolioItemImageRepository,
        private readonly portfolioItemClassificationService: PortfolioItemClassificationService,
        @Inject(ASSET_SERVICE) private readonly assetClient: ClientProxy,
    ) {}
    private readonly logger = new Logger(ProfileService.name);
    async createProfile(
        createProfileDto: CreateProfileDto,
        userId: string,
    ): Promise<Profile> {
        const profile = await this.profileRepository.createProfile(
            createProfileDto,
            userId,
        );

        return this.ensurePublicSlugIfNeeded(profile);
    }

    async createProfileFromSignup(
        createProfileFromAuthDto: CreateProfileFromAuthDto,
    ): Promise<Profile> {
        const profile = await this.profileRepository.createProfileFromSignup(
            createProfileFromAuthDto,
        );

        return this.ensurePublicSlugIfNeeded(profile);
    }

    async updateProfile(
        updateProfileDto: UpdateProfileDto,
        userId: string,
    ): Promise<Profile> {
        const profile = await this.profileRepository.updateProfile(
            updateProfileDto,
            userId,
        );

        return this.ensurePublicSlugIfNeeded(profile);
    }

    async getMyProfile(userId: string): Promise<Profile> {
        const profile = await this.profileRepository.getProfileByUserId(userId);

        return this.ensurePublicSlugIfNeeded(profile);
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

        const updatedProfile = await this.profileRepository.updateAvatar(
            userId,
            updateProfileAvatarDto.assetId,
            readUrl.url,
        );

        return this.ensurePublicSlugIfNeeded(updatedProfile);
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
        const coverAsset = await this.resolvePortfolioAsset(
            dto.coverAssetId,
            userId,
            'cover',
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
                assetId: dto.coverAssetId,
                assetUrl: coverAsset.readUrl.url,
                assetFileName: coverAsset.asset.originalFilename ?? null,
                assetMimeType: coverAsset.asset.mimeType ?? null,
                assetSizeBytes: this.normalizeAssetSizeBytes(
                    coverAsset.asset.sizeBytes,
                ),
                isFeatured: dto.isFeatured ?? false,
                sortOrder,
            });

        try {
            await this.attachPortfolioCoverAssetUsage(
                createdItem.id,
                dto.coverAssetId,
                userId,
            );

            await this.replacePortfolioGallery(
                {
                    ...createdItem,
                    galleryImages: [],
                } as ProfilePortfolioItem,
                dto.galleryAssetIds ?? [],
                userId,
            );

            await this.portfolioItemClassificationService.queuePortfolioItemClassification(
                {
                    portfolioItemId: createdItem.id,
                    profileId: profile.id,
                    userId,
                    trigger: 'create',
                },
            );

            return this.profilePortfolioItemRepository.getByIdForProfile(
                createdItem.id,
                profile.id,
            );
        } catch (error) {
            await this.cleanupPortfolioItemMedia(
                createdItem.id,
                dto.coverAssetId,
                dto.galleryAssetIds ?? [],
                userId,
            );

            await this.profilePortfolioItemImageRepository.deleteByPortfolioItemId(
                createdItem.id,
            );

            await this.profilePortfolioItemRepository.deletePortfolioItem(
                createdItem.id,
                profile.id,
            );

            await this.cleanupAssetsIfOrphaned(
                [dto.coverAssetId, ...(dto.galleryAssetIds ?? [])],
                userId,
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

        const previousAssetIds = [
            currentItem.assetId,
            ...(currentItem.galleryImages ?? []).map(
                (galleryImage) => galleryImage.assetId,
            ),
        ];

        const nextValues: Partial<ProfilePortfolioItem> = {};

        if (typeof dto.title === 'string') {
            nextValues.title = dto.title.trim();
        }

        if (typeof dto.description === 'string') {
            nextValues.description = dto.description.trim();
        }

        if (typeof dto.isFeatured === 'boolean') {
            nextValues.isFeatured = dto.isFeatured;
        }

        if (dto.coverAssetId && dto.coverAssetId !== currentItem.assetId) {
            const coverAsset = await this.resolvePortfolioAsset(
                dto.coverAssetId,
                userId,
                'cover',
            );

            await this.attachPortfolioCoverAssetUsage(
                currentItem.id,
                dto.coverAssetId,
                userId,
            );

            nextValues.assetId = dto.coverAssetId;
            nextValues.assetUrl = coverAsset.readUrl.url;
            nextValues.assetFileName =
                coverAsset.asset.originalFilename ?? null;
            nextValues.assetMimeType = coverAsset.asset.mimeType ?? null;
            nextValues.assetSizeBytes = this.normalizeAssetSizeBytes(
                coverAsset.asset.sizeBytes,
            );
        }

        await this.profilePortfolioItemRepository.updatePortfolioItem(
            itemId,
            profile.id,
            nextValues,
        );

        if (dto.galleryAssetIds) {
            const updatedItem =
                await this.profilePortfolioItemRepository.getByIdForProfile(
                    itemId,
                    profile.id,
                );

            await this.replacePortfolioGallery(
                updatedItem,
                dto.galleryAssetIds,
                userId,
            );
        }

        const refreshedItem =
            await this.profilePortfolioItemRepository.getByIdForProfile(
                itemId,
                profile.id,
            );

        const nextAssetIds = [
            refreshedItem.assetId,
            ...(refreshedItem.galleryImages ?? []).map(
                (galleryImage) => galleryImage.assetId,
            ),
        ];

        const removedAssetIds = previousAssetIds.filter((assetId) => {
            return !nextAssetIds.includes(assetId);
        });

        await this.cleanupAssetsIfOrphaned(removedAssetIds, userId);

        const shouldReclassify = this.hasPortfolioMediaChanged(
            currentItem,
            dto,
        );

        if (shouldReclassify) {
            await this.portfolioItemClassificationService.queuePortfolioItemClassification(
                {
                    portfolioItemId: itemId,
                    profileId: profile.id,
                    userId,
                    trigger: 'update',
                },
            );

            return this.profilePortfolioItemRepository.getByIdForProfile(
                itemId,
                profile.id,
            );
        }

        return refreshedItem;
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

        const assetIdsToCleanup = [
            currentItem.assetId,
            ...(currentItem.galleryImages ?? []).map(
                (galleryImage) => galleryImage.assetId,
            ),
        ];

        await this.detachPortfolioAssetUsageByField(
            currentItem.id,
            currentItem.assetId,
            ['coverImage', 'primaryImage'],
            userId,
        );

        for (const galleryImage of currentItem.galleryImages ?? []) {
            await this.detachPortfolioAssetUsageByField(
                currentItem.id,
                galleryImage.assetId,
                ['gallery'],
                userId,
            );
        }

        await this.profilePortfolioItemImageRepository.deleteByPortfolioItemId(
            currentItem.id,
        );

        await this.profilePortfolioItemRepository.deletePortfolioItem(
            currentItem.id,
            profile.id,
        );

        await this.cleanupAssetsIfOrphaned(assetIdsToCleanup, userId);

        return { deleted: true };
    }

    async getPublicPhotographers(): Promise<PublicPhotographerSummary[]> {
        const profiles =
            await this.profileRepository.listPublicPhotographerProfiles();
        const hydratedProfiles: Profile[] = [];

        for (const profile of profiles) {
            hydratedProfiles.push(await this.ensurePublicSlugIfNeeded(profile));
        }

        return hydratedProfiles.map((profile) =>
            this.buildPublicPhotographerSummary(profile),
        );
    }

    async getPublicPhotographerBySlug(
        slug: string,
    ): Promise<PublicPhotographerDetail> {
        const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
        const profile =
            await this.profileRepository.getPublicPhotographerBySlug(
                normalizedSlug,
            );

        const hydratedProfile = await this.ensurePublicSlugIfNeeded(profile);
        const portfolioItems =
            await this.profilePortfolioItemRepository.listPublicByProfileId(
                hydratedProfile.id,
            );

        return this.buildPublicPhotographerDetail(
            hydratedProfile,
            portfolioItems,
        );
    }

    private async getPhotographerProfile(userId: string): Promise<Profile> {
        const profile = await this.profileRepository.getProfileByUserId(userId);

        if (profile.role !== UserRole.PHOTOGRAPHER) {
            throw new ForbiddenException(
                'Portfolio management is only available for photographer accounts.',
            );
        }

        return this.ensurePublicSlugIfNeeded(profile);
    }

    private async resolvePortfolioAsset(
        assetId: string,
        userId: string,
        target: 'cover' | 'gallery',
    ) {
        const asset = await this.sendAssetRpc<AssetRecord>(
            ASSET_GET_BY_ID_PATTERN,
            {
                assetId,
                userId,
            },
        );

        const isAcceptedCoverPurpose =
            asset.purpose === AssetPurpose.PORTFOLIO_COVER ||
            asset.purpose === AssetPurpose.PORTFOLIO_IMAGE;

        const isAcceptedGalleryPurpose =
            asset.purpose === AssetPurpose.PORTFOLIO_IMAGE;

        if (target === 'cover' && !isAcceptedCoverPurpose) {
            throw new BadRequestException(
                'Selected asset is not a valid portfolio cover asset.',
            );
        }

        if (target === 'gallery' && !isAcceptedGalleryPurpose) {
            throw new BadRequestException(
                'Selected asset is not a valid portfolio gallery asset.',
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

    private async attachPortfolioCoverAssetUsage(
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
                fieldName: 'coverImage',
                usageRole: AssetUsageRole.PRIMARY,
                replaceExistingActiveUsage: true,
            },
        });
    }

    private async attachPortfolioGalleryAssetUsage(
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
                fieldName: 'gallery',
                usageRole: AssetUsageRole.PRIMARY,
                replaceExistingActiveUsage: false,
            },
        });
    }

    private async replacePortfolioGallery(
        portfolioItem: ProfilePortfolioItem,
        galleryAssetIds: string[],
        userId: string,
    ) {
        const nextGalleryAssetIds = Array.from(
            new Set(
                (galleryAssetIds ?? [])
                    .map((value) => value?.trim())
                    .filter(Boolean),
            ),
        );

        for (const galleryImage of portfolioItem.galleryImages ?? []) {
            await this.detachPortfolioAssetUsageByField(
                portfolioItem.id,
                galleryImage.assetId,
                ['gallery'],
                userId,
            );
        }

        await this.profilePortfolioItemImageRepository.deleteByPortfolioItemId(
            portfolioItem.id,
        );

        if (nextGalleryAssetIds.length === 0) {
            return;
        }

        const resolvedGalleryAssets = await Promise.all(
            nextGalleryAssetIds.map((assetId) =>
                this.resolvePortfolioAsset(assetId, userId, 'gallery'),
            ),
        );

        for (const assetId of nextGalleryAssetIds) {
            await this.attachPortfolioGalleryAssetUsage(
                portfolioItem.id,
                assetId,
                userId,
            );
        }

        await this.profilePortfolioItemImageRepository.replaceGalleryImages(
            portfolioItem.id,
            resolvedGalleryAssets.map(({ asset, readUrl }, index) => ({
                portfolioItemId: portfolioItem.id,
                assetId: asset.id,
                assetUrl: readUrl.url,
                assetFileName: asset.originalFilename ?? null,
                assetMimeType: asset.mimeType ?? null,
                assetSizeBytes: this.normalizeAssetSizeBytes(asset.sizeBytes),
                sortOrder: index + 1,
            })),
        );
    }

    private async cleanupPortfolioItemMedia(
        portfolioItemId: string,
        coverAssetId: string,
        galleryAssetIds: string[],
        userId: string,
    ) {
        await this.detachPortfolioAssetUsageByField(
            portfolioItemId,
            coverAssetId,
            ['coverImage', 'primaryImage'],
            userId,
        );

        for (const galleryAssetId of galleryAssetIds ?? []) {
            await this.detachPortfolioAssetUsageByField(
                portfolioItemId,
                galleryAssetId,
                ['gallery'],
                userId,
            );
        }
    }

    private async detachPortfolioAssetUsageByField(
        portfolioItemId: string,
        assetId: string,
        fieldNames: string[],
        userId: string,
    ) {
        const usages = await this.sendAssetRpc<AssetUsageRecord[]>(
            ASSET_GET_USAGES_PATTERN,
            {
                assetId,
                userId,
            },
        );

        const matchingUsages = usages.filter((usage) => {
            return (
                usage.entityType === 'portfolio_item' &&
                usage.entityId === portfolioItemId &&
                fieldNames.includes(usage.fieldName) &&
                !usage.detachedAt
            );
        });

        for (const usage of matchingUsages) {
            await this.sendAssetRpc(ASSET_DETACH_USAGE_PATTERN, <
                DetachAssetUsagePayload
            >{
                userId,
                usageId: usage.id,
            });
        }
    }

    private async ensurePublicSlugIfNeeded(profile: Profile): Promise<Profile> {
        if (profile.role !== UserRole.PHOTOGRAPHER) {
            return profile;
        }

        const hasMeaningfulName = Boolean(profile.fullName?.trim());
        const fallbackSlug = this.buildFallbackPhotographerSlug(profile.id);
        const shouldRegenerate =
            !profile.slug ||
            (profile.slug === fallbackSlug && hasMeaningfulName);

        if (!shouldRegenerate) {
            return profile;
        }

        const slugBase = this.slugify(profile.fullName ?? '') || fallbackSlug;
        const nextSlug = await this.buildUniqueSlug(slugBase, profile.id);

        if (profile.slug === nextSlug) {
            return profile;
        }

        return this.profileRepository.updateSlug(profile.id, nextSlug);
    }

    private async buildUniqueSlug(
        slugBase: string,
        excludeProfileId?: string,
    ): Promise<string> {
        let candidate = slugBase;
        let suffix = 2;

        while (
            await this.profileRepository.isSlugTaken(
                candidate,
                excludeProfileId,
            )
        ) {
            candidate = `${slugBase}-${suffix}`;
            suffix += 1;
        }

        return candidate;
    }

    private slugify(value: string): string {
        return value
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    private buildFallbackPhotographerSlug(profileId: string): string {
        return `photographer-${profileId.slice(0, 8)}`;
    }

    private buildPublicPhotographerSummary(
        profile: Profile,
    ): PublicPhotographerSummary {
        const specialties = this.normalizeSpecialties(profile.specialties);
        const specialty = specialties[0] ?? 'Photography';
        const displayName = profile.fullName?.trim() || 'Photographer';
        const location = profile.location?.trim() || 'Location updating soon';
        const bio =
            profile.bio?.trim() ||
            'This photographer is preparing their public Fotovia profile.';
        const price = this.normalizeMoneyValue(profile.pricePerHour);

        return {
            id: profile.id,
            slug:
                profile.slug ?? this.buildFallbackPhotographerSlug(profile.id),
            name: displayName,
            specialty,
            styles: specialties,
            location,
            bio,
            avatarUrl: profile.avatarUrl ?? null,
            rating: null,
            reviewCount: null,
            startingPrice: price,
            tags: specialties.slice(0, 3),
        };
    }

    private buildPublicPhotographerDetail(
        profile: Profile,
        portfolioItems: ProfilePortfolioItem[],
    ): PublicPhotographerDetail {
        const summary = this.buildPublicPhotographerSummary(profile);
        const specialties = this.normalizeSpecialties(profile.specialties);
        const intro =
            profile.bio?.trim() ||
            `${summary.name} is building a public Fotovia profile with saved portfolio work and booking-ready details.`;

        return {
            ...summary,
            intro,
            experienceYears:
                typeof profile.experienceYears === 'number'
                    ? profile.experienceYears
                    : null,
            availability: 'Open to booking requests on Fotovia',
            services: [],
            testimonials: [],
            specialties,
            portfolio: portfolioItems.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                coverImageUrl: item.assetUrl,
                galleryImages: (item.galleryImages ?? []).map(
                    (galleryImage) => galleryImage.assetUrl,
                ),
                styleLabel: this.resolvePortfolioStyleLabel(item),
                styleSource: this.resolvePortfolioStyleSource(item),
                isFeatured: item.isFeatured,
            })),
        };
    }

    private normalizeSpecialties(
        values: string[] | null | undefined,
    ): string[] {
        if (!Array.isArray(values)) {
            return [];
        }

        return Array.from(
            new Set(
                values
                    .filter(
                        (value): value is string => typeof value === 'string',
                    )
                    .map((value) => value.trim())
                    .filter(Boolean)
                    .map((value) => this.toDisplayLabel(value)),
            ),
        );
    }

    private normalizeMoneyValue(
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

    private async cleanupAssetsIfOrphaned(assetIds: string[], userId: string) {
        const uniqueAssetIds = Array.from(
            new Set(
                (assetIds ?? [])
                    .map((assetId) => assetId?.trim())
                    .filter(Boolean),
            ),
        );

        for (const assetId of uniqueAssetIds) {
            try {
                await this.sendAssetRpc(ASSET_DELETE_IF_ORPHANED_PATTERN, {
                    assetId,
                    userId,
                });
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Unknown cleanup error';

                this.logger.warn(
                    `Failed to clean up orphaned asset ${assetId}: ${message}`,
                );
            }
        }
    }

    private normalizeAssetIdList(assetIds: string[]): string[] {
        return [...assetIds].sort();
    }

    private hasPortfolioMediaChanged(
        currentItem: ProfilePortfolioItem,
        dto: UpdateProfilePortfolioItemDto,
    ): boolean {
        const nextCoverAssetId = dto.coverAssetId ?? currentItem.assetId;

        const currentGalleryAssetIds = this.normalizeAssetIdList(
            (currentItem.galleryImages ?? []).map((image) => image.assetId),
        );

        const nextGalleryAssetIds = this.normalizeAssetIdList(
            typeof dto.galleryAssetIds !== 'undefined'
                ? dto.galleryAssetIds
                : (currentItem.galleryImages ?? []).map(
                      (image) => image.assetId,
                  ),
        );

        const hasCoverChanged = nextCoverAssetId !== currentItem.assetId;
        const hasGalleryChanged =
            JSON.stringify(currentGalleryAssetIds) !==
            JSON.stringify(nextGalleryAssetIds);

        return hasCoverChanged || hasGalleryChanged;
    }

    private resolvePortfolioStyleLabel(
        item: Pick<ProfilePortfolioItem, 'detectedPrimaryStyle' | 'category'>,
    ): string | null {
        const detectedPrimaryStyle =
            typeof item.detectedPrimaryStyle === 'string'
                ? item.detectedPrimaryStyle.trim()
                : '';

        if (detectedPrimaryStyle) {
            return this.toDisplayLabel(detectedPrimaryStyle);
        }

        const legacyCategory =
            typeof item.category === 'string' ? item.category.trim() : '';

        if (legacyCategory) {
            return this.toDisplayLabel(legacyCategory);
        }

        return null;
    }

    private resolvePortfolioStyleSource(
        item: Pick<ProfilePortfolioItem, 'detectedPrimaryStyle' | 'category'>,
    ): 'ai' | 'legacy' | 'none' {
        if (
            typeof item.detectedPrimaryStyle === 'string' &&
            item.detectedPrimaryStyle.trim().length > 0
        ) {
            return 'ai';
        }

        if (
            typeof item.category === 'string' &&
            item.category.trim().length > 0
        ) {
            return 'legacy';
        }

        return 'none';
    }

    private toDisplayLabel(value: string): string {
        return value
            .split(/[\s-_]+/)
            .map((part) => part.trim())
            .filter((part) => part.length > 0)
            .map(
                (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
            )
            .join(' ');
    }
}
