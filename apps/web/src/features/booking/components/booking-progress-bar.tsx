import type { BookingEventRecord } from "../types/booking-event.types";
import type { BookingRequestRecord } from "../types/booking.types";
import { hasAssignedPhotographer } from "../utils/booking-display";

interface BookingProgressBarProps
{
    booking: BookingRequestRecord;
    events?: BookingEventRecord[];
}

interface ProgressStep
{
    label: string;
    helper: string;
    active: boolean;
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

    const steps: ProgressStep[] = isCancelled
        ? [
            {
                label: "Booking created",
                helper: "The client published the booking request.",
                active: true,
            },
            {
                label: "Request cancelled",
                helper: "The booking request is now closed.",
                active: true,
            },
        ]
        : [
            {
                label: "Booking created",
                helper: "Your photoshoot brief is ready.",
                active: true,
            },
            {
                label: "Photographer applied",
                helper:
                    applicationCount > 0
                        ? `${applicationCount} photographer${applicationCount === 1 ? "" : "s"} applied.`
                        : "Waiting for photographer proposals.",
                active: applicationCount > 0 || hasPhotographer,
            },
            {
                label: "Photographer selected",
                helper: hasPhotographer
                    ? "A photographer has been selected."
                    : "Choose the photographer that fits your brief.",
                active: hasPhotographer || isConfirmed,
            },
            {
                label: "Confirmed",
                helper: isConfirmed
                    ? "The booking is confirmed."
                    : "Confirmation happens after photographer selection.",
                active: isConfirmed,
            },
            {
                label: "Completed",
                helper: isCompleted
                    ? "This photoshoot has been completed."
                    : "Final state after the photoshoot is finished.",
                active: isCompleted,
            },
        ];

    return (
        <aside className="rounded-[2rem] border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(23,23,23,0.05)] lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                Booking progress
            </p>

            <div className="mt-6 space-y-1">
                {steps.map((step, index) =>
                {
                    const isLast = index === steps.length - 1;
                    const nextStepIsActive = steps[index + 1]?.active;
                    const isDangerStep = isCancelled && step.label.includes("cancelled");

                    return (
                        <div key={step.label} className="relative flex gap-4 pb-7 last:pb-0">
                            {!isLast ? (
                                <div
                                    className={[
                                        "absolute left-[1.05rem] top-10 h-[calc(100%-2.25rem)] w-px",
                                        nextStepIsActive
                                            ? isCancelled
                                                ? "bg-rose-500"
                                                : "bg-accent"
                                            : "bg-border",
                                    ].join(" ")}
                                />
                            ) : null}

                            <div
                                className={[
                                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold shadow-sm transition",
                                    step.active
                                        ? isDangerStep
                                            ? "border-rose-500 bg-rose-500 text-white"
                                            : "border-accent bg-accent text-white"
                                        : "border-border bg-background text-muted",
                                ].join(" ")}
                            >
                                {step.active ? "✓" : index + 1}
                            </div>

                            <div className="-mt-0.5 min-w-0">
                                <p
                                    className={[
                                        "text-base font-semibold leading-6",
                                        step.active ? "text-foreground" : "text-muted",
                                    ].join(" ")}
                                >
                                    {step.label}
                                </p>

                                {/* <p className="mt-1 text-sm leading-6 text-muted">
                                    {step.helper}
                                </p> */}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isCancelled && cancelledEvent?.note ? (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                    <span className="font-semibold">Cancel reason:</span>{" "}
                    {cancelledEvent.note.replace(/^Cancel reason:\s*/i, "")}
                </div>
            ) : null}
        </aside>
    );
};