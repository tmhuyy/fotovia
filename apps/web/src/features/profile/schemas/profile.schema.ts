import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Please share your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(280, "Bio should be under 280 characters.").optional(),
  preferredStyles: z.string().optional(),
  bookingPreferences: z.string().optional(),
  savedPhotographers: z.string().optional(),
  studioName: z.string().optional(),
  specialties: z.string().optional(),
  serviceLocation: z.string().optional(),
  pricingTier: z.string().optional(),
  availability: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
