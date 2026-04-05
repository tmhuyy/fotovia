import type { AssetPreview } from "../features/asset/types/asset.types";
import {
    PORTFOLIO_CATEGORIES,
    type PhotographerPortfolioItem,
    type PortfolioCategory,
    type PortfolioItemMutationPayload,
} from "../features/photographer/types/portfolio.types";
import { assetService } from "./asset.service";
import { profileClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";

type AnyRecord = Record<string, unknown>;

const PHOTOGRAPHER_ENDPOINTS = {
    portfolioItems: "/profiles/me/portfolio-items",
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

const normalizeCategory = (value: unknown): PortfolioCategory => {
    if (
        typeof value === "string" &&
        PORTFOLIO_CATEGORIES.includes(value as PortfolioCategory)
    ) {
        return value as PortfolioCategory;
    }

    return "wedding";
};

const normalizeAssetPreview = (payload: AnyRecord): AssetPreview => {
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

const normalizePortfolioItem = (
    payload: AnyRecord,
): PhotographerPortfolioItem => {
    return {
        id: normalizeString(payload.id),
        title: normalizeString(payload.title),
        description: normalizeString(payload.description),
        asset: normalizeAssetPreview(payload),
        category: normalizeCategory(payload.category),
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

        return data.map((item) => normalizePortfolioItem(item as AnyRecord));
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

    async deleteMyPortfolioItem(itemId: string): Promise<void> {
        await profileClient.delete(
            `${PHOTOGRAPHER_ENDPOINTS.portfolioItems}/${itemId}`,
        );
    },
};
