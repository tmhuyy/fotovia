export type PhotographerDiscoveryStyleSource = "ai" | "legacy" | "none";

export interface PhotographerProfile {
    id: string;
    slug: string;
    name: string;
    specialty: string;
    styles: string[];
    location: string;
    bio: string;
    avatarUrl: string | null;
    rating: number | null;
    reviewCount: number | null;
    startingPrice: number | null;
    tags: string[];
    primaryDiscoveryStyle: string | null;
    discoveryStyles: string[];
    discoveryStyleSource: PhotographerDiscoveryStyleSource;
    portfolioItemCount: number;
    classifiedPortfolioCount: number;
    hasFeaturedWork: boolean;
}
