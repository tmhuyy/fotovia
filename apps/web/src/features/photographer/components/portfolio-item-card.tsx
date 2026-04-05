import { Badge } from "../../../components/ui/badge";
import {
    PORTFOLIO_CATEGORY_LABELS,
    type PhotographerPortfolioItem,
} from "../types/portfolio.types";

interface PortfolioItemCardProps {
    item: PhotographerPortfolioItem;
}

export const PortfolioItemCard = ({ item }: PortfolioItemCardProps) => {
    return (
        <article className="overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
                <img
                    src={item.imageUrl}
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
                </div>
            </div>

            <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
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
            </div>
        </article>
    );
};
