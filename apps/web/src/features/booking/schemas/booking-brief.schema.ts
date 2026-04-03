import { z } from "zod";

export const bookingBriefSchema = z.object({
  sessionType: z.string().min(1, "Select a session type."),
  preferredDate: z.string().min(1, "Choose a preferred date."),
  preferredTime: z.string().min(1, "Choose a preferred time."),
  location: z.string().min(2, "Add the session location."),
  budget: z.string().min(1, "Select a budget range."),
  style: z.string().min(1, "Select a style direction."),
  description: z
    .string()
    .min(20, "Share a few details about the shoot.")
    .max(500, "Keep the brief under 500 characters."),
  contactPreference: z.string().min(1, "Select a contact preference."),
  inspiration: z.union([z.string().url("Enter a valid link."), z.literal("")]).optional(),
  notes: z.string().max(500, "Keep notes under 500 characters.").optional(),
});

export type BookingBriefFormValues = z.infer<typeof bookingBriefSchema>;
