import { Card, CardContent } from "../../../components/ui/card";
import type {
    BookingInboxFilter,
    BookingRequestRecord,
} from "../types/booking.types";
import { BookingStatusTabs } from "./workspace/booking-status-tabs";
import { BookingWorkspaceCard } from "./workspace/booking-workspace-card";

interface PhotographerBookingsListProps
{
    bookings: BookingRequestRecord[];
    selectedBookingId: string | null;
    activeFilter: BookingInboxFilter;
    counts: Record<BookingInboxFilter, number>;
    onSelect: (bookingId: string) => void;
    onFilterChange: (filter: BookingInboxFilter) => void;
}

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
                        Review requests, manage responses, and track lifecycle
                        progress from one place.
                    </p>
                </div>

                <BookingStatusTabs
                    activeFilter={activeFilter}
                    counts={counts}
                    onFilterChange={onFilterChange}
                />

                {bookings.length === 0 ? (
                    <div className=" p-5 text-sm text-brand-muted">
                        No matching results
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookings.map((booking) => (
                            <BookingWorkspaceCard
                                key={booking.id}
                                booking={booking}
                                viewer="photographer"
                                isSelected={booking.id === selectedBookingId}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};