import type { ReactNode } from "react";

import { Badge } from "../../../components/ui/badge";
import { assetService } from "../../../services/asset.service";
import
    {
        PORTFOLIO_CATEGORY_LABELS,
        type PhotographerPortfolioItem,
    } from "../types/portfolio.types";

interface PortfolioItemCardProps
{
    item: PhotographerPortfolioItem;
    actions?: ReactNode;
}

const formatCreatedAt = (value: string) =>
{
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return "Unknown date";
    }

    return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const PortfolioItemCard = ({
    item,
    actions,
}: PortfolioItemCardProps) =>
{
    const isLocalPreview = item.coverAsset.source === "local-preview";

    return (
        <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <div className="aspect-[4/3] overflow-hidden bg-brand-background">
                <img
                    src={item.coverAsset.previewUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="space-y-4 p-6">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">
                        {PORTFOLIO_CATEGORY_LABELS[item.category]}
                    </Badge>

                    {item.isFeatured ? <Badge variant="accent">Featured</Badge> : null}

                    {isLocalPreview ? <Badge variant="neutral">Local preview</Badge> : null}

                    {item.galleryAssets.length ? (
                        <Badge variant="neutral">
                            +{item.galleryAssets.length} gallery
                        </Badge>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <h3 className="font-serif text-2xl text-foreground">{item.title}</h3>

                    <p className="text-sm text-muted">
                        Added {formatCreatedAt(item.createdAt)}
                    </p>
                </div>

                <p className="text-sm leading-7 text-muted">{item.description}</p>

                <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Cover image metadata
                    </p>

                    <p className="mt-2 text-sm font-medium text-foreground">
                        {item.coverAsset.fileName}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                        {item.coverAsset.mimeType} ·{" "}
                        {assetService.formatFileSize(item.coverAsset.sizeInBytes)}
                    </p>
                </div>

                {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
        </div>
    );
};