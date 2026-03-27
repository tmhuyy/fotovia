import { getPhotographerDetail } from "../../../features/photographer/data/mock-photographer-details";
import { PhotographerDetailPage } from "../../../features/photographer/components/photographer-detail-page";

interface PhotographerDetailRouteProps {
  params: { id: string };
}

export default function PhotographerDetailRoute({
  params,
}: PhotographerDetailRouteProps) {
  const photographer = getPhotographerDetail(params.id);

  return <PhotographerDetailPage photographer={photographer} />;
}
