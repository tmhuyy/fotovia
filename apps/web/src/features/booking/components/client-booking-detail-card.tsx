import Link from "next/link";

import { Button, buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import
    {
        budgetOptions,
        durationOptions,
        sessionTypeOptions,
    } from "../data/booking-options";
import type {
    BookingRequestRecord,
    ClientBookingActionStatus,
} from "../types/booking.types";
import { BookingStatusPill } from "./booking-status-pill";

interface ClientBookingDetailCardProps
{
    booking: BookingRequestRecord | null;
    isUpdating?: boolean;
    actionError?: string | null;
    onCancel: (status: ClientBookingActionStatus) => void;
}

const resolveLabel = (
    value: string,
    options: { value: string; label: string }[],
): string =>
{
    return options.find((option) => option.value === value)?.label ?? value;
};

const formatDateTime = (value: string): string =>
{
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return "just now";
    }

    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsed);
};

const statusCopy: Record<
    BookingRequestRecord["status"],
    {
        title: string;
        description: string;
    }
> = {
    pending: {
        title: "Awaiting photographer response",
        description:
            "Your request was sent successfully and is still waiting for the photographer's first response. You can still cancel it in this phase while it remains pending.",
    },
    confirmed: {
        title: "Request confirmed",
        description:
            "The photographer has confirmed this booking request. The next lifecycle step in this phase happens on the photographer side when the booking is completed.",
    },
    declined: {
        title: "Request declined",
        description:
            "This photographer declined the request. You can review the brief, explore more photographers, and submit another request.",
    },
    completed: {
        title: "Booking completed",
        description:
            "The photographer marked this booking as completed. This request has now reached the final lifecycle state supported in the current phase.",
    },
    cancelled: {
        title: "Request cancelled",
        description:
            "You cancelled this booking request while it was still pending. It remains in your history for tracking, but it is no longer active.",
    },
};

const DetailItem = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) =>
{
    return (
        <div className="rounded-2xl border border-brand-border bg-brand-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                {label}
            </p>
            <p className="mt-2 text-sm leading-6 text-brand-primary">{value}</p>
        </div>
    );
};

export const ClientBookingDetailCard = ({
    booking,
    isUpdating = false,
    actionError,
    onCancel,
}: ClientBookingDetailCardProps) =>
{
    if (!booking) {
        return (
            <Card className="border-brand-border bg-brand-surface">
                <CardContent className="space-y-4 p-6">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                        Request details
                    </p>
                    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-background/70 p-6 text-sm text-brand-muted">
                        Select one booking request from the list to review the
                        saved brief and the current photographer response.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const currentStatusCopy = statusCopy[booking.status];
    const canCancel = booking.status === "pending";

    return (
        <Card className="border-brand-border bg-brand-surface">
            <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                            Request details
                        </p>
                        <h2 className="text-2xl font-semibold text-brand-primary">
                            {booking.photographerName}
                        </h2>
                        <p className="text-sm text-brand-muted">
                            Submitted {formatDateTime(booking.createdAt)}
                        </p>
                    </div>

                    <BookingStatusPill status={booking.status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <DetailItem
                        label="Session type"
                        value={resolveLabel(
                            booking.sessionType,
                            sessionTypeOptions,
                        )}
                    />
                    <DetailItem
                        label="Date & time"
                        value={`${booking.sessionDate || "Date not set"} · ${booking.sessionTime || "Time not set"
                            }`}
                    />
                    <DetailItem
                        label="Duration"
                        value={resolveLabel(
                            booking.duration,
                            durationOptions,
                        )}
                    />
                    <DetailItem
                        label="Budget"
                        value={resolveLabel(booking.budget, budgetOptions)}
                    />
                    <DetailItem
                        label="Location"
                        value={booking.location || "Location not set"}
                    />
                    <DetailItem
                        label="Preferred contact"
                        value={
                            booking.contactPreference || "Not specified yet"
                        }
                    />
                </div>

                <div className="space-y-4 border-t border-brand-border pt-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                            Shoot concept
                        </p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-brand-primary">
                            {booking.concept || "No concept provided."}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                            Inspiration
                        </p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-brand-primary">
                            {booking.inspiration ||
                                "No inspiration notes were added."}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                            Extra notes
                        </p>
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-brand-primary">
                            {booking.notes || "No extra notes were added."}
                        </p>
                    </div>
                </div>

                {actionError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                        {actionError}
                    </div>
                ) : null}

                <div className="rounded-2xl border border-brand-border bg-brand-background/70 p-4 text-sm text-brand-muted">
                    <p className="font-medium text-brand-primary">
                        {currentStatusCopy.title}
                    </p>
                    <p className="mt-2 leading-6">
                        {currentStatusCopy.description}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.14em] text-brand-muted">
                        Last updated {formatDateTime(booking.updatedAt)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {canCancel ? (
                        <Button
                            type="button"
                            onClick={() => onCancel("cancelled")}
                            disabled={isUpdating}
                        >
                            {isUpdating ? "Updating..." : "Cancel request"}
                        </Button>
                    ) : null}

                    <Link
                        href={`/photographers/${booking.photographerSlug}`}
                        className={buttonVariants({
                            variant: "secondary",
                            size: "md",
                        })}
                    >
                        View photographer
                    </Link>

                    <Link
                        href="/photographers"
                        className={buttonVariants({
                            variant: "secondary",
                            size: "md",
                        })}
                    >
                        Explore more photographers
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};