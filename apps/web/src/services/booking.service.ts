import type {
    BookingRequestRecord,
    BookingStatus,
    ClientBookingActionStatus,
    CreateBookingPayload,
    CreateOpenBookingPayload,
    OpenBookingRequestRecord,
    PhotographerBookingActionStatus,
} from "../features/booking/types/booking.types";
import type { BookingEventRecord } from "../features/booking/types/booking-event.types";
import { bookingClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";

type AnyRecord = Record<string, unknown>;

const BOOKING_ENDPOINTS = {
    create: "/booking",
    createOpen: "/booking/open",
    openFeed: "/booking/open",
    openDetail: (bookingId: string) => `/booking/open/${bookingId}`,
    openDetailForViewer: (bookingId: string) =>
        `/booking/open/${bookingId}/viewer`,
    clientMine: "/booking/client/me",
    clientCancel: (bookingId: string) =>
        `/booking/client/me/${bookingId}/cancel`,
    clientTimeline: (bookingId: string) =>
        `/booking/client/me/${bookingId}/timeline`,
    photographerMine: "/booking/photographer/me",
    photographerTimeline: (bookingId: string) =>
        `/booking/photographer/me/${bookingId}/timeline`,
    photographerStatus: (bookingId: string) =>
        `/booking/photographer/me/${bookingId}/status`,
};

const normalizeString = (value: unknown): string => {
    return typeof value === "string" ? value : "";
};

const normalizeNullableString = (value: unknown): string | null => {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const normalizeNullableNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
        const parsedValue = Number(value);

        if (Number.isFinite(parsedValue)) {
            return parsedValue;
        }
    }

    return undefined;
};

const normalizeBoolean = (value: unknown): boolean | undefined => {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (normalized === "true") {
            return true;
        }

        if (normalized === "false") {
            return false;
        }
    }

    return undefined;
};

const normalizeStatus = (value: unknown): BookingStatus => {
    const normalized = normalizeString(value);

    if (
        normalized === "pending" ||
        normalized === "confirmed" ||
        normalized === "declined" ||
        normalized === "completed" ||
        normalized === "cancelled"
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
        clientName: normalizeNullableString(payload.clientName) ?? undefined,
        clientFullName:
            normalizeNullableString(payload.clientFullName) ?? undefined,
        clientProfileName:
            normalizeNullableString(payload.clientProfileName) ?? undefined,
        fullName: normalizeNullableString(payload.fullName) ?? undefined,
        photographerProfileId:
            normalizeNullableString(payload.photographerProfileId) ?? undefined,
        photographerUserId:
            normalizeNullableString(payload.photographerUserId) ?? undefined,
        photographerSlug:
            normalizeNullableString(payload.photographerSlug) ?? undefined,
        photographerName:
            normalizeNullableString(payload.photographerName) ?? undefined,
        title: normalizeNullableString(payload.title) ?? undefined,
        shootType: normalizeString(payload.shootType),
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
        applicationsCount: normalizeNullableNumber(payload.applicationsCount),
        applicationCount: normalizeNullableNumber(payload.applicationCount),
        photographerApplicationsCount: normalizeNullableNumber(
            payload.photographerApplicationsCount,
        ),
        isOwner: normalizeBoolean(payload.isOwner),
        canManage: normalizeBoolean(payload.canManage),
        canViewApplications: normalizeBoolean(payload.canViewApplications),
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

const normalizeBookingEvent = (payload: AnyRecord): BookingEventRecord => {
    return {
        id: normalizeString(payload.id),
        bookingId: normalizeString(payload.bookingId),
        eventType:
            (normalizeString(
                payload.eventType,
            ) as BookingEventRecord["eventType"]) || "created",
        actorRole:
            (normalizeString(
                payload.actorRole,
            ) as BookingEventRecord["actorRole"]) || "system",
        actorUserId: normalizeNullableString(payload.actorUserId) ?? undefined,
        actorLabel: normalizeString(payload.actorLabel),
        note: normalizeNullableString(payload.note) ?? undefined,
        createdAt:
            typeof payload.createdAt === "string"
                ? payload.createdAt
                : new Date().toISOString(),
    };
};

const normalizeBookingEventArray = (payload: unknown): BookingEventRecord[] => {
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
        .map((item) => normalizeBookingEvent(item));
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

    async createOpenBooking(
        payload: CreateOpenBookingPayload,
    ): Promise<BookingRequestRecord> {
        const response = await bookingClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(BOOKING_ENDPOINTS.createOpen, payload);

        const data = unwrapResponse<AnyRecord>(response.data);
        return normalizeBooking(data);
    },

    async getOpenBookingFeed(): Promise<OpenBookingRequestRecord[]> {
        const response = await bookingClient.get<
            ApiResponse<unknown> | unknown
        >(BOOKING_ENDPOINTS.openFeed);

        const data = unwrapResponse<unknown>(response.data);
        return normalizeBookingArray(data);
    },

    async getOpenBookingDetail(
        bookingId: string,
        withViewerContext = false,
    ): Promise<OpenBookingRequestRecord> {
        const response = await bookingClient.get<
            ApiResponse<AnyRecord> | AnyRecord
        >(
            withViewerContext
                ? BOOKING_ENDPOINTS.openDetailForViewer(bookingId)
                : BOOKING_ENDPOINTS.openDetail(bookingId),
        );

        const data = unwrapResponse<AnyRecord>(response.data);
        return normalizeBooking(data);
    },

    async getMyClientBookings(): Promise<BookingRequestRecord[]> {
        const response = await bookingClient.get<
            ApiResponse<unknown> | unknown
        >(BOOKING_ENDPOINTS.clientMine);

        const data = unwrapResponse<unknown>(response.data);
        return normalizeBookingArray(data);
    },

    async getMyClientBookingTimeline(
        bookingId: string,
    ): Promise<BookingEventRecord[]> {
        const response = await bookingClient.get<
            ApiResponse<unknown> | unknown
        >(BOOKING_ENDPOINTS.clientTimeline(bookingId));

        const data = unwrapResponse<unknown>(response.data);
        return normalizeBookingEventArray(data);
    },

    async cancelMyClientBooking(
        bookingId: string,
        status: ClientBookingActionStatus = "cancelled",
    ): Promise<BookingRequestRecord> {
        const response = await bookingClient.patch<
            ApiResponse<AnyRecord> | AnyRecord
        >(BOOKING_ENDPOINTS.clientCancel(bookingId), {
            status,
        });

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

    async getMyPhotographerBookingTimeline(
        bookingId: string,
    ): Promise<BookingEventRecord[]> {
        const response = await bookingClient.get<
            ApiResponse<unknown> | unknown
        >(BOOKING_ENDPOINTS.photographerTimeline(bookingId));

        const data = unwrapResponse<unknown>(response.data);
        return normalizeBookingEventArray(data);
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
