import type {
    BookingRequestRecord,
    ClientBookingFilter,
} from "../types/booking.types";
import { Card, CardContent } from "../../../components/ui/card";
import { BookingStatusPill } from "./booking-status-pill";

interface ClientBookingsListProps
{
    bookings: BookingRequestRecord[];
    selectedBookingId: string | null;
    activeFilter: ClientBookingFilter;
    counts: Record<ClientBookingFilter, number>;
    onSelect: (bookingId: string) => void;
    onFilterChange: (filter: ClientBookingFilter) => void;
}

const filterOptions: { value: ClientBookingFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "declined", label: "Declined" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
];

const formatSessionType = (value: string) =>
{
    if (!value.trim()) {
        return "Untitled session";
    }

    return value
        .split("-")
        .join(" ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatSubmittedAt = (value: string) =>
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

export const ClientBookingsList = ({
    bookings,
    selectedBookingId,
    activeFilter,
    counts,
    onSelect,
    onFilterChange,
}: ClientBookingsListProps) =>
{
    return (
        <Card className="h-fit border-brand-border bg-brand-surface">
            <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                        My requests
                    </p>
                    <h2 className="text-2xl font-semibold text-brand-primary">
                        Booking history
                    </h2>
                    <p className="text-sm leading-6 text-brand-muted">
                        Review the requests you have already sent and keep track
                        of the photographer response status.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) =>
                    {
                        const isActive = option.value === activeFilter;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onFilterChange(option.value)}
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${isActive
                                        ? "border-brand-primary bg-brand-primary text-white"
                                        : "border-brand-border bg-brand-background text-brand-muted hover:text-brand-primary"
                                    }`}
                            >
                                <span>{option.label}</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${isActive
                                            ? "bg-white/15 text-white"
                                            : "bg-brand-surface text-brand-primary"
                                        }`}
                                >
                                    {counts[option.value]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {bookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-brand-border bg-brand-background/70 p-5 text-sm text-brand-muted">
                        No booking requests match this filter yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.map((booking) =>
                        {
                            const isSelected = booking.id === selectedBookingId;

                            return (
                                <button
                                    key={booking.id}
                                    type="button"
                                    onClick={() => onSelect(booking.id)}
                                    className={`w-full rounded-2xl border p-4 text-left transition ${isSelected
                                            ? "border-brand-primary bg-brand-background"
                                            : "border-brand-border bg-brand-surface hover:bg-brand-background/60"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="font-medium text-brand-primary">
                                                {booking.photographerName ||
                                                    "Photographer"}
                                            </p>
                                            <p className="text-sm text-brand-muted">
                                                {formatSessionType(
                                                    booking.sessionType,
                                                )}
                                            </p>
                                        </div>

                                        <BookingStatusPill
                                            status={booking.status}
                                        />
                                    </div>

                                    <div className="mt-4 grid gap-2 text-sm text-brand-muted">
                                        <span>
                                            {booking.sessionDate ||
                                                "Date not set"}{" "}
                                            ·{" "}
                                            {booking.sessionTime ||
                                                "Time not set"}
                                        </span>
                                        <span>
                                            {booking.location ||
                                                "Location not set"}
                                        </span>
                                        <span>
                                            Submitted{" "}
                                            {formatSubmittedAt(
                                                booking.createdAt,
                                            )}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};