"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

  const hasPreviousPortfolioItem = selectedPortfolioItemIndex > 0;
  const hasNextPortfolioItem =
    selectedPortfolioItemIndex >= 0 &&
    selectedPortfolioItemIndex < sortedItems.length - 1;

  const openPreviousPortfolioItem = () =>
  {
    if (!hasPreviousPortfolioItem) {
      return;
    }

    setSelectedItem(sortedItems[selectedPortfolioItemIndex - 1] ?? null);
  };

  const openNextPortfolioItem = () =>
  {
    if (!hasNextPortfolioItem) {
      return;
    }

    setSelectedItem(sortedItems[selectedPortfolioItemIndex + 1] ?? null);
  };

  const featuredCount = useMemo(() =>
  {
    return sortedItems.filter((item) => item.isFeatured).length;
  }, [sortedItems]);

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
  }, [activePostJob, clearPortfolioPostJob, queryClient, queryKey]);

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
              <CardContent className="space-y-4 p-8">
                <h1 className="font-serif text-3xl text-foreground">
                  Portfolio access requires sign-in
                </h1>
                <p className="text-sm leading-6 text-muted">
                  Sign in with a photographer account to manage saved portfolio
                  works.
                </p>
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
                      This portfolio workspace is reserved for photographer
                      accounts.
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

  return (
    <>
      <Navbar />

      <main className="pb-16 pt-10">
        <Container className="space-y-8">
          <section className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="space-y-4">
                <Badge variant="ai">AI-first portfolio gallery</Badge>

                <div className="space-y-3">
                  <h1 className="max-w-4xl font-serif text-4xl text-foreground sm:text-5xl">
                    Your portfolio collections, {displayName}.
                  </h1>

                  {/* <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                    This page now focuses on the saved image collections first.
                    Add or edit portfolio work in a separate screen, then return
                    here to review AI classification status and detected style
                    results.
                  </p> */}
                </div>
              </div>

              <Link
                href="/photographer/portfolio/new"
                className={buttonVariants({
                  size: "lg",
                  className: "rounded-full",
                })}
              >
                Add portfolio item
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                <CardContent className="space-y-2 p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Portfolio items
                  </p>
                  <p className="font-serif text-3xl text-foreground">
                    {sortedItems.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                <CardContent className="space-y-2 p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Featured works
                  </p>
                  <p className="font-serif text-3xl text-foreground">
                    {featuredCount}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                <CardContent className="space-y-2 p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    AI in progress
                  </p>
                  <p className="font-serif text-3xl text-foreground">
                    {queuedOrProcessingCount}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                <CardContent className="space-y-2 p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Styles ready
                  </p>
                  <p className="font-serif text-3xl text-foreground">
                    {stylesReadyCount}
                  </p>
                </CardContent>
              </Card>
            </div>

            {activePostJob ? (
              <PortfolioPostProgressBanner
                job={activePostJob}
                onDismiss={
                  activePostJob.status === "failed" ? clearPortfolioPostJob : undefined
                }
              />
            ) : null}

            <div className="flex flex-wrap gap-3">
              {failedClassificationCount > 0 ? (
                <Badge variant="neutral">
                  {failedClassificationCount} need retry
                </Badge>
              ) : null}

              {isPollingForClassification ? (
                <Badge variant="ai">
                  Refreshing every {CLASSIFICATION_POLL_INTERVAL_MS / 1000}s
                  while AI runs
                </Badge>
              ) : null}
            </div>
          </section>

          {sortedItems.length === 0 ? (
            <PortfolioEmptyState />
          ) : (
            <section className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Portfolio gallery
                  </p>

                  <h2 className="font-serif text-4xl text-foreground">
                    Saved image collections
                  </h2>

                  {/* <p className="max-w-3xl text-sm leading-7 text-muted">
                    Each collection keeps its cover image, optional gallery
                    images, AI status, detected primary style, and management
                    actions.
                  </p> */}
                </div>
              </div>

              <PortfolioGrid
                items={sortedItems}
                onOpenItem={setSelectedItem}
              />
            </section>
          )}
        </Container>
      </main>

      <Footer />

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
        onClose={() => setSelectedItem(null)}
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