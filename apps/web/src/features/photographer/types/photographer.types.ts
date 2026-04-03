export interface PhotographerProfile {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  styles: string[];
  location: string;
  bio: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  tags: string[];
}
