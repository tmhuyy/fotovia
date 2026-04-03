import type { PhotographerDetail } from "../types/photographer-detail.types";
import { PhotographerDetailSection } from "./photographer-detail-section";

interface PhotographerPortfolioSectionProps {
  photographer: PhotographerDetail;
}

export const PhotographerPortfolioSection = ({
  photographer,
}: PhotographerPortfolioSectionProps) => {
  return (
    <PhotographerDetailSection
      title="Portfolio preview"
      description="A selection of recent work to set the mood."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photographer.portfolio.map((item) => (
          <div
            key={item}
            className="aspect-[4/3] rounded-2xl border border-border bg-background"
          />
        ))}
      </div>
    </PhotographerDetailSection>
  );
};
