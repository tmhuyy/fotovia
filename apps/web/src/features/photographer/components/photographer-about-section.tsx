import { Badge } from "../../../components/ui/badge";
import type { PhotographerDetail } from "../types/photographer-detail.types";
import { PhotographerDetailSection } from "./photographer-detail-section";

interface PhotographerAboutSectionProps
{
  photographer: PhotographerDetail;
}

export const PhotographerAboutSection = ({
  photographer,
}: PhotographerAboutSectionProps) =>
{
  return (
    <PhotographerDetailSection
      eyebrow="About"
      title="Learn more about this photographer"
      description="This section now reflects real saved profile data instead of mock-only presentation content."
    >
      <div className="space-y-5">
        <p className="text-sm leading-7 text-muted">
          {photographer.bio || photographer.intro}
        </p>

        <p className="text-sm leading-7 text-muted">{photographer.intro}</p>

        {photographer.specialties.length ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              Specialties
            </p>

            <div className="flex flex-wrap gap-2">
              {photographer.specialties.map((specialty) => (
                <Badge key={specialty} variant="neutral">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </PhotographerDetailSection>
  );
};