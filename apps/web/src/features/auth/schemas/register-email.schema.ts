import { z } from "zod";

export const registerEmailSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export type RegisterEmailFormValues = z.infer<typeof registerEmailSchema>;
