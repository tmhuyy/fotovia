import { z } from "zod";

const passwordRule = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const signUpSchema = z
    .object({
        role: z.enum(["client", "photographer"], {
            error: (issue) =>
                issue.input === undefined
                    ? "Please choose a role."
                    : "Invalid role.",
        }),
        fullName: z
            .string()
            .trim()
            .min(2, "Please share your full name.")
            .max(255, "Full name is too long."),
        email: z
            .string()
            .trim()
            .min(1, "Enter your email address.")
            .email("Enter a valid email address."),
        password: z
            .string()
            .min(8, "Use at least 8 characters.")
            .max(20, "Use no more than 20 characters.")
            .regex(
                passwordRule,
                "Use uppercase, lowercase, and a number or symbol.",
            ),
        confirmPassword: z.string().min(1, "Please confirm your password."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match.",
    });

export type SignUpFormValues = z.infer<typeof signUpSchema>;
