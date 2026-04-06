import type {
    BookingRequestRecord,
    BookingStatus,
    CreateBookingPayload,
} from "../features/booking/types/booking.types";
import { bookingClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";

type AnyRecord = Record<string, unknown>;

const BOOKING_ENDPOINTS = {
    create: "/booking",
};

const normalizeString = (value: unknown): string => {
    return typeof value === "string" ? value : "";
};

const normalizeNullableString = (value: unknown): string | null => {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const normalizeStatus = (value: unknown): BookingStatus => {
    const normalized = normalizeString(value);

    if (
        normalized === "pending" ||
        normalized === "confirmed" ||
        normalized === "declined" ||
        normalized === "completed"
    ) {
        return normalized;
    }

    return "pending";
};

const normalizeBooking = (payload: AnyRecord): BookingRequestRecord => {
    return {
        id: normalizeString(payload.id),
        clientUserId: normalizeString(payload.clientUserId),
        photographerProfileId: normalizeString(payload.photographerProfileId),
        photographerSlug: normalizeString(payload.photographerSlug),
        photographerName: normalizeString(payload.photographerName),
        sessionType: normalizeString(payload.sessionType),
        sessionDate: normalizeString(payload.sessionDate),
        sessionTime: normalizeString(payload.sessionTime),
        duration: normalizeString(payload.duration),
        location: normalizeString(payload.location),
        budget: normalizeString(payload.budget),
        contactPreference: normalizeString(payload.contactPreference),
        concept: normalizeString(payload.concept),
        inspiration: normalizeNullableString(payload.inspiration) ?? undefined,
        notes: normalizeNullableString(payload.notes) ?? undefined,
        status: normalizeStatus(payload.status),
        createdAt:
            typeof payload.createdAt === "string"
                ? payload.createdAt
                : new Date().toISOString(),
        updatedAt:
            typeof payload.updatedAt === "string"
                ? payload.updatedAt
                : new Date().toISOString(),
    };
};

export const bookingService = {
    async createBooking(
        payload: CreateBookingPayload,
    ): Promise<BookingRequestRecord> {
        const response = await bookingClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(BOOKING_ENDPOINTS.create, payload);

        const data = unwrapResponse<AnyRecord>(response.data);
        return normalizeBooking(data);
    },
};
