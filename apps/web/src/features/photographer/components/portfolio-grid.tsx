import type { PhotographerPortfolioItem } from "../types/portfolio.types";
import { PortfolioItemCard } from "./portfolio-item-card";

interface PortfolioGridProps
{
    items: PhotographerPortfolioItem[];
    onOpenItem?: (item: PhotographerPortfolioItem) => void;
}

export const PortfolioGrid = ({ items, onOpenItem }: PortfolioGridProps) =>
{
    return (
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-3 gap-[2px] sm:gap-1 lg:grid-cols-4 2xl:max-w-[1320px] 2xl:grid-cols-5">
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