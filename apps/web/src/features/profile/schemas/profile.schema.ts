import { z } from "zod";

const nonNegativeNumberString = (label: string, requireInteger = false) =>
    z
        .string()
        .trim()
        .refine(
            (value) => {
                if (!value) return true;

                const parsed = Number(value);

                if (Number.isNaN(parsed) || parsed < 0) {
                    return false;
                }

                return requireInteger ? Number.isInteger(parsed) : true;
            },
            {
                message: requireInteger
                    ? `${label} must be a whole number.`
                    : `${label} must be a valid non-negative number.`,
            },
        );

export const profileSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Please share your full name.")
        .max(255, "Full name is too long."),
    phone: z.string().trim().max(30, "Phone number is too long."),
    location: z.string().trim().max(255, "Location is too long."),
    bio: z.string().trim().max(500, "Bio should stay under 500 characters."),
    specialtiesText: z
        .string()
        .trim()
        .max(500, "Specialties list is too long."),
    pricePerHour: nonNegativeNumberString("Price per hour"),
    experienceYears: nonNegativeNumberString("Experience years", true),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
