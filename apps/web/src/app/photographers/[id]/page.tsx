import { getPhotographerDetail } from "../../../features/photographer/data/mock-photographer-details";
import { PhotographerDetailPage } from "../../../features/photographer/components/photographer-detail-page";

interface PhotographerDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function PhotographerDetailRoute({
  params,
}: PhotographerDetailRouteProps) {
  const { id } = await params;
  const photographer = getPhotographerDetail(decodeURIComponent(id));

  return <PhotographerDetailPage photographer={photographer} />;
}
