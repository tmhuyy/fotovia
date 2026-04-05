"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { assetService } from "../../../services/asset.service";
import { photographerService } from "../../../services/photographer.service";
import { useAuthStore } from "../../../store/auth.store";
import type { AssetPreview } from "../../asset/types/asset.types";
import type {
  PhotographerPortfolioItem,
  PortfolioItemDraft,
  PortfolioItemMutationPayload,
} from "../types/portfolio.types";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import { PortfolioGrid } from "./portfolio-grid";
import { PortfolioItemForm } from "./portfolio-item-form";

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

const mapItemToDraft = (
  item: PhotographerPortfolioItem | null,
): PortfolioItemDraft | undefined =>
{
  if (!item) return undefined;

  return {
    title: item.title,
    description: item.description,
    asset: item.asset,
    category: item.category,
    isFeatured: item.isFeatured,
  };
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

          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-[2rem] border border-border bg-surface/60"
              />
            ))}
          </div>

          <div className="h-[32rem] animate-pulse rounded-[2rem] border border-border bg-surface/60" />
          <div className="h-[24rem] animate-pulse rounded-[2rem] border border-border bg-surface/60" />
        </Container>
      </main>
      <Footer />
    </>
  );
};

const resolvePortfolioAssetId = async (asset: AssetPreview | null) =>
{
  if (!asset) {
    throw new Error("Please upload an image for this portfolio work.");
  }

  if (asset.source === "uploaded-remote" && asset.assetId) {
    return asset.assetId;
  }

  if (!asset.file) {
    throw new Error("Please choose the image again before saving.");
  }

  const uploadSession = await assetService.createUploadSession({
    purpose: "PORTFOLIO_IMAGE",
    visibility: "PUBLIC",
    resourceType: "IMAGE",
    originalFilename: asset.file.name,
    mimeType: asset.file.type,
    sizeBytes: asset.file.size,
  });

  await assetService.uploadToSignedUrl({
    bucketName: uploadSession.asset.bucketName,
    path: uploadSession.uploadData.path,
    token: uploadSession.uploadData.token,
    signedUrl: uploadSession.uploadData.signedUrl,
    file: asset.file,
    contentType: asset.file.type,
  });

  const confirmedUpload = await assetService.confirmUploadSession(
    uploadSession.uploadSession.id,
    {
      metadataJson: {
        source: "web-portfolio-item-upload",
        originalFilename: asset.file.name,
      },
    },
  );

  return confirmedUpload.asset.id;
};

const buildPortfolioMutationPayload = async (
  draft: PortfolioItemDraft,
): Promise<PortfolioItemMutationPayload> =>
{
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    isFeatured: draft.isFeatured,
    assetId: await resolvePortfolioAssetId(draft.asset),
  };
};

