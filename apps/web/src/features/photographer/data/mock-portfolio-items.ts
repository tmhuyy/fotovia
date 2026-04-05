import { assetService } from "../../../services/asset.service";
import type { PhotographerPortfolioItem } from "../types/portfolio.types";

export const mockPortfolioItems: PhotographerPortfolioItem[] = [
    {
        id: "portfolio-1",
        title: "Golden Hour Couple Session",
        description:
            "Warm cinematic wedding portraits with soft backlight and natural movement.",
        asset: assetService.createSeededAssetPreview({
            previewUrl:
                "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
            fileName: "golden-hour-couple-session.jpg",
            mimeType: "image/jpeg",
        }),
        category: "wedding",
        isFeatured: true,
        sortOrder: 1,
        createdAt: "2026-04-05T08:00:00.000Z",
    },
    {
        id: "portfolio-2",
        title: "Modern Editorial Portrait",
        description:
            "Clean portrait direction with premium styling and a calm neutral palette.",
        asset: assetService.createSeededAssetPreview({
            previewUrl:
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
            fileName: "modern-editorial-portrait.jpg",
            mimeType: "image/jpeg",
        }),
        category: "fashion",
        isFeatured: true,
        sortOrder: 2,
        createdAt: "2026-04-05T08:10:00.000Z",
    },
    {
        id: "portfolio-3",
        title: "Private Brand Launch Coverage",
        description:
            "Event storytelling focused on atmosphere, guests, and premium detail shots.",
        asset: assetService.createSeededAssetPreview({
            previewUrl:
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
            fileName: "private-brand-launch-coverage.jpg",
            mimeType: "image/jpeg",
        }),
        category: "event",
        isFeatured: false,
        sortOrder: 3,
        createdAt: "2026-04-05T08:20:00.000Z",
    },
];
