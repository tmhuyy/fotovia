import type { BookingRequestRecord } from "../../types/booking.types";
import
    {
        formatBookingDate,
        formatBookingTime,
        formatBudgetLabel,
        formatShootTypeLabel,
        formatSubmittedAt,
        getBookingDisplayTitle,
        getBookingPrimaryLabel,
        hasAssignedPhotographer,
    } from "../../utils/booking-display";
import { BookingStatusPill } from "../booking-status-pill";

interface BookingWorkspaceCardProps
{
    booking: BookingRequestRecord;
    isSelected: boolean;
    viewer: "client" | "photographer";
    onSelect: (bookingId: string) => void;
}

const getClientDisplayName = (booking: BookingRequestRecord): string =>
{
    return (
        booking.clientName ||
        booking.clientFullName ||
        booking.clientProfileName ||
        booking.fullName ||
        booking.clientEmail ||
        "Client"
    );
};

const getApplicationCount = (booking: BookingRequestRecord): number =>
{
    return (
        booking.photographerApplicationsCount ??
        booking.applicationsCount ??
        booking.applicationCount ??
        0
    );
};

export const BookingWorkspaceCard = ({
    booking,
    isSelected,
    viewer,
    onSelect,
}: BookingWorkspaceCardProps) =>
{
    const applicationCount = getApplicationCount(booking);
    const hasPhotographer = hasAssignedPhotographer(booking);
    const title = getBookingDisplayTitle(booking);
    const shootType = formatShootTypeLabel(booking.shootType || booking.sessionType);

    const primaryPersonLabel =
        viewer === "photographer"
            ? getClientDisplayName(booking)
            : hasPhotographer
                ? getBookingPrimaryLabel(booking)
                : "Open request";

    const secondaryMeta =
        viewer === "photographer"
            ? `Submitted ${formatSubmittedAt(booking.createdAt)}`
            : applicationCount > 0
                ? `${applicationCount} ${applicationCount === 1 ? "application" : "applications"}`
                : "Waiting for response";

    return (
        <button
            type="button"
            onClick={() => onSelect(booking.id)}
            className={`w-full rounded-[1.75rem] border p-5 text-left transition ${isSelected
                    ? "border-brand-primary bg-brand-background shadow-sm"
                    : "border-brand-border bg-brand-surface hover:bg-brand-background/70"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-lg font-semibold text-brand-primary">
                            {title}
                        </p>
                        <span className="text-xs text-brand-muted">
                            #{booking.id.slice(0, 7)}
                        </span>
                    </div>

                    <p className="text-sm font-medium text-brand-primary">
                        {primaryPersonLabel}
                    </p>

                    <p className="text-sm text-brand-muted">{secondaryMeta}</p>
                </div>

                <BookingStatusPill status={booking.status} />
            </div>

            <div className="mt-5 grid gap-3 text-sm text-brand-muted sm:grid-cols-2">
                <span>
                    <span className="text-brand-primary">{shootType}</span>
                    {" · "}
                    {formatBookingTime(booking.sessionTime)}
                </span>

                <span>
                    {formatBookingDate(booking.sessionDate)}
                </span>

                <span>{booking.location || "Location not set"}</span>

                <span className="font-medium text-brand-accent">
                    {formatBudgetLabel(booking.budget)}
                </span>
            </div>
        </button>
    );
};