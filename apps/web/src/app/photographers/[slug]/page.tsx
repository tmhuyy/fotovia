import { getPhotographerDetailBySlug } from "../../../features/photographer/data/mock-photographer-details";
import { PhotographerDetailPage } from "../../../features/photographer/components/photographer-detail-page";

interface PhotographerDetailRouteProps {
  params: { slug: string };
}

export default function PhotographerDetailRoute({
  params,
}: PhotographerDetailRouteProps) {
  const photographer = getPhotographerDetailBySlug(params.slug);

  return <PhotographerDetailPage photographer={photographer} />;
}
