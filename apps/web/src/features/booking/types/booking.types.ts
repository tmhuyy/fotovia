export type BookingStatus = "pending" | "confirmed" | "declined" | "completed";

export interface CreateBookingPayload {
    photographerProfileId: string;
    photographerSlug: string;
    photographerName: string;
    sessionType: string;
    sessionDate: string;
    sessionTime: string;
    duration: string;
    location: string;
    budget: string;
    contactPreference: string;
    concept: string;
    inspiration?: string;
    notes?: string;
}

export interface BookingRequestRecord extends CreateBookingPayload {
    id: string;
    clientUserId: string;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
}

export interface BookingEntrySearchParams {
    photographerSlug?: string;
    sessionType?: string;
    location?: string;
    date?: string;
    budget?: string;
}
