import { AuthenticatedRoute } from "../../../features/auth/components/authenticated-route";
import { BookingEntryPage } from "../../../features/booking/components/booking-entry-page";
import type { BookingEntrySearchParams } from "../../../features/booking/types/booking.types";

interface BookingRouteProps
{
    searchParams: BookingEntrySearchParams;
}

export default function BookingRoute({ searchParams }: BookingRouteProps)
{
    return (
        <AuthenticatedRoute>
            <BookingEntryPage searchParams={searchParams} />
        </AuthenticatedRoute>
    );
}