import type { PhotographerDetail } from "../types/photographer-detail.types";
import { PhotographerDetailSection } from "./photographer-detail-section";

interface PhotographerAboutSectionProps {
  photographer: PhotographerDetail;
}

export const PhotographerAboutSection = ({
  photographer,
}: PhotographerAboutSectionProps) => {
  return (
    <PhotographerDetailSection
      title="About"
      description="Get to know the creative direction and approach."
    >
      <div className="space-y-4 text-sm text-muted">
        <p>{photographer.bio}</p>
        <p>{photographer.intro}</p>
      </div>
    </PhotographerDetailSection>
  );
};
