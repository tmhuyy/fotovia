import { z } from "zod";

import { additionalServiceValues } from "../data/additional-services";
import {
    BUDGET_MIN_VND,
    BUDGET_STEP_VND,
    formatVndAmount,
} from "../utils/booking-budget";

const budgetAmountSchema = z
    .number()
    .refine((value) => Number.isFinite(value), {
        message: "Enter a budget amount.",
    })
    .refine((value) => value >= BUDGET_MIN_VND, {
        message: `Minimum budget is ${formatVndAmount(BUDGET_MIN_VND)} VND.`,
    })
    .refine((value) => value % BUDGET_STEP_VND === 0, {
        message: `Budget must increase by ${formatVndAmount(BUDGET_STEP_VND)} VND.`,
    });

export const bookingBriefSchema = z
    .object({
        title: z
            .string()
            .min(3, "Add a short title for your shoot.")
            .max(120, "Keep the title under 120 characters."),

        shootType: z.string().min(1, "Select a shoot type."),

        preferredDate: z.string().min(1, "Choose a preferred date."),

        preferredTime: z.string().optional(),

        location: z.string().min(2, "Choose the session location."),

        budgetFrom: budgetAmountSchema,

        budgetTo: budgetAmountSchema,

        concept: z
            .string()
            .min(20, "Share a few details about the shoot.")
            .max(500, "Keep the brief under 500 characters."),

        contactPreference: z.string().min(1, "Select a contact preference."),

        additionalServices: z.array(z.enum(additionalServiceValues)),

        inspiration: z
            .union([z.string().url("Enter a valid link."), z.literal("")])
            .optional(),
    })
    .superRefine((values, context) => {
        if (values.budgetTo < values.budgetFrom) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["budgetTo"],
                message:
                    "The maximum budget must be greater than or equal to the minimum budget.",
            });
        }
    });

export type BookingBriefFormValues = z.infer<typeof bookingBriefSchema>;
