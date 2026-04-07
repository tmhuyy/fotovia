import type { PhotographerProfile } from "./photographer.types";

export type PhotographerPortfolioStyleSource = "ai" | "legacy" | "none";

export interface PhotographerService {
    title: string;
    description: string;
    duration: string;
    startingPrice: number;
}

export interface PhotographerTestimonial {
    name: string;
    context: string;
    quote: string;
}

export interface PhotographerPortfolioShowcaseItem {
    id: string;
    title: string;
    description: string;
    coverImageUrl: string;
    galleryImages: string[];
    styleLabel: string | null;
    styleSource: PhotographerPortfolioStyleSource;
    isFeatured: boolean;
}

export interface PhotographerDetail extends PhotographerProfile {
    intro: string;
    experienceYears: number | null;
    availability: string;
    services: PhotographerService[];
    portfolio: PhotographerPortfolioShowcaseItem[];
    testimonials: PhotographerTestimonial[];
    specialties: string[];
}
