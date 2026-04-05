import { Badge } from "../../../components/ui/badge";
import { assetService } from "../../../services/asset.service";
import {
    PORTFOLIO_CATEGORY_LABELS,
    type PhotographerPortfolioItem,
} from "../types/portfolio.types";

interface PortfolioItemCardProps {
    item: PhotographerPortfolioItem;
}

export const PortfolioItemCard = ({ item }: PortfolioItemCardProps) => {
    const isLocalPreview = item.asset.source === "local-preview";

    return (
        <article className="overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
                <img
                    src={item.asset.previewUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge variant="neutral">
                        {PORTFOLIO_CATEGORY_LABELS[item.category]}
                    </Badge>

                    {item.isFeatured ? (
                        <Badge variant="accent">Featured</Badge>
                    ) : null}

                    {isLocalPreview ? (
                        <Badge variant="neutral">Local preview</Badge>
                    ) : null}
                </div>
            </div>

            <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-foreground">
                            {item.title}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                            Sort order {item.sortOrder}
                        </p>
                    </div>
                </div>

                <p className="text-sm leading-7 text-muted">
                    {item.description}
                </p>

                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Asset metadata
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-foreground">
                        {item.asset.fileName}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                        {item.asset.mimeType} ·{" "}
                        {assetService.formatFileSize(item.asset.sizeInBytes)}
                    </p>
                </div>
            </div>
        </article>
    );
};
