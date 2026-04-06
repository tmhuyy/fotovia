import type {
    BookingInboxFilter,
    BookingRequestRecord,
} from "../types/booking.types";
import { Card, CardContent } from "../../../components/ui/card";
import { BookingStatusPill } from "./booking-status-pill";

interface PhotographerBookingsListProps
{
    bookings: BookingRequestRecord[];
    selectedBookingId: string | null;
    activeFilter: BookingInboxFilter;
    counts: Record<BookingInboxFilter, number>;
    onSelect: (bookingId: string) => void;
    onFilterChange: (filter: BookingInboxFilter) => void;
}

const filterOptions: { value: BookingInboxFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "declined", label: "Declined" },
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

const formatBudget = (value: string) =>
{
    return value
        ? value.replace(/-/g, " – ").replace(/\b\w/g, (char) => char.toUpperCase())
        : "Flexible";
};

export const PhotographerBookingsList = ({
    bookings,
    selectedBookingId,
    activeFilter,
    counts,
    onSelect,
    onFilterChange,
}: PhotographerBookingsListProps) =>
{
    return (
        <Card className="h-fit border-brand-border bg-brand-surface">
            <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                        Incoming requests
                    </p>
                    <h2 className="text-2xl font-semibold text-brand-primary">
                        Booking inbox
                    </h2>
                    <p className="text-sm leading-6 text-brand-muted">
                        Review incoming requests and choose the first response status for
                        each one.
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
                                                {formatSessionType(booking.sessionType)}
                                            </p>
                                            <p className="text-sm text-brand-muted">
                                                {booking.clientEmail || "Client account email unavailable"}
                                            </p>
                                        </div>

                                        <BookingStatusPill status={booking.status} />
                                    </div>

                                    <div className="mt-4 grid gap-2 text-sm text-brand-muted">
                                        <span>
                                            {booking.sessionDate || "Date not set"} ·{" "}
                                            {booking.sessionTime || "Time not set"}
                                        </span>
                                        <span>{booking.location || "Location not set"}</span>
                                        <span>{formatBudget(booking.budget)}</span>
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