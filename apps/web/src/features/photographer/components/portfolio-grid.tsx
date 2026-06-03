import type { ReactNode } from "react";

import type { PhotographerPortfolioItem } from "../types/portfolio.types";
import { PortfolioItemCard } from "./portfolio-item-card";

interface PortfolioGridProps
{
    items: PhotographerPortfolioItem[];
    renderActions?: (item: PhotographerPortfolioItem, index: number) => ReactNode;
    onOpenItem?: (item: PhotographerPortfolioItem) => void;
}

export const PortfolioGrid = ({
    items,
    renderActions: _renderActions,
    onOpenItem,
}: PortfolioGridProps) =>
{
    return (
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
                <PortfolioItemCard
                    key={item.id}
                    item={item}
                    onOpen={() => onOpenItem?.(item)}
                />
            ))}
        </div>
    );
};