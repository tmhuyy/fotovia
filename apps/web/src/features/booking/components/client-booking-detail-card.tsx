import Link from "next/link";

import { Button, buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import type {
    BookingRequestRecord,
    ClientBookingActionStatus,
} from "../types/booking.types";
import type { BookingEventRecord } from "../types/booking-event.types";
import
{
    formatBookingDate,
    formatBookingTime,
    formatBudgetLabel,
    formatContactLabel,
    formatShootTypeLabel,
    formatSubmittedAt,
    getBookingDisplayTitle,
    hasAssignedPhotographer,
} from "../utils/booking-display";
import { BookingStatusPill } from "./booking-status-pill";
import { BookingActivityTimeline } from "./booking-activity-timeline";

interface ClientBookingDetailCardProps
{
    booking: BookingRequestRecord | null;
    isUpdating?: boolean;
    actionError?: string | null;
    onCancel: (status: ClientBookingActionStatus) => void;
    timelineEvents: BookingEventRecord[];
    isTimelineLoading?: boolean;
    timelineError?: string | null;
}

const statusCopy: Record<
    BookingRequestRecord["status"],
    {
        title: string;
        description: string;
    }
> = {
    pending: {
        title: "Waiting for response",
        description:
            "Your request was sent successfully. It is waiting for a photographer response.",
    },
    confirmed: {
        title: "Request confirmed",
        description:
            "The photographer has confirmed this booking request.",
    },
    declined: {
        title: "Request declined",
        description:
            "This request was declined. You can review the brief and explore other photographers.",
    },
    completed: {
        title: "Booking completed",
        description:
            "This booking has been marked as completed.",
    },
    cancelled: {
        title: "Request cancelled",
        description:
            "You cancelled this booking request. It remains here for tracking.",
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
    timelineEvents,
    isTimelineLoading = false,
    timelineError,
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
                        saved brief and current status.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const currentStatusCopy = statusCopy[booking.status];
    const canCancel = booking.status === "pending";
    const hasPhotographer = hasAssignedPhotographer(booking);

    return (
        <div className="space-y-6">
            <Card className="border-brand-border bg-brand-surface">
                <CardContent className="space-y-6 p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                                Request details
                            </p>
                            <h2 className="text-2xl font-semibold text-brand-primary">
                                {getBookingDisplayTitle(booking)}
                            </h2>
                            <p className="text-sm text-brand-muted">
                                Submitted {formatSubmittedAt(booking.createdAt)}
                            </p>
                        </div>

                        <BookingStatusPill status={booking.status} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <DetailItem
                            label="Shoot type"
                            value={formatShootTypeLabel(
                                booking.shootType || booking.sessionType,
                            )}
                        />
                        <DetailItem
                            label="Date & time"
                            value={`${formatBookingDate(
                                booking.sessionDate,
                            )} · ${formatBookingTime(booking.sessionTime)}`}
                        />
                        <DetailItem
                            label="Photographer"
                            value={
                                hasPhotographer
                                    ? booking.photographerName ||
                                    "Assigned photographer"
                                    : "Not selected yet"
                            }
                        />
                        <DetailItem
                            label="Budget"
                            value={formatBudgetLabel(booking.budget)}
                        />
                        <DetailItem
                            label="Location"
                            value={booking.location || "Location not set"}
                        />
                        <DetailItem
                            label="Contact"
                            value={formatContactLabel(
                                booking.contactPreference,
                            )}
                        />
                    </div>

                    <div className="space-y-4 border-t border-brand-border pt-6">
                        <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                                Shoot brief
                            </p>
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-brand-primary">
                                {booking.concept || "No brief provided."}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                                Inspiration
                            </p>
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-brand-primary">
                                {booking.inspiration ||
                                    "No inspiration link was added."}
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
                            Last updated {formatSubmittedAt(booking.updatedAt)}
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

                        {hasPhotographer && booking.photographerSlug ? (
                            <Link
                                href={`/photographers/${booking.photographerSlug}`}
                                className={buttonVariants({
                                    variant: "secondary",
                                    size: "md",
                                })}
                            >
                                View photographer
                            </Link>
                        ) : (
                            <Link
                                href={`/photographers?style=${encodeURIComponent(
                                    booking.shootType || booking.sessionType,
                                )}&location=${encodeURIComponent(
                                    booking.location,
                                )}`}
                                className={buttonVariants({
                                    variant: "secondary",
                                    size: "md",
                                })}
                            >
                                Find matching photographers
                            </Link>
                        )}

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

            <BookingActivityTimeline
                events={timelineEvents}
                isLoading={isTimelineLoading}
                errorMessage={timelineError}
            />
        </div>
    );
};