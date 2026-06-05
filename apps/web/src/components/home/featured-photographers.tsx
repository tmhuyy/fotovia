"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { photographerService } from "../../services/photographer.service";
import { useAuthStore } from "../../store/auth.store";
import type { PhotographerDetail } from "../../features/photographer/types/photographer-detail.types";
import type { PhotographerProfile } from "../../features/photographer/types/photographer.types";
import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent } from "../ui/card";

type FeaturedPortfolioItem = PhotographerDetail["portfolio"][number];

interface FeaturedPhotographerCardData
{
  profile: PhotographerProfile;
  detail: PhotographerDetail | null;
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
): FeaturedPortfolioItem | null =>
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
  representativeItem: FeaturedPortfolioItem | null;
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

const getCoverImageUrl = ({
  profile,
  representativeItem,
}: {
  profile: PhotographerProfile;
  representativeItem: FeaturedPortfolioItem | null;
}) =>
{
  return (
    representativeItem?.coverImageUrl?.trim() ||
    profile.avatarUrl?.trim() ||
    null
  );
};

const getGalleryThumbnailUrls = (
  representativeItem: FeaturedPortfolioItem | null,
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

const getWorkLabel = (representativeItem: FeaturedPortfolioItem | null) =>
{
  if (!representativeItem) {
    return "Portfolio";
  }

  return representativeItem.isFeatured ? "Featured work" : "Latest work";
};

const FeaturedPhotographersSkeleton = () =>
{
  return (
    <div className="grid items-stretch gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[34rem] animate-pulse rounded-[2rem] border border-border bg-surface/70"
        />
      ))}
    </div>
  );
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

const fetchFeaturedPhotographerCards = async (): Promise<
  FeaturedPhotographerCardData[]
> =>
{
  const profiles = await photographerService.getPublicPhotographers({
    limit: 3,
  });

  return Promise.all(
    profiles.map(async (profile) =>
    {
      try {
        const detail =
          await photographerService.getPublicPhotographerDetailBySlug(
            profile.slug,
          );

        return {
          profile,
          detail,
        };
      } catch {
        return {
          profile,
          detail: null,
        };
      }
    }),
  );
};

export const FeaturedPhotographers = () =>
{
  const { user, isAuthenticated, hasHydrated, isHydrating } = useAuthStore();

  const isPhotographerHome =
    hasHydrated &&
    !isHydrating &&
    isAuthenticated &&
    user?.role === "photographer";

  const featuredQuery = useQuery({
    queryKey: ["home-featured-photographers-with-representative-work"],
    queryFn: fetchFeaturedPhotographerCards,
    retry: false,
    enabled: !isPhotographerHome,
  });

  if (isPhotographerHome) {
    return null;
  }

  const photographerCards = featuredQuery.data ?? [];

  return (
    <section className="pb-16 pt-6">
      <Container className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="neutral">Featured discovery</Badge>

            <div className="space-y-2">
              <h2 className="max-w-3xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                Compare photographers by real portfolio work.
              </h2>

              <p className="max-w-2xl text-sm leading-7 text-muted">
                Start from the images, then open the photographer
                whose public portfolio matches the session you want.
              </p>
            </div>
          </div>

          <Link
            href="/photographers"
            className={buttonVariants({
              variant: "secondary",
              className: "rounded-full",
            })}
          >
            See all photographers
          </Link>
        </div>

        {featuredQuery.isLoading ? (
          <FeaturedPhotographersSkeleton />
        ) : featuredQuery.isError ? (
          <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
            <CardContent className="space-y-4 p-8">
              <h3 className="font-serif text-2xl text-foreground">
                We couldn’t load featured photographers
              </h3>

              <p className="text-sm leading-6 text-muted">
                Please try again in a moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid items-stretch gap-6 md:grid-cols-3">
            {photographerCards.map(({ profile, detail }) =>
            {
              const representativeItem =
                getRepresentativePortfolioItem(detail);

              const styleSignal = getStyleSignal({
                profile,
                representativeItem,
              });

              const styleBadges = Array.from(
                new Set([
                  styleSignal,
                  ...getDisplayStyles(
                    profile.styles,
                    profile.discoveryStyles,
                  ),
                ]),
              ).slice(0, 3);

              const coverImageUrl = getCoverImageUrl({
                profile,
                representativeItem,
              });

              const galleryThumbnailUrls =
                getGalleryThumbnailUrls(representativeItem);

              const portfolioItemCount =
                detail?.portfolio.length ??
                profile.portfolioItemCount;

              return (
                <Card
                  key={profile.id}
                  className="group flex h-full overflow-hidden rounded-[2rem] border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardContent className="flex h-full w-full flex-col p-4">
                    <PhotographerImagePreview
                      coverImageUrl={coverImageUrl}
                      galleryThumbnailUrls={
                        galleryThumbnailUrls
                      }
                      styleSignal={styleSignal}
                      portfolioItemCount={
                        portfolioItemCount
                      }
                      workLabel={getWorkLabel(
                        representativeItem,
                      )}
                    />

                    <div className="flex flex-1 flex-col px-1 pt-5">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                          {profile.location}
                        </p>

                        <h3 className="font-serif text-3xl leading-tight text-foreground">
                          {profile.name}
                        </h3>
                      </div>

                      <p className="mt-3 h-[4.5rem] overflow-hidden text-sm leading-6 text-muted">
                        {getShortBio(profile.bio)}
                      </p>

                      <div className="mt-4 flex min-h-8 flex-wrap gap-2">
                        {styleBadges.map((style) => (
                          <Badge
                            key={style}
                            variant={
                              style ===
                                styleSignal
                                ? "ai"
                                : "neutral"
                            }
                          >
                            {style}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-auto pt-5">
                        <Link
                          href={`/photographers/${profile.slug}`}
                          className={buttonVariants({
                            size: "lg",
                            className:
                              "w-full rounded-full",
                          })}
                        >
                          View portfolio
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
};