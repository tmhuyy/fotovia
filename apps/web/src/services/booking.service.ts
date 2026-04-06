import type {
    BookingRequestRecord,
    BookingStatus,
    CreateBookingPayload,
    PhotographerBookingActionStatus,
} from "../features/booking/types/booking.types";
import { bookingClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";

type AnyRecord = Record<string, unknown>;

const BOOKING_ENDPOINTS = {
    create: "/booking",
    photographerMine: "/booking/photographer/me",
    photographerStatus: (bookingId: string) =>
        `/booking/photographer/me/${bookingId}/status`,
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
        clientEmail: normalizeNullableString(payload.clientEmail) ?? undefined,
        photographerProfileId: normalizeString(payload.photographerProfileId),
        photographerUserId:
            normalizeNullableString(payload.photographerUserId) ?? undefined,
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

const normalizeBookingArray = (payload: unknown): BookingRequestRecord[] => {
    if (!Array.isArray(payload)) {
        return [];
    }

    return payload
        .filter(
            (item): item is AnyRecord =>
                typeof item === "object" &&
                item !== null &&
                !Array.isArray(item),
        )
        .map((item) => normalizeBooking(item));
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

    async getMyPhotographerBookings(): Promise<BookingRequestRecord[]> {
        const response = await bookingClient.get<
            ApiResponse<unknown> | unknown
        >(BOOKING_ENDPOINTS.photographerMine);

        const data = unwrapResponse<unknown>(response.data);
        return normalizeBookingArray(data);
    },

    async updateMyPhotographerBookingStatus(
        bookingId: string,
        status: PhotographerBookingActionStatus,
    ): Promise<BookingRequestRecord> {
        const response = await bookingClient.patch<
            ApiResponse<AnyRecord> | AnyRecord
        >(BOOKING_ENDPOINTS.photographerStatus(bookingId), {
            status,
        });

        const data = unwrapResponse<AnyRecord>(response.data);
        return normalizeBooking(data);
    },
};
