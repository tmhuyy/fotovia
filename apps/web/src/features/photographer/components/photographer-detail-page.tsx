"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { photographerService } from "../../../services/photographer.service";
import { useAuthStore } from "../../../store/auth.store";
import type { AssetPreview } from "../../asset/types/asset.types";
import type {
  PhotographerDetail,
  PhotographerPortfolioShowcaseItem,
} from "../types/photographer-detail.types";
import type { PhotographerPortfolioItem } from "../types/portfolio.types";
import { PhotographerNotFound } from "./photographer-not-found";
import
{
  PortfolioItemDetailDialog,
  type PortfolioActionMenuItem,
} from "./portfolio-item-detail-dialog";
import { PortfolioGrid } from "./portfolio-grid";

interface PhotographerDetailPageProps
{
  slug: string;
}

const getInitials = (value: string) =>
{
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const sortPortfolioItems = (items: PhotographerPortfolioItem[]) =>
{
  return [...items].sort((a, b) =>
  {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    if (timeA !== timeB) {
      return timeB - timeA;
    }

    return b.sortOrder - a.sortOrder;
  });
};

const formatStartingPrice = (value: number | null) =>
{
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  return `From ${new Intl.NumberFormat("vi-VN").format(value)} VND`;
};

const createRemoteAssetPreview = ({
  id,
  previewUrl,
  index,
  createdAt,
}: {
  id: string;
  previewUrl: string;
  index: number;
  createdAt: string;
}): AssetPreview =>
{
  return {
    id,
    source: "uploaded-remote",
    status: "uploaded",
    assetId: id,
    fileName: `portfolio-image-${index + 1}.jpg`,
    mimeType: "image/jpeg",
    sizeInBytes: 0,
    originalSizeInBytes: null,
    previewUrl,
    createdAt,
    file: null,
  };
};

const mapPublicPortfolioItem = (
  item: PhotographerPortfolioShowcaseItem,
  index: number,
): PhotographerPortfolioItem =>
{
  const createdAt = item.createdAt || new Date(0).toISOString();

  return {
    id: item.id || `public-portfolio-${index}`,
    title: item.title || "Saved portfolio work",
    description: item.description || "",
    coverAsset: createRemoteAssetPreview({
      id: `${item.id || index}-cover`,
      previewUrl: item.coverImageUrl,
      index: 0,
      createdAt,
    }),
    galleryAssets: item.galleryImages
      .map((imageUrl) => imageUrl.trim())
      .filter(Boolean)
      .map((imageUrl, imageIndex) =>
        createRemoteAssetPreview({
          id: `${item.id || index}-gallery-${imageIndex}`,
          previewUrl: imageUrl,
          index: imageIndex + 1,
          createdAt,
        }),
      ),
    isFeatured: item.isFeatured,
    sortOrder: item.sortOrder,
    createdAt,
    updatedAt: item.updatedAt,
    classificationStatus: item.classificationStatus,
    classificationError: item.classificationError,
    classificationRequestedAt: item.classificationRequestedAt,
    classificationStartedAt: item.classificationStartedAt,
    classificationCompletedAt: item.classificationCompletedAt,
    classificationFailedAt: item.classificationFailedAt,
    detectedPrimaryStyle: item.detectedPrimaryStyle ?? item.styleLabel,
    detectedPrimaryScore: item.detectedPrimaryScore,
    detectedSecondaryStyles: item.detectedSecondaryStyles,
    detectedStyleDistribution: item.detectedStyleDistribution,
  };
};

const getDisplayStyles = (photographer: PhotographerDetail) =>
{
  const portfolioStyles = photographer.portfolio
    .map((item) => item.styleLabel?.trim())
    .filter((style): style is string => Boolean(style));

  const mergedStyles = [
    ...portfolioStyles,
    photographer.primaryDiscoveryStyle,
    ...photographer.discoveryStyles,
    ...photographer.styles,
    ...photographer.specialties,
  ]
    .map((style) => style?.trim())
    .filter((style): style is string => Boolean(style));

  return Array.from(new Set(mergedStyles)).slice(0, 5);
};

const PhotographerDetailPageSkeleton = () =>
{
  return (
    <>
      <Navbar />

      <main className="pb-10 pt-6 sm:pt-10">
        <div className="mx-auto w-full max-w-[935px] px-4 sm:px-6">
          <section className="border-b border-border pb-8">
            <div className="mx-auto max-w-[840px]">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-x-14">
                <div className="h-20 w-20 animate-pulse rounded-full bg-border/60 sm:h-[150px] sm:w-[150px]" />

                <div className="space-y-4">
                  <div className="h-8 w-48 animate-pulse rounded bg-border/60" />
                  <div className="grid max-w-md grid-cols-3 gap-3">
                    <div className="h-5 animate-pulse rounded bg-border/50" />
                    <div className="h-5 animate-pulse rounded bg-border/50" />
                    <div className="h-5 animate-pulse rounded bg-border/50" />
                  </div>
                  <div className="h-24 max-w-xl animate-pulse rounded bg-border/50" />
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 grid grid-cols-3 gap-[2px] sm:gap-1 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[3/4] animate-pulse bg-border/50"
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export const PhotographerDetailPage = ({ slug }: PhotographerDetailPageProps) =>
{
  const { user, isAuthenticated, hasHydrated, isHydrating } = useAuthStore();

  const [selectedItem, setSelectedItem] =
    useState<PhotographerPortfolioItem | null>(null);

  const photographerQuery = useQuery({
    queryKey: ["public-photographer-detail", slug],
    queryFn: () => photographerService.getPublicPhotographerDetailBySlug(slug),
    retry: false,
  });

  const photographer = photographerQuery.data ?? null;

  const portfolioItems = useMemo(() =>
  {
    return sortPortfolioItems(
      (photographer?.portfolio ?? []).map(mapPublicPortfolioItem),
    );
  }, [photographer?.portfolio]);

  const selectedPortfolioItem = useMemo(() =>
  {
    if (!selectedItem) {
      return null;
    }

    return (
      portfolioItems.find((item) => item.id === selectedItem.id) ??
      selectedItem
    );
  }, [portfolioItems, selectedItem]);

  const selectedPortfolioItemIndex = useMemo(() =>
  {
    if (!selectedPortfolioItem) {
      return -1;
    }

    return portfolioItems.findIndex(
      (item) => item.id === selectedPortfolioItem.id,
    );
  }, [portfolioItems, selectedPortfolioItem]);

  const hasPreviousPortfolioItem = selectedPortfolioItemIndex > 0;
  const hasNextPortfolioItem =
    selectedPortfolioItemIndex >= 0 &&
    selectedPortfolioItemIndex < portfolioItems.length - 1;

  const openPreviousPortfolioItem = () =>
  {
    if (!hasPreviousPortfolioItem) {
      return;
    }

    const previousItem = portfolioItems[selectedPortfolioItemIndex - 1];

    if (previousItem) {
      setSelectedItem(previousItem);
    }
  };

  const openNextPortfolioItem = () =>
  {
    if (!hasNextPortfolioItem) {
      return;
    }

    const nextItem = portfolioItems[selectedPortfolioItemIndex + 1];

    if (nextItem) {
      setSelectedItem(nextItem);
    }
  };

  if (photographerQuery.isLoading) {
    return <PhotographerDetailPageSkeleton />;
  }

  if (photographerQuery.isError) {
    return (
      <>
        <Navbar />

        <main className="pb-16 pt-10">
          <Container>
            <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
              <CardContent className="space-y-4 p-8">
                <div className="space-y-2">
                  <h1 className="font-serif text-3xl text-foreground">
                    We couldn’t load this photographer
                  </h1>

                  <p className="text-sm leading-6 text-muted">
                    Please try again in a moment.
                  </p>
                </div>

                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => photographerQuery.refetch()}
                >
                  Try again
                </Button>
              </CardContent>
            </Card>
          </Container>
        </main>

        <Footer />
      </>
    );
  }

  if (!photographer) {
    return <PhotographerNotFound />;
  }

  const isOwnPhotographerProfile =
    hasHydrated &&
    !isHydrating &&
    isAuthenticated &&
    user?.role === "photographer" &&
    user.id === photographer.id;

  const displayStyles = getDisplayStyles(photographer);
  const stylesReadyCount = portfolioItems.filter(
    (item) => item.detectedPrimaryStyle,
  ).length;

  const priceLabel = formatStartingPrice(photographer.startingPrice);
  const bookingHref = `/bookings/new?photographerSlug=${encodeURIComponent(
    photographer.slug,
  )}`;

  const actionItems: PortfolioActionMenuItem[] = [];

  return (
    <>
      <Navbar />

      <main className="pb-10 pt-6 sm:pt-10">
        <div className="mx-auto w-full max-w-[935px] px-0 sm:px-6">
          <div className="px-4 pb-4 sm:px-0">
            <Link
              href="/photographers"
              className="text-sm font-medium text-muted transition hover:text-foreground"
            >
              ← Back to photographers
            </Link>
          </div>

          <section className="border-b border-border px-4 pb-8 sm:px-0">
            <div className="mx-auto max-w-[840px]">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-x-14">
                <div className="pt-1 sm:flex sm:justify-center">
                  {photographer.avatarUrl ? (
                    <img
                      src={photographer.avatarUrl}
                      alt={photographer.name}
                      className="h-20 w-20 rounded-full border border-border object-cover sm:h-[150px] sm:w-[150px]"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface font-serif text-2xl text-foreground sm:h-[150px] sm:w-[150px] sm:text-4xl">
                      {getInitials(photographer.name)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {photographer.name}
                    </h1>
                  </div>

                  <div className="grid max-w-md grid-cols-3 gap-3 text-left text-sm">
                    <div>
                      <span className="block font-semibold text-foreground sm:inline">
                        {portfolioItems.length}
                      </span>{" "}
                      <span className="text-foreground">posts</span>
                    </div>

                    <div>
                      <span className="block font-semibold text-foreground sm:inline">
                        {photographer.reviewCount ?? 0}
                      </span>{" "}
                      <span className="text-foreground">reviews</span>
                    </div>

                    <div>
                      <span className="block font-semibold text-foreground sm:inline">
                        {stylesReadyCount}
                      </span>{" "}
                      <span className="text-foreground">styles</span>
                    </div>
                  </div>

                  <div className="hidden max-w-xl space-y-1 text-sm leading-5 sm:block">
                    <p className="font-semibold text-foreground">
                      {photographer.name}
                    </p>

                    <p className="text-muted">Photographer</p>

                    <p className="text-foreground">{photographer.bio}</p>

                    <p className="text-foreground">
                      Based in {photographer.location}
                    </p>

                    {/* {typeof photographer.experienceYears === "number" ? (
                      <p className="text-foreground">
                        {photographer.experienceYears} year(s) experience
                      </p>
                    ) : null} */}

                    {/* {priceLabel ? (
                      <p className="text-foreground">{priceLabel}</p>
                    ) : null} */}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm leading-5 sm:hidden">
                <p className="font-semibold text-foreground">
                  {photographer.name}
                </p>

                <p className="text-muted">Photographer</p>

                <p className="text-foreground">{photographer.bio}</p>

                <p className="text-foreground">
                  Based in {photographer.location}
                </p>

                {/* {typeof photographer.experienceYears === "number" ? (
                  <p className="text-foreground">
                    {photographer.experienceYears} year(s) experience
                  </p>
                ) : null} */}

                {/* {priceLabel ? (
                  <p className="text-foreground">{priceLabel}</p>
                ) : null} */}
              </div>

              {displayStyles.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {displayStyles.map((style, index) => (
                    <Badge
                      key={`${style}-${index}`}
                      variant={index === 0 ? "ai" : "neutral"}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div
                className={
                  isOwnPhotographerProfile
                    ? "mt-4 grid gap-3 sm:grid-cols-2"
                    : "mt-4"
                }
              >
                {isOwnPhotographerProfile ? (
                  <>
                    <Link
                      href="/profile"
                      className={buttonVariants({
                        variant: "secondary",
                        size: "sm",
                        className:
                          "h-10 rounded-lg border border-border bg-surface text-sm font-semibold shadow-none hover:bg-background",
                      })}
                    >
                      Edit profile
                    </Link>

                    <Link
                      href="/photographer/portfolio/new"
                      className={buttonVariants({
                        variant: "secondary",
                        size: "sm",
                        className:
                          "h-10 rounded-lg border border-border bg-surface text-sm font-semibold shadow-none hover:bg-background",
                      })}
                    >
                      Add work
                    </Link>
                  </>
                ) : (
                  <Link
                    href={bookingHref}
                    className={buttonVariants({
                      size: "sm",
                      className: "h-10 w-full rounded-lg text-sm font-semibold",
                    })}
                  >
                    Request booking
                  </Link>
                )}
              </div>
            </div>
          </section>

          {portfolioItems.length === 0 ? (
            <div className="px-4 pt-8 sm:px-0">
              <div className="rounded-[2rem] border border-border bg-surface p-8 text-center shadow-sm">
                <h2 className="font-serif text-3xl text-foreground">
                  Portfolio is being updated.
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
                  This photographer has not published public portfolio work yet.
                </p>
              </div>
            </div>
          ) : (
            <section>
              <div className="grid h-12 grid-cols-1 border-b border-border text-muted sm:h-14">
                <button
                  type="button"
                  className="flex items-center justify-center border-b border-foreground text-lg text-foreground"
                  aria-label="Posts"
                >
                  ▦
                </button>
              </div>

              <PortfolioGrid
                items={portfolioItems}
                onOpenItem={setSelectedItem}
              />
            </section>
          )}
        </div>
      </main>

      <PortfolioItemDetailDialog
        item={selectedPortfolioItem}
        authorName={photographer.name}
        authorAvatarUrl={photographer.avatarUrl}
        actionItems={actionItems}
        showAiStyleAnalysis={false}
        hasPreviousItem={hasPreviousPortfolioItem}
        hasNextItem={hasNextPortfolioItem}
        onOpenPreviousItem={openPreviousPortfolioItem}
        onOpenNextItem={openNextPortfolioItem}
        onClose={() => setSelectedItem(null)}
      />

      <Footer />
    </>
  );
};