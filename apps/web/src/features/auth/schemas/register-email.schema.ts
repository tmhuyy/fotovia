import { z } from "zod";

export const registerEmailSchema = z.object({
  role: z.enum(["client", "photographer"], {
    error: "Please choose a role.",
  }),
  email: z.string().email("Enter a valid email address."),
});

export type RegisterEmailFormValues = z.infer<typeof registerEmailSchema>;