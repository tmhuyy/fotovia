import { z } from "zod";

import { additionalServiceValues } from "../data/additional-services";

export const bookingRequestSchema = z.object({
    sessionType: z.string().min(1, "Select a session type."),
    sessionDate: z.string().min(1, "Choose a date."),
    sessionTime: z.string().min(1, "Choose a time."),
    location: z.string().min(2, "Add the session location."),
    budget: z.string().min(1, "Select a budget range."),
    duration: z.string().min(1, "Select a session length."),
    contactPreference: z.string().min(1, "Select a contact preference."),
    concept: z.string().min(10, "Share a bit more about the shoot concept."),
    inspiration: z.string().optional(),
    additionalServices: z.array(z.enum(additionalServiceValues)),
});

export type BookingRequestFormValues = z.infer<typeof bookingRequestSchema>;
