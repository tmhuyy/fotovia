import type { PhotographerDetail } from "../types/photographer-detail.types";
import { PhotographerDetailSection } from "./photographer-detail-section";

interface PhotographerPortfolioSectionProps
{
  photographer: PhotographerDetail;
}

export const PhotographerPortfolioSection = ({
  photographer,
}: PhotographerPortfolioSectionProps) =>
{
  return (
    <PhotographerDetailSection
      eyebrow="Portfolio"
      title="Saved works from this photographer"
      description="These works now come from real backend-saved portfolio items with cover images and optional galleries."
    >
      {photographer.portfolio.length ? (
        <div className="space-y-6">
          {photographer.portfolio.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[1.5rem] border border-border bg-background"
            >
              <div className="aspect-[16/10] overflow-hidden bg-brand-background">
                <img
                  src={item.coverImageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      {item.category}
                    </p>

                    <h3 className="font-serif text-2xl text-foreground">
                      {item.title}
                    </h3>
                  </div>

                  {item.isFeatured ? (
                    <span className="rounded-full bg-brand-accent/15 px-2.5 py-1 text-xs font-medium text-brand-primary">
                      Featured
                    </span>
                  ) : null}
                </div>

                <p className="text-sm leading-7 text-muted">
                  {item.description || "Saved portfolio work from this photographer."}
                </p>

                {item.galleryImages.length ? (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                      Gallery
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {item.galleryImages.map((galleryImageUrl, index) => (
                        <div
                          key={`${item.id}-gallery-${index}`}
                          className="overflow-hidden rounded-[1rem] border border-border bg-brand-background"
                        >
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={galleryImageUrl}
                              alt={`${item.title} gallery ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
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