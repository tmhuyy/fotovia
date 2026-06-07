export type BookingStatus =
    | "pending"
    | "confirmed"
    | "declined"
    | "completed"
    | "cancelled";

export type BookingApplicationStatus =
    | "submitted"
    | "shortlisted"
    | "selected"
    | "rejected"
    | "withdrawn"
    | "expired";

export type PhotographerBookingActionStatus = Extract<
    BookingStatus,
    "confirmed" | "declined" | "completed"
>;

export type ClientBookingActionStatus = Extract<BookingStatus, "cancelled">;

export type BookingInboxFilter = "all" | BookingStatus;
export type ClientBookingFilter = "all" | BookingStatus;

export interface BaseBookingPayload {
    title?: string;
    shootType?: string;
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

export interface CreateBookingPayload extends BaseBookingPayload {
    photographerProfileId: string;
    photographerSlug: string;
    photographerName: string;
}

export type CreateOpenBookingPayload = BaseBookingPayload;
export type UpdateOpenBookingPayload = CreateOpenBookingPayload;

export interface BookingRequestRecord extends BaseBookingPayload {
    id: string;
    clientUserId: string;
    clientEmail?: string;
    clientName?: string;
    clientFullName?: string;
    clientProfileName?: string;
    fullName?: string;
    photographerProfileId?: string;
    photographerUserId?: string;
    photographerSlug?: string;
    photographerName?: string;
    applicationsCount?: number;
    applicationCount?: number;
    photographerApplicationsCount?: number;
    isOwner?: boolean;
    canManage?: boolean;
    canViewApplications?: boolean;
    status: BookingStatus;
    createdAt: string;
    updatedAt: string;
    hasApplied?: boolean;
    myApplicationId?: string;
    myApplicationStatus?: BookingApplicationStatus;
    canApply?: boolean;
}

export type OpenBookingRequestRecord = BookingRequestRecord;

export interface BookingEntrySearchParams {
    photographerSlug?: string;
    sessionType?: string;
    shootType?: string;
    style?: string;
    location?: string;
    date?: string;
    budget?: string;
}

export interface CreateBookingApplicationPayload {
    message: string;
    proposedPrice: number;
    includedDeliverables: string;
    availableOnRequestedDate: boolean;
    estimatedDuration?: string;
}

export interface BookingApplicationRecord {
    id: string;
    bookingId: string;
    photographerProfileId: string;
    photographerUserId: string;
    photographerName: string;
    photographerSlug?: string;
    photographerAvatarUrl?: string;
    message: string;
    proposedPrice: number;
    includedDeliverables: string;
    estimatedDuration?: string;
    availableOnRequestedDate: boolean;
    status: BookingApplicationStatus;
    createdAt: string;
    updatedAt: string;
}