export const PhotographerPortfolioPage = () =>
{
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const isPhotographer = user?.role === "photographer";
  const displayName = user?.fullName?.trim() || user?.email || "Photographer";
  const queryKey = ["my-photographer-portfolio", user?.id ?? "anonymous"] as const;

  const portfolioQuery = useQuery({
    queryKey,
    queryFn: () => photographerService.getMyPortfolioItems(),
    enabled:
      hasHydrated && !isHydrating && isAuthenticated && isPhotographer,
    retry: false,
  });

  const createPortfolioItemMutation = useMutation({
    mutationFn: async (draft: PortfolioItemDraft) =>
    {
      const payload = await buildPortfolioMutationPayload(draft);
      return photographerService.createMyPortfolioItem(payload);
    },
    onSuccess: (createdItem) =>
    {
      queryClient.setQueryData<PhotographerPortfolioItem[]>(
        queryKey,
        (current) => sortPortfolioItems([createdItem, ...(current ?? [])]),
      );

      toast.success("Portfolio item saved", {
        description: "Your work is now persisted through the real backend flow.",
      });
    },
    onError: () =>
    {
      toast.error("We couldn’t save this portfolio item", {
        description: "Please try again after checking the selected image.",
      });
    },
  });

  const updatePortfolioItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      draft,
    }: {
      itemId: string;
      draft: PortfolioItemDraft;
    }) =>
    {
      const payload = await buildPortfolioMutationPayload(draft);
      return photographerService.updateMyPortfolioItem(itemId, payload);
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

      setEditingItemId(null);

      toast.success("Portfolio item updated", {
        description: "Your latest portfolio changes are now saved.",
      });
    },
    onError: () =>
    {
      toast.error("We couldn’t update this portfolio item", {
        description: "Please try again in a moment.",
      });
    },
  });

  const deletePortfolioItemMutation = useMutation({
    mutationFn: (itemId: string) => photographerService.deleteMyPortfolioItem(itemId),
    onSuccess: (_, deletedItemId) =>
    {
      queryClient.setQueryData<PhotographerPortfolioItem[]>(
        queryKey,
        (current) => (current ?? []).filter((item) => item.id !== deletedItemId),
      );

      if (editingItemId === deletedItemId) {
        setEditingItemId(null);
      }

      toast.success("Portfolio item deleted", {
        description: "The saved work was removed from your portfolio.",
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
      if (!item.asset.assetId) {
        throw new Error("Missing uploaded asset reference.");
      }

      return photographerService.updateMyPortfolioItem(item.id, {
        title: item.title,
        description: item.description,
        category: item.category,
        isFeatured: !item.isFeatured,
        assetId: item.asset.assetId,
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

  const sortedItems = useMemo(() =>
  {
    return sortPortfolioItems(portfolioQuery.data ?? []);
  }, [portfolioQuery.data]);

  const featuredCount = useMemo(() =>
  {
    return sortedItems.filter((item) => item.isFeatured).length;
  }, [sortedItems]);

  const uploadedCount = useMemo(() =>
  {
    return sortedItems.filter((item) => item.asset.source === "uploaded-remote")
      .length;
  }, [sortedItems]);

  const editingItem = useMemo(() =>
  {
    return sortedItems.find((item) => item.id === editingItemId) ?? null;
  }, [editingItemId, sortedItems]);

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
                      This portfolio workspace is reserved for photographer accounts.
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
                    })}
                  >
                    Go to profile
                  </Link>

                  <Link
                    href="/"
                    className={buttonVariants({
                      size: "lg",
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
    createPortfolioItemMutation.isPending ||
    updatePortfolioItemMutation.isPending ||
    deletePortfolioItemMutation.isPending ||
    toggleFeaturedMutation.isPending;

  return (
    <>
      <Navbar />
      <main className="pb-16 pt-10">
        <Container className="space-y-8">
          <section className="space-y-6">
            <div className="space-y-4">
              <Badge variant="accent">Real backend portfolio</Badge>

              <div className="space-y-3">
                <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
                  Manage saved portfolio works, {displayName}.
                </h1>

                <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                  This phase replaces browser-local portfolio state with real
                  backend persistence while keeping the asset-first upload flow
                  and newest-first ordering.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
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
                    Uploaded assets
                  </p>
                  <p className="font-serif text-3xl text-foreground">
                    {uploadedCount}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <PortfolioItemForm
            mode={editingItem ? "edit" : "create"}
            initialValue={mapItemToDraft(editingItem)}
            isSubmitting={
              createPortfolioItemMutation.isPending ||
              updatePortfolioItemMutation.isPending
            }
            onCancel={() => setEditingItemId(null)}
            onSubmit={async (draft) =>
            {
              if (editingItem) {
                await updatePortfolioItemMutation.mutateAsync({
                  itemId: editingItem.id,
                  draft,
                });
                return;
              }

              await createPortfolioItemMutation.mutateAsync(draft);
            }}
          />

          {sortedItems.length === 0 ? (
            <PortfolioEmptyState />
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  Portfolio preview
                </p>

                <h2 className="font-serif text-3xl text-foreground">
                  Your saved portfolio set
                </h2>

                <p className="text-sm leading-7 text-muted">
                  These works now come from the real backend source of truth.
                  New items appear first, and edits or featured changes persist
                  across refresh.
                </p>
              </div>

              <PortfolioGrid
                items={sortedItems}
                renderActions={(item) => (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingItemId(item.id)}
                      disabled={isAnyMutationPending}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleFeaturedMutation.mutate(item)}
                      disabled={isAnyMutationPending}
                    >
                      {item.isFeatured ? "Unfeature" : "Feature"}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => deletePortfolioItemMutation.mutate(item.id)}
                      disabled={isAnyMutationPending}
                    >
                      Delete
                    </Button>
                  </>
                )}
              />
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
};