import type { ProfileData } from "../types/profile.types";

export interface ProfileCompletionItem {
    key:
        | "fullName"
        | "phone"
        | "location"
        | "bio"
        | "specialties"
        | "pricePerHour"
        | "experienceYears";
    label: string;
    description: string;
    isComplete: boolean;
}

export interface PhotographerProfileCompletion {
    completedCount: number;
    totalCount: number;
    completionPercentage: number;
    isComplete: boolean;
    items: ProfileCompletionItem[];
    missingItems: ProfileCompletionItem[];
}

const hasNonEmptyString = (value?: string | null) =>
    typeof value === "string" && value.trim().length > 0;

const hasPositiveNumber = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value) && value > 0;

const hasZeroOrGreaterNumber = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;

export const getPhotographerProfileCompletion = (
    profile?: ProfileData | null,
): PhotographerProfileCompletion => {
    const items: ProfileCompletionItem[] = [
        {
            key: "fullName",
            label: "Full name",
            description: "Add the public-facing name clients should recognize.",
            isComplete: hasNonEmptyString(profile?.fullName),
        },
        {
            key: "phone",
            label: "Phone number",
            description:
                "Give clients and future booking flows a direct contact point.",
            isComplete: hasNonEmptyString(profile?.phone),
        },
        {
            key: "location",
            label: "Location",
            description:
                "Tell clients where you are based or where you usually work.",
            isComplete: hasNonEmptyString(profile?.location),
        },
        {
            key: "bio",
            label: "Short bio",
            description:
                "Introduce your style, focus, or photography approach.",
            isComplete: hasNonEmptyString(profile?.bio),
        },
        {
            key: "specialties",
            label: "Specialties",
            description:
                "List the kinds of sessions or work you want to be known for.",
            isComplete:
                Array.isArray(profile?.specialties) &&
                profile.specialties.length > 0,
        },
        {
            key: "pricePerHour",
            label: "Price per hour",
            description:
                "Set an initial rate so later marketplace flows have a starting point.",
            isComplete: hasPositiveNumber(profile?.pricePerHour),
        },
        {
            key: "experienceYears",
            label: "Experience years",
            description:
                "Show how long you have been shooting professionally or seriously.",
            isComplete: hasZeroOrGreaterNumber(profile?.experienceYears),
        },
    ];

    const completedCount = items.filter((item) => item.isComplete).length;
    const totalCount = items.length;
    const completionPercentage =
        totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return {
        completedCount,
        totalCount,
        completionPercentage,
        isComplete: completedCount === totalCount,
        items,
        missingItems: items.filter((item) => !item.isComplete),
    };
};
