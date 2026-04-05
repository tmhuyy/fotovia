import type {
  PhotographerDetail,
  PhotographerPortfolioEntry,
  PhotographerPortfolioShowcaseItem,
} from "../types/photographer-detail.types";
import { PhotographerDetailSection } from "./photographer-detail-section";

interface PhotographerPortfolioSectionProps
{
  photographer: PhotographerDetail;
}

const isPortfolioObject = (
  item: PhotographerPortfolioEntry,
): item is PhotographerPortfolioShowcaseItem =>
{
  return typeof item !== "string";
};

export const PhotographerPortfolioSection = ({
  photographer,
}: PhotographerPortfolioSectionProps) =>
{
  return (
    <PhotographerDetailSection
      eyebrow="Portfolio"
      title="Saved works from this photographer"
      description="These works now come from real backend-saved portfolio items."
    >
      {photographer.portfolio.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {photographer.portfolio.map((item, index) =>
          {
            if (!isPortfolioObject(item)) {
              return (
                <div
                  key={`${item}-${index}`}
                  className="overflow-hidden rounded-[1.5rem] border border-border bg-background"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-brand-background to-brand-surface" />

                  <div className="space-y-2 p-4">
                    <p className="text-sm font-medium text-foreground">
                      Portfolio work
                    </p>

                    <p className="text-sm text-muted">
                      Saved media preview is being prepared.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-[1.5rem] border border-border bg-background"
              >
                <div className="aspect-[4/3] overflow-hidden bg-brand-background">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>

                    {item.isFeatured ? (
                      <span className="rounded-full bg-brand-accent/15 px-2.5 py-1 text-xs font-medium text-brand-primary">
                        Featured
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {item.category}
                  </p>

                  <p className="text-sm leading-6 text-muted">
                    {item.description || "Saved portfolio work from this photographer."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-6">
          <p className="text-sm leading-7 text-muted">
            This photographer has not published public portfolio works yet.
          </p>
        </div>
      )}
    </PhotographerDetailSection>
  );
};