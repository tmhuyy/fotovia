"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { photographerService } from "../../../services/photographer.service";
import type { PhotographerDetail } from "../types/photographer-detail.types";
import type { PhotographerProfile } from "../types/photographer.types";

type RepresentativePortfolioItem = PhotographerDetail["portfolio"][number];

interface PhotographerCardProps
{
  photographer: PhotographerProfile;
}

const getShortBio = (value: string) =>
{
  const normalizedValue = value.trim();

  if (normalizedValue.length <= 112) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, 109).trim()}...`;
};

const getDisplayStyles = (styles: string[], discoveryStyles: string[]) =>
{
  const mergedStyles = [...discoveryStyles, ...styles]
    .map((style) => style.trim())
    .filter(Boolean);

  return Array.from(new Set(mergedStyles)).slice(0, 3);
};

const getRepresentativePortfolioItem = (
  detail: PhotographerDetail | null,
): RepresentativePortfolioItem | null =>
{
  const portfolioItems = detail?.portfolio ?? [];

  if (portfolioItems.length === 0) {
    return null;
  }

  return (
    portfolioItems.find((item) => item.isFeatured) ??
    portfolioItems[0] ??
    null
  );
};

const getStyleSignal = ({
  profile,
  representativeItem,
}: {
  profile: PhotographerProfile;
  representativeItem: RepresentativePortfolioItem | null;
}) =>
{
  return (
    representativeItem?.styleLabel?.trim() ||
    profile.primaryDiscoveryStyle?.trim() ||
    profile.discoveryStyles[0]?.trim() ||
    profile.styles[0]?.trim() ||
    "Portfolio"
  );
};

const getCoverImageUrl = (
  representativeItem: RepresentativePortfolioItem | null,
) =>
{
  return representativeItem?.coverImageUrl?.trim() || null;
};

const getGalleryThumbnailUrls = (
  representativeItem: RepresentativePortfolioItem | null,
) =>
{
  return Array.from(
    new Set(
      (representativeItem?.galleryImages ?? [])
        .map((url) => url.trim())
        .filter(Boolean),
    ),
  ).slice(0, 3);
};

const getPortfolioCountLabel = (count: number) =>
{
  if (count <= 0) {
    return "Portfolio updating";
  }

  if (count === 1) {
    return "1 public work";
  }

  return `${count} public works`;
};

const getWorkLabel = (
  representativeItem: RepresentativePortfolioItem | null,
) =>
{
  if (!representativeItem) {
    return "Portfolio";
  }

  return representativeItem.isFeatured ? "Featured work" : "Latest work";
};

const formatStartingPrice = (value: number | null) =>
{
  if (value === null) {
    return "Pricing on request";
  }

  return `From ${new Intl.NumberFormat("vi-VN").format(value)} VND`;
};

const PortfolioImageFallback = ({ styleSignal }: { styleSignal: string }) =>
{
  return (
    <div className="flex h-full w-full items-end bg-gradient-to-br from-accent/25 via-surface to-background p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Style signal
        </p>

        <p className="mt-2 font-serif text-3xl leading-tight text-foreground">
          {styleSignal}
        </p>

        <p className="mt-2 text-sm text-muted">
          Portfolio image coming soon
        </p>
      </div>
    </div>
  );
};

const PhotographerImagePreview = ({
  coverImageUrl,
  galleryThumbnailUrls,
  styleSignal,
  portfolioItemCount,
  workLabel,
}: {
  coverImageUrl: string | null;
  galleryThumbnailUrls: string[];
  styleSignal: string;
  portfolioItemCount: number;
  workLabel: string;
}) =>
{
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-border bg-background">
      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt={`${styleSignal} portfolio cover preview`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <PortfolioImageFallback styleSignal={styleSignal} />
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent px-5 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-background/70">
          Style signal
        </p>

        <p className="mt-1 font-serif text-3xl leading-tight text-background">
          {styleSignal}
        </p>
      </div>

      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
          {workLabel}
        </span>

        <span className="rounded-full bg-foreground/80 px-3 py-1 text-xs font-semibold text-background shadow-sm">
          {getPortfolioCountLabel(portfolioItemCount)}
        </span>
      </div>

      {galleryThumbnailUrls.length > 0 ? (
        <div className="absolute right-4 top-4 hidden w-16 gap-1 sm:grid">
          {galleryThumbnailUrls.map((url) => (
            <div
              key={url}
              className="aspect-square overflow-hidden rounded-xl border border-background/70 bg-surface shadow-sm"
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const PhotographerCard = ({ photographer }: PhotographerCardProps) =>
{
  const detailQuery = useQuery({
    queryKey: ["public-photographer-detail-card", photographer.slug],
    queryFn: () =>
      photographerService.getPublicPhotographerDetailBySlug(
        photographer.slug,
      ),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const detail = detailQuery.data ?? null;
  const representativeItem = getRepresentativePortfolioItem(detail);

  const styleSignal = getStyleSignal({
    profile: photographer,
    representativeItem,
  });

  const styleBadges = Array.from(
    new Set([
      styleSignal,
      ...getDisplayStyles(
        photographer.styles,
        photographer.discoveryStyles,
      ),
    ]),
  ).slice(0, 3);

  const coverImageUrl = getCoverImageUrl(representativeItem);
  const galleryThumbnailUrls = getGalleryThumbnailUrls(representativeItem);

  const portfolioItemCount =
    detail?.portfolio.length ?? photographer.portfolioItemCount;

  return (
    <Card className="group flex h-full overflow-hidden rounded-[2rem] border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full w-full flex-col p-4">
        <PhotographerImagePreview
          coverImageUrl={coverImageUrl}
          galleryThumbnailUrls={galleryThumbnailUrls}
          styleSignal={styleSignal}
          portfolioItemCount={portfolioItemCount}
          workLabel={getWorkLabel(representativeItem)}
        />

        <div className="flex flex-1 flex-col px-1 pt-5">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              {photographer.location}
            </p>

            <h3 className="font-serif text-3xl leading-tight text-foreground">
              {photographer.name}
            </h3>
          </div>

          <p className="mt-3 h-[4.5rem] overflow-hidden text-sm leading-6 text-muted">
            {getShortBio(photographer.bio)}
          </p>

          <div className="mt-4 flex min-h-8 flex-wrap gap-2">
            {styleBadges.map((style) => (
              <Badge
                key={style}
                variant={style === styleSignal ? "ai" : "neutral"}
              >
                {style}
              </Badge>
            ))}
          </div>
          
          <div className="pt-5">
            <Link
              href={`/photographers/${photographer.slug}`}
              className={buttonVariants({
                size: "lg",
                className: "w-full cursor-pointer rounded-full",
              })}
            >
              View portfolio
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};