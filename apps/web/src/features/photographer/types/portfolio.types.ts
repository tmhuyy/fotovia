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

export interface PhotographerPortfolioItem {
    id: string;
    title: string;
    description: string;
    asset: AssetPreview;
    category: PortfolioCategory;
    isFeatured: boolean;
    sortOrder: number;
    createdAt: string;
}

export interface PortfolioItemDraft {
    title: string;
    description: string;
    asset: AssetPreview | null;
    category: PortfolioCategory;
    isFeatured: boolean;
}
