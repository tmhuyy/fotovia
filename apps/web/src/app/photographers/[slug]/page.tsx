import { PhotographerDetailPage } from "../../../features/photographer/components/photographer-detail-page";

interface PhotographerDetailRouteProps
{
    params: Promise<{ slug: string }>;
}

export default async function PhotographerDetailRoute({
    params,
}: PhotographerDetailRouteProps)
{
    const { slug } = await params;

    return <PhotographerDetailPage slug={decodeURIComponent(slug)} />;
}