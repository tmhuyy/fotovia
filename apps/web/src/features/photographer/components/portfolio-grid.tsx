import type { ReactNode } from "react";

import type { PhotographerPortfolioItem } from "../types/portfolio.types";
import { PortfolioItemCard } from "./portfolio-item-card";

interface PortfolioGridProps {
    items: PhotographerPortfolioItem[];
    renderActions?: (
        item: PhotographerPortfolioItem,
        index: number,
    ) => ReactNode;
}

export const PortfolioGrid = ({ items, renderActions }: PortfolioGridProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
                <PortfolioItemCard
                    key={item.id}
                    item={item}
                    actions={renderActions?.(item, index)}
                />
            ))}
        </div>
    );
};
