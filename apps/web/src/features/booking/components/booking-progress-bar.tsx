import type { BookingEventRecord } from "../types/booking-event.types";
import type { BookingRequestRecord } from "../types/booking.types";
import { hasAssignedPhotographer } from "../utils/booking-display";

interface BookingProgressBarProps
{
    booking: BookingRequestRecord;
    events?: BookingEventRecord[];
}

const getApplicationCount = (booking: BookingRequestRecord): number =>
{
    return (
        booking.photographerApplicationsCount ??
        booking.applicationsCount ??
        booking.applicationCount ??
        0
    );
};

const getCancelledEvent = (
    events: BookingEventRecord[] = [],
): BookingEventRecord | null =>
{
    return (
        [...events]
            .reverse()
            .find((event) => event.eventType === "cancelled") ?? null
    );
};

export const BookingProgressBar = ({
    booking,
    events = [],
}: BookingProgressBarProps) =>
{
    const applicationCount = getApplicationCount(booking);
    const hasPhotographer = hasAssignedPhotographer(booking);
    const isCancelled = booking.status === "cancelled";
    const isConfirmed =
        booking.status === "confirmed" || booking.status === "completed";
    const isCompleted = booking.status === "completed";
    const cancelledEvent = getCancelledEvent(events);

    const steps = isCancelled
        ? [
            {
                label: "Booking created",
                active: true,
            },
            {
                label: "Request cancelled",
                active: true,
            },
        ]
        : [
            {
                label: "Booking created",
                active: true,
            },
            {
                label: "Photographer applied",
                active: applicationCount > 0 || hasPhotographer,
            },
            {
                label: "Photographer selected",
                active: hasPhotographer || isConfirmed,
            },
            {
                label: "Confirmed",
                active: isConfirmed,
            },
            {
                label: "Completed",
                active: isCompleted,
            },
        ];

    return (
        <section className="">
            

            <div className="mt-6 overflow-x-auto pb-1">
                <div className="flex min-w-max items-center gap-3">
                    {steps.map((step, index) =>
                    {
                        const isLast = index === steps.length - 1;

                        return (
                            <div
                                key={step.label}
                                className="flex items-center gap-3"
                            >
                                <div className="flex min-w-28 flex-col items-center gap-2">
                                    <div
                                        className={[
                                            "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                                            step.active
                                                ? isCancelled
                                                    ? "border-rose-500 bg-rose-500 text-white"
                                                    : "border-accent bg-accent text-white"
                                                : "border-border bg-background text-muted",
                                        ].join(" ")}
                                    >
                                        {step.active ? "✓" : index + 1}
                                    </div>

                                    <span
                                        className={[
                                            "max-w-32 text-center text-xs font-medium leading-5",
                                            step.active
                                                ? "text-foreground"
                                                : "text-muted",
                                        ].join(" ")}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {!isLast ? (
                                    <div
                                        className={[
                                            "h-px w-14 sm:w-20",
                                            steps[index + 1]?.active
                                                ? isCancelled
                                                    ? "bg-rose-500"
                                                    : "bg-accent"
                                                : "bg-border",
                                        ].join(" ")}
                                    />
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>

            {isCancelled && cancelledEvent?.note ? (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                    <span className="font-semibold">Cancel reason:</span>{" "}
                    {cancelledEvent.note.replace(/^Cancel reason:\s*/i, "")}
                </div>
            ) : null}
        </section>
    );
};