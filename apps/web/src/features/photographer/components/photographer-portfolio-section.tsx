"use client";

import { useMemo, useState } from "react";

import type {
  PhotographerDetail,
  PhotographerPortfolioShowcaseItem,
} from "../types/photographer-detail.types";
import { PhotographerDetailSection } from "./photographer-detail-section";
import { PhotographerPortfolioViewerDialog } from "./photographer-portfolio-viewer-dialog";

interface PhotographerPortfolioSectionProps
{
  photographer: PhotographerDetail;
}

const MAX_VISIBLE_PORTFOLIO_CARDS = 10;

export const PhotographerPortfolioSection = ({
  photographer,
}: PhotographerPortfolioSectionProps) =>
{
  const [selectedItem, setSelectedItem] =
    useState<PhotographerPortfolioShowcaseItem | null>(null);

  const visibleItems = useMemo(() =>
  {
    return photographer.portfolio.slice(0, MAX_VISIBLE_PORTFOLIO_CARDS);
  }, [photographer.portfolio]);

  const hiddenCount = Math.max(
    photographer.portfolio.length - visibleItems.length,
    0,
  );

  return (
    <>
      <PhotographerDetailSection
        eyebrow="Portfolio"
        title="Saved works from this photographer"
        description="This section is now compact by default. Open any portfolio card to view the full cover image and gallery in a focused viewer."
      >
        {photographer.portfolio.length ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted">
                {photographer.portfolio.length} saved portfolio item
                {photographer.portfolio.length === 1 ? "" : "s"}
              </p>

              {hiddenCount > 0 ? (
                <p className="text-sm text-muted">
                  Showing the first {visibleItems.length}. Scroll for more on
                  future phases.
                </p>
              ) : null}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="group w-[280px] shrink-0 overflow-hidden rounded-[1.5rem] border border-border bg-background text-left transition hover:border-accent"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-brand-background">
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        {item.category}
                      </p>

                      {item.isFeatured ? (
                        <span className="rounded-full bg-brand-accent/15 px-2.5 py-1 text-[11px] font-medium text-brand-primary">
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif text-xl text-foreground">
                        {item.title}
                      </h3>

                      <p className="line-clamp-2 text-sm leading-6 text-muted">
                        {item.description ||
                          "Saved portfolio work from this photographer."}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      {item.galleryImages.length
                        ? `Open ${item.galleryImages.length + 1} images`
                        : "Open cover image"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-6">
            <p className="text-sm leading-7 text-muted">
              This photographer has not published public portfolio works yet.
            </p>
          </div>
        )}
      </PhotographerDetailSection>

      <PhotographerPortfolioViewerDialog
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
};