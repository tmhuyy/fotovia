import { AuthenticatedRoute } from "../../../../features/auth/components/authenticated-route";
import { BookingRequestPage } from "../../../../features/booking/components/booking-request-page";
import { getPhotographerDetailBySlug } from "../../../../features/photographer/data/mock-photographer-details";

interface BookingRequestRouteProps {
    params: Promise<{ slug: string }>;
}

export default async function BookingRequestRoute({
    params,
}: BookingRequestRouteProps) {
    const { slug } = await params;
    const photographer = getPhotographerDetailBySlug(decodeURIComponent(slug));

    return (
        <AuthenticatedRoute>
            <BookingRequestPage photographer={photographer} />
        </AuthenticatedRoute>
    );
}
