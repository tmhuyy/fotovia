import type { PhotographerPortfolioItem } from "../types/portfolio.types";
import { PortfolioItemCard } from "./portfolio-item-card";

interface PortfolioGridProps {
    items: PhotographerPortfolioItem[];
}

export const PortfolioGrid = ({ items }: PortfolioGridProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
                <PortfolioItemCard key={item.id} item={item} />
            ))}
        </div>
    );
};
