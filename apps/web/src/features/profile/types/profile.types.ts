import type { AuthRole } from "../../../types/auth.types";

export interface ProfileData {
  role: AuthRole;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  preferredStyles: string;
  bookingPreferences: string;
  savedPhotographers: string;
  studioName: string;
  specialties: string;
  serviceLocation: string;
  pricingTier: string;
  availability: string;
}
