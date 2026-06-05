import type { BookingRequestRecord } from "../types/booking.types";
import { formatBudgetRange, parseBudgetRangeValue } from "./booking-budget";

export const formatTitleCase = (value?: string | null): string => {
    if (!value?.trim()) {
        return "";
    }

    return value
        .trim()
        .split(/[\s-_]+/)
        .filter(Boolean)
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(" ");
};

export const formatShootTypeLabel = (value?: string | null): string => {
    return formatTitleCase(value) || "Select shoot type";
};

export const formatContactLabel = (value?: string | null): string => {
    return formatTitleCase(value) || "Select contact";
};

export const formatBookingTime = (value?: string | null): string => {
    if (!value?.trim() || value === "flexible") {
        return "Flexible time";
    }

    return value;
};

export const formatBookingDate = (value?: string | null): string => {
    if (!value?.trim()) {
        return "Select date";
    }

    return value;
};

export const formatBudgetLabel = (value?: string | null): string => {
    if (!value?.trim()) {
        return "Select budget";
    }

    const parsedBudget = parseBudgetRangeValue(value);

    if (!parsedBudget) {
        return value;
    }

    const formattedRange = formatBudgetRange(
        parsedBudget.from,
        parsedBudget.to,
    );

    if (parsedBudget.from === parsedBudget.to) {
        return formattedRange.split(" - ")[0] ?? formattedRange;
    }

    return formattedRange;
};

export const formatSubmittedAt = (value?: string | null): string => {
    if (!value) {
        return "just now";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return "just now";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsed);
};

export const getBookingDisplayTitle = (
    booking: BookingRequestRecord,
): string => {
    if (booking.title?.trim()) {
        return booking.title.trim();
    }

    if (booking.photographerName?.trim()) {
        return booking.photographerName.trim();
    }

    return "Open booking request";
};

export const getBookingPrimaryLabel = (
    booking: BookingRequestRecord,
): string => {
    if (booking.photographerName?.trim()) {
        return booking.photographerName.trim();
    }

    return "Waiting for photographer";
};

export const hasAssignedPhotographer = (
    booking: BookingRequestRecord,
): boolean => {
    return Boolean(booking.photographerSlug?.trim());
};
