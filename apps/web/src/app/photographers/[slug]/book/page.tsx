import { getPhotographerDetailBySlug } from "../../../../features/photographer/data/mock-photographer-details";
import { BookingRequestPage } from "../../../../features/booking/components/booking-request-page";

interface BookingRequestRouteProps {
    params: Promise<{ slug: string }>;
}

export default async function BookingRequestRoute({
    params,
}: BookingRequestRouteProps) {
    const { slug } = await params;

    const photographer = getPhotographerDetailBySlug(decodeURIComponent(slug));

    return <BookingRequestPage photographer={photographer} />;
}
