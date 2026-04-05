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
    imageUrl: string;
    category: string;
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
        @Inject(ASSET_SERVICE) private readonly assetClient: ClientProxy,
    ) {}

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
                imageUrl: item.assetUrl,
                category: this.toDisplayLabel(item.category),
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

    private toDisplayLabel(value: string): string {
        return value
            .split(/[\s-_]+/)
            .filter(Boolean)
            .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
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
}
