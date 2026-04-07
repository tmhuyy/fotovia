import { isAxiosError } from "axios";

import type { AssetPreview } from "../features/asset/types/asset.types";
import type {
    PhotographerDetail,
    PhotographerPortfolioShowcaseItem,
    PhotographerPortfolioStyleSource,
    PhotographerService as PhotographerServiceItem,
    PhotographerTestimonial,
} from "../features/photographer/types/photographer-detail.types";
import type { PhotographerProfile } from "../features/photographer/types/photographer.types";
import {
    PORTFOLIO_ITEM_CLASSIFICATION_STATUSES,
    type PhotographerPortfolioItem,
    type PortfolioItemClassificationStatus,
    type PortfolioItemMutationPayload,
    type PortfolioStyleDistributionEntry,
} from "../features/photographer/types/portfolio.types";
import { assetService } from "./asset.service";
import { profileClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";

type AnyRecord = Record<string, unknown>;

const PHOTOGRAPHER_ENDPOINTS = {
    portfolioItems: "/profiles/me/portfolio-items",
    retryPortfolioItemClassification: (itemId: string) =>
        `/profiles/me/portfolio-items/${itemId}/retry-classification`,
    publicPhotographers: "/profiles/public/photographers",
    publicPhotographerBySlug: (slug: string) =>
        `/profiles/public/photographers/${encodeURIComponent(slug)}`,
};

const normalizeString = (value: unknown): string => {
    return typeof value === "string" ? value : "";
};

const normalizeNullableString = (value: unknown): string | null => {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const normalizeNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (
        typeof value === "string" &&
        value.trim() &&
        !Number.isNaN(Number(value))
    ) {
        return Number(value);
    }

    return null;
};

const normalizeBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        return value.toLowerCase() === "true";
    }

    return false;
};

const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
};

const normalizeClassificationStatus = (
    value: unknown,
): PortfolioItemClassificationStatus => {
    if (
        typeof value === "string" &&
        PORTFOLIO_ITEM_CLASSIFICATION_STATUSES.includes(
            value as PortfolioItemClassificationStatus,
        )
    ) {
        return value as PortfolioItemClassificationStatus;
    }

    return "not_requested";
};

const normalizePortfolioStyleSource = (
    value: unknown,
    fallback: PhotographerPortfolioStyleSource = "none",
): PhotographerPortfolioStyleSource => {
    if (value === "ai" || value === "legacy" || value === "none") {
        return value;
    }

    return fallback;
};

const normalizeIsoDate = (value: unknown): string | null => {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const normalizeStyleDistribution = (
    value: unknown,
): PortfolioStyleDistributionEntry[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            const record = (entry as AnyRecord | undefined) ?? {};
            const label = normalizeString(record.label).trim();
            const score = normalizeNumber(record.score);

            if (!label || score === null) {
                return null;
            }

            return {
                label,
                score,
            } satisfies PortfolioStyleDistributionEntry;
        })
        .filter(
            (entry): entry is PortfolioStyleDistributionEntry => entry !== null,
        );
};

const normalizeSecondaryStyleLabels = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            if (typeof entry === "string") {
                return entry.trim();
            }

            const record = (entry as AnyRecord | undefined) ?? {};
            const label = normalizeNullableString(record.label);

            return label ?? "";
        })
        .filter(Boolean);
};

const normalizeUploadedAssetPreview = (payload: AnyRecord): AssetPreview => {
    const assetId = normalizeString(payload.assetId);
    const assetUrl = normalizeString(payload.assetUrl);
    const assetFileName =
        normalizeNullableString(payload.assetFileName) ?? "portfolio-image.jpg";
    const assetMimeType =
        normalizeNullableString(payload.assetMimeType) ?? "image/jpeg";
    const assetSizeBytes = normalizeNumber(payload.assetSizeBytes) ?? 0;
    const createdAt =
        typeof payload.createdAt === "string"
            ? payload.createdAt
            : new Date().toISOString();

    return assetService.createUploadedAssetPreview({
        assetId,
        previewUrl: assetUrl,
        fileName: assetFileName,
        mimeType: assetMimeType,
        sizeInBytes: assetSizeBytes,
        createdAt,
    });
};

