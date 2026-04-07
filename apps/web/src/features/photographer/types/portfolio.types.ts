import type { AssetPreview } from "../../asset/types/asset.types";

export const PORTFOLIO_CATEGORIES = [
    "aerial",
    "architecture",
    "event",
    "fashion",
    "food",
    "nature",
    "sports",
    "street",
    "wedding",
    "wildlife",
] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export const PORTFOLIO_CATEGORY_LABELS: Record<PortfolioCategory, string> = {
    aerial: "Aerial",
    architecture: "Architecture",
    event: "Event",
    fashion: "Fashion",
    food: "Food",
    nature: "Nature",
    sports: "Sports",
    street: "Street",
    wedding: "Wedding",
    wildlife: "Wildlife",
};

export const PORTFOLIO_ITEM_CLASSIFICATION_STATUSES = [
    "not_requested",
    "queued",
    "processing",
    "completed",
    "failed",
] as const;

export type PortfolioItemClassificationStatus =
    (typeof PORTFOLIO_ITEM_CLASSIFICATION_STATUSES)[number];

export interface PortfolioStyleDistributionEntry {
    label: string;
    score: number;
}

export interface PhotographerPortfolioItem {
    id: string;
    title: string;
    description: string;
    coverAsset: AssetPreview;
    galleryAssets: AssetPreview[];
    category: PortfolioCategory;
    isFeatured: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt?: string;
    classificationStatus: PortfolioItemClassificationStatus;
    classificationError: string | null;
    classificationRequestedAt: string | null;
    classificationStartedAt: string | null;
    classificationCompletedAt: string | null;
    classificationFailedAt: string | null;
    detectedPrimaryStyle: string | null;
    detectedPrimaryScore: number | null;
    detectedSecondaryStyles: string[];
    detectedStyleDistribution: PortfolioStyleDistributionEntry[];
}

export interface PortfolioItemDraft {
    title: string;
    description: string;
    coverAsset: AssetPreview | null;
    galleryAssets: AssetPreview[];
    category: PortfolioCategory;
    isFeatured: boolean;
}

export interface PortfolioItemMutationPayload {
    title: string;
    description: string;
    coverAssetId: string;
    galleryAssetIds: string[];
    category: PortfolioCategory;
    isFeatured: boolean;
}
