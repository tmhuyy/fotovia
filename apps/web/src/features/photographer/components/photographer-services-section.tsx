import type { PhotographerDetail } from "../types/photographer-detail.types";
import { PhotographerDetailSection } from "./photographer-detail-section";

interface PhotographerServicesSectionProps {
  photographer: PhotographerDetail;
}

export const PhotographerServicesSection = ({
  photographer,
}: PhotographerServicesSectionProps) => {
  return (
    <PhotographerDetailSection
      title="Services"
      description="Service highlights to help you plan the right session."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {photographer.services.map((service) => (
          <div
            key={service.title}
            className="rounded-2xl border border-border bg-background p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {service.title}
                </p>
                <p className="text-xs text-muted">{service.duration}</p>
              </div>
              <span className="text-xs font-medium text-foreground">
                From ${service.startingPrice}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">{service.description}</p>
          </div>
        ))}
      </div>
    </PhotographerDetailSection>
  );
};
