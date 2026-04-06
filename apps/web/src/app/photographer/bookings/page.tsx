import { AuthenticatedRoute } from "../../../features/auth/components/authenticated-route";
import { PhotographerBookingsPage } from "../../../features/booking/components/photographer-bookings-page";

export default function PhotographerBookingsRoute()
{
    return (
        <AuthenticatedRoute>
            <PhotographerBookingsPage />
        </AuthenticatedRoute>
    );
}