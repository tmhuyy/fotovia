"use client";

import { useMemo, useState } from "react";

import { Badge } from "../../../components/ui/badge";
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

const getStyleMeta = (item: PhotographerPortfolioShowcaseItem) =>
{
  if (!item.styleLabel) {
    return {
      eyebrow: "Style",
      value: "Style summary is not available yet.",
    };
  }

  return {
    eyebrow: item.styleSource === "ai" ? "AI-detected style" : "Style",
    value: item.styleLabel,
  };
};

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
        title="Saved portfolio work"
        description="Open real cover and gallery images. When available, Fotovia now surfaces AI-detected style as the main style signal for each portfolio item."
      >
        {photographer.portfolio.length ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="neutral">
                {photographer.portfolio.length} saved portfolio item
                {photographer.portfolio.length === 1 ? "" : "s"}
              </Badge>

              {hiddenCount > 0 ? (
                <Badge variant="neutral">
                  Showing the first {visibleItems.length}
                </Badge>
              ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item) =>
              {
                const styleMeta = getStyleMeta(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="overflow-hidden rounded-[2rem] border border-border bg-surface text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-brand-background">
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-4 p-6">
                      <div className="flex flex-wrap gap-2">
                        {item.isFeatured ? (
                          <Badge variant="accent">
                            Featured
                          </Badge>
                        ) : null}

                        {item.styleSource === "ai" &&
                          item.styleLabel ? (
                          <Badge variant="ai">
                            AI style
                          </Badge>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                          {styleMeta.eyebrow}
                        </p>

                        <p className="text-sm font-medium text-foreground">
                          {styleMeta.value}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl text-foreground">
                          {item.title}
                        </h3>

                        <p className="text-sm leading-7 text-muted">
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
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-border bg-surface px-6 py-8">
            <p className="text-sm leading-7 text-muted">
              This photographer has not published public portfolio works
              yet.
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