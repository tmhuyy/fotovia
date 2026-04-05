import type { PhotographerPortfolioItem } from "../types/portfolio.types";

const PORTFOLIO_STORAGE_KEY = "fotovia.photographerPortfolio.v1";

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isValidPortfolioItem = (
    value: unknown,
): value is PhotographerPortfolioItem => {
    if (!isObject(value) || !isObject(value.asset)) {
        return false;
    }

    return (
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        typeof value.description === "string" &&
        typeof value.category === "string" &&
        typeof value.isFeatured === "boolean" &&
        typeof value.sortOrder === "number" &&
        typeof value.createdAt === "string" &&
        typeof value.asset.id === "string" &&
        typeof value.asset.previewUrl === "string" &&
        typeof value.asset.fileName === "string" &&
        typeof value.asset.mimeType === "string" &&
        typeof value.asset.sizeInBytes === "number" &&
        typeof value.asset.source === "string" &&
        typeof value.asset.status === "string" &&
        typeof value.asset.createdAt === "string"
    );
};

export const portfolioStorage = {
    load(): PhotographerPortfolioItem[] {
        if (typeof window === "undefined") {
            return [];
        }

        try {
            const rawValue = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);

            if (!rawValue) {
                return [];
            }

            const parsed = JSON.parse(rawValue);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed.filter(isValidPortfolioItem);
        } catch {
            return [];
        }
    },

    save(items: PhotographerPortfolioItem[]) {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(
            PORTFOLIO_STORAGE_KEY,
            JSON.stringify(items),
        );
    },

    clear() {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    },
};
