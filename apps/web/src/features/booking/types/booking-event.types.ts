export type BookingEventType =
    | "created"
    | "confirmed"
    | "declined"
    | "cancelled"
    | "completed";

export type BookingEventActorRole = "client" | "photographer" | "system";

export interface BookingEventRecord {
    id: string;
    bookingId: string;
    eventType: BookingEventType;
    actorRole: BookingEventActorRole;
    actorUserId?: string;
    actorLabel: string;
    note?: string;
    createdAt: string;
}
