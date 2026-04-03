import type { PhotographerProfile } from "./photographer.types";

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

export interface PhotographerDetail extends PhotographerProfile {
  intro: string;
  experienceYears: number;
  availability: string;
  services: PhotographerService[];
  portfolio: string[];
  testimonials: PhotographerTestimonial[];
}
