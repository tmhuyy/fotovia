import { z } from "zod";

export const bookingRequestSchema = z.object({
  sessionType: z.string().min(1, "Select a session type."),
  sessionDate: z.string().min(1, "Choose a date."),
  sessionTime: z.string().min(1, "Choose a time."),
  location: z.string().min(2, "Add the session location."),
  budget: z.string().min(1, "Select a budget range."),
  duration: z.string().min(1, "Select a session length."),
  contactPreference: z.string().min(1, "Select a contact preference."),
  concept: z
    .string()
    .min(10, "Share a bit more about the shoot concept."),
  inspiration: z.string().optional(),
  notes: z.string().optional(),
});

export type BookingRequestFormValues = z.infer<typeof bookingRequestSchema>;
