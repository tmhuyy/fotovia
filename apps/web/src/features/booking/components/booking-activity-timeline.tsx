import type { BookingEventRecord } from "../types/booking-event.types";
import { Card, CardContent } from "../../../components/ui/card";

interface BookingActivityTimelineProps
{
    events: BookingEventRecord[];
    isLoading?: boolean;
    errorMessage?: string | null;
}

const eventCopy: Record<
    BookingEventRecord["eventType"],
    {
        title: string;
    }
> = {
    created: { title: "Booking request created" },
    confirmed: { title: "Booking request confirmed" },
    declined: { title: "Booking request declined" },
    cancelled: { title: "Booking request cancelled" },
    completed: { title: "Booking marked as completed" },
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

export const BookingActivityTimeline = ({
    events,
    isLoading = false,
    errorMessage,
}: BookingActivityTimelineProps) =>
{
    return (
        <Card className="border-brand-border bg-brand-surface">
            <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                        Activity timeline
                    </p>
                    <h3 className="text-xl font-semibold text-brand-primary">
                        Booking event history
                    </h3>
                    <p className="text-sm leading-6 text-brand-muted">
                        Review the key actions that happened on this booking in chronological order.
                    </p>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-24 animate-pulse rounded-2xl bg-brand-background"
                            />
                        ))}
                    </div>
                ) : errorMessage ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                        {errorMessage}
                    </div>
                ) : events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-background/70 p-5 text-sm text-brand-muted">
                        No timeline events are available for this booking yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event, index) => (
                            <div key={event.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="mt-1 h-3 w-3 rounded-full bg-brand-primary" />
                                    {index < events.length - 1 ? (
                                        <div className="mt-2 h-full min-h-10 w-px bg-brand-border" />
                                    ) : null}
                                </div>

                                <div className="flex-1 rounded-2xl border border-brand-border bg-brand-background/60 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-brand-primary">
                                                {eventCopy[event.eventType].title}
                                            </p>
                                            <p className="mt-1 text-sm text-brand-muted">
                                                {event.actorLabel || "Unknown actor"} ·{" "}
                                                {event.actorRole}
                                            </p>
                                        </div>

                                        <span className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                                            {formatDateTime(event.createdAt)}
                                        </span>
                                    </div>

                                    {event.note ? (
                                        <p className="mt-3 text-sm leading-6 text-brand-muted">
                                            {event.note}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};