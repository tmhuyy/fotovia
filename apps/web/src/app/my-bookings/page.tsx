import { AuthenticatedRoute } from "../../features/auth/components/authenticated-route";
import { ClientBookingsPage } from "../../features/booking/components/client-bookings-page";

export default function MyBookingsRoute()
{
    return (
        <AuthenticatedRoute>
            <ClientBookingsPage />
        </AuthenticatedRoute>
    );
}