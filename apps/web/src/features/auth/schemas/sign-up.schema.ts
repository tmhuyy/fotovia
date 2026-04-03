import { z } from "zod";

export const signUpSchema = z
  .object({
    role: z.enum(["client", "photographer"], {
      error: (issue) =>
        issue.input === undefined ? "Please choose a role." : "Invalid role.",
    }),
    fullName: z.string().min(2, "Please share your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;