import { AuthenticatedRoute } from "../../../features/auth/components/authenticated-route";
import { BookingBriefPage } from "../../../features/booking/components/booking-brief-page";

interface BookingBriefRouteProps {
    searchParams: {
        sessionType?: string;
        location?: string;
        date?: string;
        budget?: string;
    };
}

export default function BookingBriefRoute({
    searchParams,
}: BookingBriefRouteProps) {
    return (
        <AuthenticatedRoute>
            <BookingBriefPage prefill={searchParams} />
        </AuthenticatedRoute>
    );
}