const normalizeGalleryAssets = (value: unknown): AssetPreview[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item) =>
        normalizeUploadedAssetPreview((item as AnyRecord | undefined) ?? {}),
    );
};

const normalizePortfolioItem = (
    payload: AnyRecord,
): PhotographerPortfolioItem => {
    return {
        id: normalizeString(payload.id),
        title: normalizeString(payload.title),
        description: normalizeString(payload.description),
        coverAsset: normalizeUploadedAssetPreview({
            assetId: payload.assetId,
            assetUrl: payload.assetUrl,
            assetFileName: payload.assetFileName,
            assetMimeType: payload.assetMimeType,
            assetSizeBytes: payload.assetSizeBytes,
            createdAt: payload.createdAt,
        }),
        galleryAssets: normalizeGalleryAssets(payload.galleryImages),
        isFeatured: normalizeBoolean(payload.isFeatured),
        sortOrder: normalizeNumber(payload.sortOrder) ?? 0,
        createdAt:
            typeof payload.createdAt === "string"
                ? payload.createdAt
                : new Date().toISOString(),
        updatedAt:
            typeof payload.updatedAt === "string"
                ? payload.updatedAt
                : undefined,
        classificationStatus: normalizeClassificationStatus(
            payload.classificationStatus,
        ),
        classificationError: normalizeNullableString(
            payload.classificationError,
        ),
        classificationRequestedAt: normalizeIsoDate(
            payload.classificationRequestedAt,
        ),
        classificationStartedAt: normalizeIsoDate(
            payload.classificationStartedAt,
        ),
        classificationCompletedAt: normalizeIsoDate(
            payload.classificationCompletedAt,
        ),
        classificationFailedAt: normalizeIsoDate(
            payload.classificationFailedAt,
        ),
        detectedPrimaryStyle: normalizeNullableString(
            payload.detectedPrimaryStyle,
        ),
        detectedPrimaryScore: normalizeNumber(payload.detectedPrimaryScore),
        detectedSecondaryStyles: normalizeSecondaryStyleLabels(
            payload.detectedSecondaryStyles,
        ),
        detectedStyleDistribution: normalizeStyleDistribution(
            payload.detectedStyleDistribution,
        ),
    };
};

const normalizePhotographerProfile = (
    payload: AnyRecord,
): PhotographerProfile => {
    return {
        id: normalizeString(payload.id),
        slug: normalizeString(payload.slug),
        name: normalizeString(payload.name) || "Photographer",
        specialty: normalizeString(payload.specialty) || "Photography",
        styles: normalizeStringArray(payload.styles),
        location: normalizeString(payload.location) || "Location updating soon",
        bio:
            normalizeString(payload.bio) ||
            "This photographer is preparing their public Fotovia profile.",
        avatarUrl: normalizeNullableString(payload.avatarUrl),
        rating: normalizeNumber(payload.rating),
        reviewCount: normalizeNumber(payload.reviewCount),
        startingPrice: normalizeNumber(payload.startingPrice),
        tags: normalizeStringArray(payload.tags),
    };
};

const normalizeServices = (value: unknown): PhotographerServiceItem[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item) => {
        const record = (item as AnyRecord | undefined) ?? {};

        return {
            title: normalizeString(record.title),
            description: normalizeString(record.description),
            duration: normalizeString(record.duration),
            startingPrice: normalizeNumber(record.startingPrice) ?? 0,
        };
    });
};

const normalizeTestimonials = (value: unknown): PhotographerTestimonial[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item) => {
        const record = (item as AnyRecord | undefined) ?? {};

        return {
            name: normalizeString(record.name),
            context: normalizeString(record.context),
            quote: normalizeString(record.quote),
        };
    });
};

