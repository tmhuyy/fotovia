"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { photographerService } from "../../../services/photographer.service";
import { profileService } from "../../../services/profile.service";
import { useAuthStore } from "../../../store/auth.store";
import { getPhotographerProfileCompletion } from "../../profile/lib/get-profile-completion";
import type { PhotographerPortfolioItem } from "../types/portfolio.types";
import { DeletePortfolioItemDialog } from "./delete-portfolio-item-dialog";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import { PortfolioGrid } from "./portfolio-grid";
import
{
  PortfolioItemDetailDialog,
  type PortfolioActionMenuItem,
} from "./portfolio-item-detail-dialog";
import { PortfolioPostProgressBanner } from "./portfolio-post-progress-banner";
import { usePortfolioPostStore } from "../store/portfolio-post.store";
import { bookingService } from "../../../services/booking.service";

const CLASSIFICATION_POLL_INTERVAL_MS = 4000;

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

const isClassificationInFlight = (item: PhotographerPortfolioItem) =>
{
  return (
    item.classificationStatus === "queued" ||
    item.classificationStatus === "processing"
  );
};

const hasActiveClassification = (items: PhotographerPortfolioItem[]) =>
{
  return items.some(isClassificationInFlight);
};

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

const PortfolioPageSkeleton = () =>
{
  return (
    <>
      <Navbar />
      <main className="pb-16 pt-10">
        <Container className="space-y-8">
          <div className="space-y-4">
            <div className="h-5 w-40 animate-pulse rounded bg-border/60" />
            <div className="h-12 w-[32rem] max-w-full animate-pulse rounded bg-border/60" />
            <div className="h-6 w-[40rem] max-w-full animate-pulse rounded bg-border/50" />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[2rem] border border-border bg-surface/60"
              />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[32rem] animate-pulse rounded-[2rem] border border-border bg-surface/60"
              />
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export const PhotographerPortfolioPage = () =>
{
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

  const activePostJob = usePortfolioPostStore((state) => state.activeJob);
  const clearPortfolioPostJob = usePortfolioPostStore(
    (state) => state.clearPortfolioPostJob,
  );

  const [deletingItem, setDeletingItem] =
    useState<PhotographerPortfolioItem | null>(null);

  const [selectedItem, setSelectedItem] =
    useState<PhotographerPortfolioItem | null>(null);

  const handledPostJobIdRef = useRef<string | null>(null);

  const isPhotographer = user?.role === "photographer";
  const authEmail = user?.email ?? "";
  const displayName = user?.fullName?.trim() || user?.email || "Photographer";

  const queryKey = useMemo(
    () => ["my-photographer-portfolio", user?.id ?? "anonymous"] as const,
    [user?.id],
  );

  const portfolioQuery = useQuery({
    queryKey,
    queryFn: () => photographerService.getMyPortfolioItems(),
    enabled: hasHydrated && !isHydrating && isAuthenticated && isPhotographer,
    retry: false,
    refetchInterval: (query) =>
    {
      const items =
        (query.state.data as PhotographerPortfolioItem[] | undefined) ?? [];

      return hasActiveClassification(items)
        ? CLASSIFICATION_POLL_INTERVAL_MS
        : false;
    },
  });

  const profileQuery = useQuery({
    queryKey: ["my-profile", user?.id ?? "anonymous"],
    queryFn: () => profileService.getMyProfile(authEmail),
    enabled:
      hasHydrated &&
      !isHydrating &&
      isAuthenticated &&
      isPhotographer &&
      authEmail.length > 0,
    retry: false,
  });

  const deletePortfolioItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      photographerService.deleteMyPortfolioItem(itemId),
    onSuccess: (_, deletedItemId) =>
    {
      queryClient.setQueryData<PhotographerPortfolioItem[]>(
        queryKey,
        (current) => (current ?? []).filter((item) => item.id !== deletedItemId),
      );

      toast.success("Portfolio item deleted", {
        description:
          "The saved work was removed from your portfolio. Any orphaned media is now eligible for cleanup too.",
      });
    },
    onError: () =>
    {
      toast.error("We couldn’t delete this portfolio item", {
        description: "Please try again in a moment.",
      });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (item: PhotographerPortfolioItem) =>
    {
      if (!item.coverAsset.assetId) {
        throw new Error("Missing uploaded cover asset reference.");
      }

      return photographerService.updateMyPortfolioItem(item.id, {
        title: item.title,
        description: item.description,
        isFeatured: !item.isFeatured,
        coverAssetId: item.coverAsset.assetId,
        galleryAssetIds: item.galleryAssets
          .map((galleryAsset) => galleryAsset.assetId)
          .filter((assetId): assetId is string => typeof assetId === "string"),
      });
    },
    onSuccess: (updatedItem) =>
    {
      queryClient.setQueryData<PhotographerPortfolioItem[]>(
        queryKey,
        (current) =>
          sortPortfolioItems(
            (current ?? []).map((item) =>
              item.id === updatedItem.id ? updatedItem : item,
            ),
          ),
      );

      toast.success("Portfolio featured state updated", {
        description: "Your featured selection has been saved.",
      });
    },
    onError: () =>
    {
      toast.error("We couldn’t update the featured state", {
        description: "Please try again in a moment.",
      });
    },
  });

  const retryClassificationMutation = useMutation({
    mutationFn: (itemId: string) =>
      photographerService.retryMyPortfolioItemClassification(itemId),
    onSuccess: (updatedItem) =>
    {
      queryClient.setQueryData<PhotographerPortfolioItem[]>(
        queryKey,
        (current) =>
          sortPortfolioItems(
            (current ?? []).map((item) =>
              item.id === updatedItem.id ? updatedItem : item,
            ),
          ),
      );

      toast.success("Classification requeued", {
        description:
          "The portfolio item was queued for another AI pass. This page will refresh automatically while the job runs.",
      });
    },
    onError: () =>
    {
      toast.error("We couldn’t retry AI classification", {
        description: "Please try again in a moment.",
      });
    },
  });

  const sortedItems = useMemo(() =>
  {
    return sortPortfolioItems(portfolioQuery.data ?? []);
  }, [portfolioQuery.data]);

  const selectedPortfolioItem = useMemo(() =>
  {
    if (!selectedItem) {
      return null;
    }

    return sortedItems.find((item) => item.id === selectedItem.id) ?? selectedItem;
  }, [selectedItem, sortedItems]);

  const selectedPortfolioItemIndex = useMemo(() =>
  {
    if (!selectedPortfolioItem) {
      return -1;
    }

    return sortedItems.findIndex((item) => item.id === selectedPortfolioItem.id);
  }, [selectedPortfolioItem, sortedItems]);

  const photographerBookingsQuery = useQuery({
    queryKey: ["photographer-booking-stats", user?.id ?? "anonymous"],
    queryFn: () => bookingService.getMyPhotographerBookings(),
    enabled:
      hasHydrated &&
      !isHydrating &&
      isAuthenticated &&
      isPhotographer,
    retry: false,
  });

  const selectedPostId = searchParams.get("post");

  const getPostDetailUrl = (itemId: string) =>
  {
    return `/photographer/portfolio?post=${encodeURIComponent(itemId)}`;
  };

  const openPortfolioItem = (item: PhotographerPortfolioItem) =>
  {
    setSelectedItem(item);
    router.push(getPostDetailUrl(item.id), { scroll: false });
  };

  const closePortfolioItem = () =>
  {
    setSelectedItem(null);
    router.replace("/photographer/portfolio", { scroll: false });
  };

  useEffect(() =>
  {
    if (!selectedPostId) {
      setSelectedItem((current) => (current ? null : current));
      return;
    }

    const itemFromUrl = sortedItems.find((item) => item.id === selectedPostId);

    if (!itemFromUrl) {
      return;
    }

    setSelectedItem((current) =>
      current?.id === itemFromUrl.id ? current : itemFromUrl,
    );
  }, [selectedPostId, sortedItems]);

  const hasPreviousPortfolioItem = selectedPortfolioItemIndex > 0;
  const hasNextPortfolioItem =
    selectedPortfolioItemIndex >= 0 &&
    selectedPortfolioItemIndex < sortedItems.length - 1;

  const openPreviousPortfolioItem = () =>
  {
    if (!hasPreviousPortfolioItem) {
      return;
    }

    const previousItem = sortedItems[selectedPortfolioItemIndex - 1] ?? null;

    if (!previousItem) {
      return;
    }

    setSelectedItem(previousItem);
    router.replace(getPostDetailUrl(previousItem.id), { scroll: false });
  };

  const openNextPortfolioItem = () =>
  {
    if (!hasNextPortfolioItem) {
      return;
    }

    const nextItem = sortedItems[selectedPortfolioItemIndex + 1] ?? null;

    if (!nextItem) {
      return;
    }

    setSelectedItem(nextItem);
    router.replace(getPostDetailUrl(nextItem.id), { scroll: false });
  };

  const completedShootsCount = useMemo(() =>
  {
    return (photographerBookingsQuery.data ?? []).filter(
      (booking) => booking.status === "completed",
    ).length;
  }, [photographerBookingsQuery.data]);

  const queuedOrProcessingCount = useMemo(() =>
  {
    return sortedItems.filter(isClassificationInFlight).length;
  }, [sortedItems]);

  const stylesReadyCount = useMemo(() =>
  {
    return sortedItems.filter((item) => item.detectedPrimaryStyle).length;
  }, [sortedItems]);

  const failedClassificationCount = useMemo(() =>
  {
    return sortedItems.filter((item) => item.classificationStatus === "failed")
      .length;
  }, [sortedItems]);

  const profileDisplayName = profileQuery.data?.fullName || displayName;
  const profileAvatarUrl = profileQuery.data?.avatarUrl ?? null;
  const profileLocation = profileQuery.data?.location?.trim();
  const profilePhone = profileQuery.data?.phone?.trim();
  const profileBio = profileQuery.data?.bio?.trim();
  const profileSpecialties = profileQuery.data?.specialties ?? [];
  const profilePricePerHour = profileQuery.data?.pricePerHour;
  const profileExperienceYears = profileQuery.data?.experienceYears;
  const profileEmail = profileQuery.data?.email || authEmail;

  const formattedPricePerHour =
    typeof profilePricePerHour === "number" && !Number.isNaN(profilePricePerHour)
      ? `$${profilePricePerHour}/hour`
      : null;

  const publicInfoCompletion = useMemo(() =>
  {
    return getPhotographerProfileCompletion(profileQuery.data ?? null);
  }, [profileQuery.data]);

  const shouldShowPublicInfoBanner =
    !profileQuery.isLoading && !publicInfoCompletion.isComplete;

  const missingPublicInfoLabels = publicInfoCompletion.missingItems
    .slice(0, 3)
    .map((item) => item.label.toLowerCase())
    .join(", ");

  const isPollingForClassification = useMemo(() =>
  {
    return hasActiveClassification(sortedItems);
  }, [sortedItems]);

  const handleConfirmDeletePortfolioItem = async (
    item: PhotographerPortfolioItem,
  ) =>
  {
    await deletePortfolioItemMutation.mutateAsync(item.id);

    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }

    setDeletingItem(null);
  };

  useEffect(() =>
  {
    if (activePostJob?.status !== "completed" || !activePostJob.createdItem) {
      return;
    }

    if (handledPostJobIdRef.current === activePostJob.id) {
      return;
    }

    handledPostJobIdRef.current = activePostJob.id;

    const createdItem = activePostJob.createdItem;

    queryClient.setQueryData<PhotographerPortfolioItem[]>(queryKey, (current) =>
      sortPortfolioItems([
        createdItem,
        ...(current ?? []).filter((item) => item.id !== createdItem.id),
      ]),
    );

    setSelectedItem((current) =>
      current?.id === createdItem.id ? current : createdItem,
    );
    router.replace(getPostDetailUrl(createdItem.id), { scroll: false });

    void queryClient.invalidateQueries({
      queryKey,
    });

    const timeoutId = window.setTimeout(() =>
    {
      clearPortfolioPostJob();

      if (handledPostJobIdRef.current === activePostJob.id) {
        handledPostJobIdRef.current = null;
      }
    }, 1400);

    return () =>
    {
      window.clearTimeout(timeoutId);
    };
  }, [activePostJob, clearPortfolioPostJob, queryClient, queryKey, router]);

  if (!hasHydrated || isHydrating) {
    return <PortfolioPageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />

        <main className="pb-16 pt-10">
          <Container>
            <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
              <CardContent className="space-y-6 p-8">
                <div className="space-y-3">
                  <Badge variant="neutral">Portfolio access</Badge>

                  <div className="space-y-2">
                    <h1 className="font-serif text-3xl text-foreground">
                      Sign in to manage your portfolio.
                    </h1>

                    <p className="text-sm leading-7 text-muted">
                      This portfolio page is only available after signing in with a
                      photographer account.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/sign-in"
                    className={buttonVariants({
                      size: "lg",
                      className: "rounded-full",
                    })}
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "lg",
                      className: "rounded-full",
                    })}
                  >
                    Back to homepage
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Container>
        </main>

        <Footer />
      </>
    );
  }

  if (!isPhotographer) {
    return (
      <>
        <Navbar />
        <main className="pb-16 pt-10">
          <Container>
            <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
              <CardContent className="space-y-6 p-8">
                <div className="space-y-3">
                  <Badge variant="neutral">Portfolio access</Badge>

                  <div className="space-y-2">
                    <h1 className="font-serif text-3xl text-foreground">
                      This portfolio page is reserved for photographer accounts.
                    </h1>

                    <p className="text-sm leading-7 text-muted">
                      Your account is signed in, but this route is meant for
                      photographer-side portfolio setup. You can still return to
                      your profile or go back to the main marketplace flow.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/profile"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "lg",
                      className: "rounded-full",
                    })}
                  >
                    Go to profile
                  </Link>

                  <Link
                    href="/"
                    className={buttonVariants({
                      size: "lg",
                      className: "rounded-full",
                    })}
                  >
                    Back to homepage
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  if (portfolioQuery.isLoading) {
    return <PortfolioPageSkeleton />;
  }

  if (portfolioQuery.isError) {
    return (
      <>
        <Navbar />
        <main className="pb-16 pt-10">
          <Container>
            <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
              <CardContent className="space-y-4 p-8">
                <div className="space-y-2">
                  <h1 className="font-serif text-3xl text-foreground">
                    We couldn’t load your portfolio
                  </h1>

                  <p className="text-sm leading-6 text-muted">
                    Please refresh the page or try again in a moment.
                  </p>
                </div>

                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => portfolioQuery.refetch()}
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

  const isAnyMutationPending =
    deletePortfolioItemMutation.isPending ||
    toggleFeaturedMutation.isPending ||
    retryClassificationMutation.isPending;

  const getPortfolioActionItems = (
    item: PhotographerPortfolioItem,
  ): PortfolioActionMenuItem[] => [
      {
        label: "Delete",
        tone: "danger",
        disabled: isAnyMutationPending,
        onSelect: () => setDeletingItem(item),
      },
      {
        label: "Edit",
        disabled: isAnyMutationPending,
        onSelect: () => router.push(`/photographer/portfolio/${item.id}/edit`),
      },
      {
        label: item.isFeatured ? "Unfeature" : "Feature",
        disabled: isAnyMutationPending,
        onSelect: () => toggleFeaturedMutation.mutate(item),
      },
    ];

  const renderProfileContactLinks = (className = "") =>
  {
    if (!profilePhone && !profileEmail) {
      return null;
    }

    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {profilePhone ? (
          <a
            href={`tel:${profilePhone}`}
            className="inline-flex items-center rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background transition hover:bg-foreground/85"
          >
            <span className="mr-1.5 opacity-70">Call</span>
            {profilePhone}
          </a>
        ) : null}

        {profileEmail ? (
          <a
            href={`mailto:${profileEmail}`}
            className="inline-flex min-w-0 max-w-full items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground shadow-sm transition hover:border-foreground/25 hover:bg-background"
          >
            <span className="mr-1.5 text-muted">Email</span>
            <span className="truncate">{profileEmail}</span>
          </a>
        ) : null}
      </div>
    );
  };

  const renderProfileSpecialties = (className = "") =>
  {
    if (profileSpecialties.length === 0) {
      return null;
    }

    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {profileSpecialties.slice(0, 5).map((specialty) => (
          <span
            key={specialty}
            className="rounded-full bg-ai/15 px-2.5 py-1 text-xs font-medium text-foreground"
          >
            {specialty}
          </span>
        ))}
      </div>
    );
  };

  const renderProfileActionButtons = (className = "") => (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
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
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="pb-10 pt-6 sm:pt-10">
        <div className="mx-auto w-full max-w-[935px] px-0 sm:px-6">
          <section className="border-b border-border px-4 pb-8 sm:px-0">
            <div className="mx-auto max-w-[840px]">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-x-14">
                <div className="pt-1 sm:flex sm:justify-center">
                  {profileAvatarUrl ? (
                    <img
                      src={profileAvatarUrl}
                      alt={profileDisplayName}
                      className="h-20 w-20 rounded-full border border-border object-cover sm:h-[150px] sm:w-[150px]"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface font-serif text-2xl text-foreground sm:h-[150px] sm:w-[150px] sm:text-4xl">
                      {getInitials(profileDisplayName)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {profileDisplayName}
                    </h1>
                  </div>

                  <div className="grid max-w-md grid-cols-3 gap-3 text-left text-sm sm:text-left">
                    <div>
                      <span className="block font-semibold text-foreground sm:inline">
                        {sortedItems.length}
                      </span>{" "}
                      <span className="text-foreground">posts</span>
                    </div>

                    <div>
                      <span className="block font-semibold text-foreground sm:inline">
                        {completedShootsCount}
                      </span>{" "}
                      <span className="text-foreground">shoots</span>
                    </div>

                    <div>
                      <span className="block font-semibold text-foreground sm:inline">
                        {stylesReadyCount}
                      </span>{" "}
                      <span className="text-foreground">styles</span>
                    </div>
                  </div>

                  <div className="hidden max-w-xl space-y-1 text-sm leading-5 sm:block">
                    <p className="font-semibold text-foreground">{profileDisplayName}</p>
                    <p className="text-muted">Photographer</p>

                    {profileBio ? (
                      <p className="text-foreground">{profileBio}</p>
                    ) : null}

                    {profileLocation ? (
                      <p className="text-foreground">Based in {profileLocation}</p>
                    ) : null}

                    {typeof profileExperienceYears === "number" ? (
                      <p className="text-foreground">
                        {profileExperienceYears} year(s) experience
                      </p>
                    ) : null}

                    {formattedPricePerHour ? (
                      <p className="text-foreground">{formattedPricePerHour}</p>
                    ) : null}

                    {renderProfileContactLinks("pt-1")}
                    {renderProfileSpecialties("pt-1")}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm leading-5 sm:hidden">
                <p className="font-semibold text-foreground">{profileDisplayName}</p>
                <p className="text-muted">Photographer</p>

                {profileBio ? (
                  <p className="text-foreground">{profileBio}</p>
                ) : null}

                {profileLocation ? (
                  <p className="text-foreground">Based in {profileLocation}</p>
                ) : null}

                {typeof profileExperienceYears === "number" ? (
                  <p className="text-foreground">
                    {profileExperienceYears} year(s) experience
                  </p>
                ) : null}

                {formattedPricePerHour ? (
                  <p className="text-foreground">{formattedPricePerHour}</p>
                ) : null}

                {renderProfileContactLinks("pt-1")}
                {renderProfileSpecialties("pt-1")}
              </div>

              {renderProfileActionButtons("mt-4")}

              {shouldShowPublicInfoBanner ? (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Complete your public info
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Add {missingPublicInfoLabels || "the missing details"} so
                      clients can understand your service before booking.
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                      className:
                        "mt-3 w-full rounded-lg border border-border bg-background text-sm font-semibold shadow-none hover:bg-surface sm:mt-0 sm:w-auto",
                    })}
                  >
                    Complete info
                  </Link>
                </div>
              ) : null}
            </div>

            {(activePostJob ||
              failedClassificationCount > 0 ||
              isPollingForClassification) ? (
              <div className="mt-5 space-y-3">
                {activePostJob ? (
                  <PortfolioPostProgressBanner
                    job={activePostJob}
                    onDismiss={
                      activePostJob.status === "failed"
                        ? clearPortfolioPostJob
                        : undefined
                    }
                  />
                ) : null}

                <div className="flex flex-wrap gap-2 text-xs">
                  {failedClassificationCount > 0 ? (
                    <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-600">
                      {failedClassificationCount} need retry
                    </span>
                  ) : null}

                  {queuedOrProcessingCount > 0 ? (
                    <span className="rounded-full bg-ai/15 px-3 py-1 font-medium text-foreground">
                      {queuedOrProcessingCount} AI running
                    </span>
                  ) : null}

                  {isPollingForClassification ? (
                    <span className="rounded-full bg-background px-3 py-1 font-medium text-muted">
                      Auto-refreshing
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          {sortedItems.length === 0 ? (
            <div className="px-4 pt-8 sm:px-0">
              <PortfolioEmptyState />
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
                items={sortedItems}
                onOpenItem={openPortfolioItem}
              />
            </section>
          )}
        </div>
      </main>

      <PortfolioItemDetailDialog
        item={selectedPortfolioItem}
        authorName={profileQuery.data?.fullName || displayName}
        authorAvatarUrl={profileQuery.data?.avatarUrl ?? null}
        isRetryingClassification={retryClassificationMutation.isPending}
        onRetryClassification={(item) =>
          retryClassificationMutation.mutate(item.id)
        }
        actionItems={
          selectedPortfolioItem ? getPortfolioActionItems(selectedPortfolioItem) : []
        }
        hasPreviousItem={hasPreviousPortfolioItem}
        hasNextItem={hasNextPortfolioItem}
        onOpenPreviousItem={openPreviousPortfolioItem}
        onOpenNextItem={openNextPortfolioItem}
        onClose={closePortfolioItem}
      />

      <DeletePortfolioItemDialog
        item={deletingItem}
        isOpen={deletingItem !== null}
        isDeleting={deletePortfolioItemMutation.isPending}
        onClose={() =>
        {
          if (!deletePortfolioItemMutation.isPending) {
            setDeletingItem(null);
          }
        }}
        onConfirm={handleConfirmDeletePortfolioItem}
      />
    </>
  );
};