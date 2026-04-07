import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import
    {
        budgetOptions,
        durationOptions,
        sessionTypeOptions,
    } from "../data/booking-options";
import type {
    BookingRequestRecord,
    PhotographerBookingActionStatus,
} from "../types/booking.types";
import type { BookingEventRecord } from "../types/booking-event.types";
import { BookingStatusPill } from "./booking-status-pill";
import { BookingActivityTimeline } from "./booking-activity-timeline";

interface PhotographerBookingDetailCardProps
{
    booking: BookingRequestRecord | null;
    isUpdating?: boolean;
    actionError?: string | null;
    onStatusChange: (status: PhotographerBookingActionStatus) => void;
    timelineEvents: BookingEventRecord[];
    isTimelineLoading?: boolean;
    timelineError?: string | null;
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

const lifecycleCopy: Record<
    BookingRequestRecord["status"],
    {
        title: string;
        description: string;
    }
> = {
    pending: {
        title: "Initial response",
        description:
            "This request is still pending. You can confirm or decline it as the first photographer-side lifecycle action.",
    },
    confirmed: {
        title: "Ready for completion",
        description:
            "This booking has already been confirmed. When the work is done, you can now mark it as completed in this phase.",
    },
    declined: {
        title: "Request declined",
        description:
            "This request has already been declined, so no further lifecycle action is available here.",
    },
    completed: {
        title: "Booking completed",
        description:
            "This booking already reached the final lifecycle state supported in the current phase.",
    },
    cancelled: {
        title: "Request cancelled by client",
        description:
            "The client cancelled this request while it was still pending, so no photographer-side action is available now.",
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

export const PhotographerBookingDetailCard = ({
    booking,
    isUpdating = false,
    actionError,
    onStatusChange,
    timelineEvents,
    isTimelineLoading = false,
    timelineError,
}: PhotographerBookingDetailCardProps) =>
{
    if (!booking) {
        return (
            <Card className="border-brand-border bg-brand-surface">
                <CardContent className="space-y-4 p-6">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                        Request details
                    </p>
                    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-background/70 p-6 text-sm text-brand-muted">
                        Select a booking request from the inbox to review its full brief.
                    </div>
                </CardContent>
            </Card>
        );
    }

    const canRespond = booking.status === "pending";
    const canComplete = booking.status === "confirmed";
    const currentLifecycleCopy = lifecycleCopy[booking.status];

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
                                {resolveLabel(booking.sessionType, sessionTypeOptions)}
                            </h2>
                            <p className="text-sm text-brand-muted">
                                Submitted {formatDateTime(booking.createdAt)}
                            </p>
                        </div>

                        <BookingStatusPill status={booking.status} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <DetailItem
                            label="Client account email"
                            value={booking.clientEmail || "Not available yet"}
                        />
                        <DetailItem
                            label="Preferred contact"
                            value={booking.contactPreference || "Not specified"}
                        />
                        <DetailItem
                            label="Date & time"
                            value={`${booking.sessionDate || "Date not set"} · ${booking.sessionTime || "Time not set"
                                }`}
                        />
                        <DetailItem
                            label="Duration"
                            value={resolveLabel(booking.duration, durationOptions)}
                        />
                        <DetailItem
                            label="Budget"
                            value={resolveLabel(booking.budget, budgetOptions)}
                        />
                        <DetailItem
                            label="Location"
                            value={booking.location || "Location not set"}
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
                                {booking.inspiration || "No inspiration notes were added."}
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
                            {currentLifecycleCopy.title}
                        </p>
                        <p className="mt-2 leading-6">
                            {currentLifecycleCopy.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {canRespond ? (
                            <>
                                <Button
                                    type="button"
                                    onClick={() => onStatusChange("confirmed")}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? "Updating..." : "Confirm request"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => onStatusChange("declined")}
                                    disabled={isUpdating}
                                >
                                    Decline request
                                </Button>
                            </>
                        ) : null}

                        {canComplete ? (
                            <Button
                                type="button"
                                onClick={() => onStatusChange("completed")}
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Updating..." : "Mark as completed"}
                            </Button>
                        ) : null}
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