const normalizePortfolioShowcaseItem = (
    payload: AnyRecord,
): PhotographerPortfolioShowcaseItem => {
    const explicitStyleLabel = normalizeNullableString(payload.styleLabel);
    const legacyCategory = normalizeNullableString(payload.category);
    const styleLabel = explicitStyleLabel ?? legacyCategory;
    const fallbackSource: PhotographerPortfolioStyleSource = explicitStyleLabel
        ? "ai"
        : legacyCategory
          ? "legacy"
          : "none";

    return {
        id: normalizeString(payload.id),
        title: normalizeString(payload.title) || "Saved portfolio work",
        description: normalizeString(payload.description),
        coverImageUrl: normalizeString(payload.coverImageUrl),
        galleryImages: Array.isArray(payload.galleryImages)
            ? payload.galleryImages.filter(
                  (item): item is string => typeof item === "string",
              )
            : [],
        styleLabel,
        styleSource: normalizePortfolioStyleSource(
            payload.styleSource,
            fallbackSource,
        ),
        isFeatured: normalizeBoolean(payload.isFeatured),
    };
};

const normalizePhotographerDetail = (
    payload: AnyRecord,
): PhotographerDetail => {
    const summary = normalizePhotographerProfile(payload);
    const portfolioRaw = Array.isArray(payload.portfolio)
        ? payload.portfolio
        : [];

    return {
        ...summary,
        intro:
            normalizeString(payload.intro) ||
            summary.bio ||
            `${summary.name} is building a public Fotovia profile.`,
        experienceYears: normalizeNumber(payload.experienceYears),
        availability:
            normalizeString(payload.availability) ||
            "Open to booking requests on Fotovia",
        services: normalizeServices(payload.services),
        portfolio: portfolioRaw.map((item) =>
            normalizePortfolioShowcaseItem(
                (item as AnyRecord | undefined) ?? {},
            ),
        ),
        testimonials: normalizeTestimonials(payload.testimonials),
        specialties: normalizeStringArray(payload.specialties),
    };
};

export const photographerService = {
    async getMyPortfolioItems(): Promise<PhotographerPortfolioItem[]> {
        const response = await profileClient.get<
            ApiResponse<unknown> | unknown
        >(PHOTOGRAPHER_ENDPOINTS.portfolioItems);
        const data = unwrapResponse<unknown>(response.data);

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map((item) =>
            normalizePortfolioItem((item as AnyRecord | undefined) ?? {}),
        );
    },

    async createMyPortfolioItem(
        payload: PortfolioItemMutationPayload,
    ): Promise<PhotographerPortfolioItem> {
        const response = await profileClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(PHOTOGRAPHER_ENDPOINTS.portfolioItems, payload);
        const data = unwrapResponse<AnyRecord>(response.data);

        return normalizePortfolioItem(data);
    },

    async updateMyPortfolioItem(
        itemId: string,
        payload: PortfolioItemMutationPayload,
    ): Promise<PhotographerPortfolioItem> {
        const response = await profileClient.patch<
            ApiResponse<AnyRecord> | AnyRecord
        >(`${PHOTOGRAPHER_ENDPOINTS.portfolioItems}/${itemId}`, payload);
        const data = unwrapResponse<AnyRecord>(response.data);

        return normalizePortfolioItem(data);
    },

    async retryMyPortfolioItemClassification(
        itemId: string,
    ): Promise<PhotographerPortfolioItem> {
        const response = await profileClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(PHOTOGRAPHER_ENDPOINTS.retryPortfolioItemClassification(itemId));
        const data = unwrapResponse<AnyRecord>(response.data);

        return normalizePortfolioItem(data);
    },

    async deleteMyPortfolioItem(itemId: string): Promise<void> {
        await profileClient.delete(
            `${PHOTOGRAPHER_ENDPOINTS.portfolioItems}/${itemId}`,
        );
    },

    async getPublicPhotographers(): Promise<PhotographerProfile[]> {
        const response = await profileClient.get<
            ApiResponse<unknown> | unknown
        >(PHOTOGRAPHER_ENDPOINTS.publicPhotographers);
        const data = unwrapResponse<unknown>(response.data);

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map((item) =>
            normalizePhotographerProfile((item as AnyRecord | undefined) ?? {}),
        );
    },

    async getPublicPhotographerDetailBySlug(
        slug: string,
    ): Promise<PhotographerDetail | null> {
        try {
            const response = await profileClient.get<
                ApiResponse<AnyRecord> | AnyRecord
            >(PHOTOGRAPHER_ENDPOINTS.publicPhotographerBySlug(slug));
            const data = unwrapResponse<AnyRecord>(response.data);

            return normalizePhotographerDetail(data);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return null;
            }

            throw error;
        }
    },
};
