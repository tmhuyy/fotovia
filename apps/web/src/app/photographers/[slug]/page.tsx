import { getPhotographerDetailBySlug } from "../../../features/photographer/data/mock-photographer-details";
import { PhotographerDetailPage } from "../../../features/photographer/components/photographer-detail-page";

interface PhotographerDetailRouteProps {
    params: Promise<{ slug: string }>;
}

export default async function PhotographerDetailRoute({
    params,
}: PhotographerDetailRouteProps) {
    const { slug } = await params;
    const photographer = getPhotographerDetailBySlug(decodeURIComponent(slug));

    return <PhotographerDetailPage photographer={photographer} />;
}
