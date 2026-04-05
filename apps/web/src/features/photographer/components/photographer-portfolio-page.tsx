"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonVariants } from "../../../components/ui/button";
import { useAuthStore } from "../../../store/auth.store";
import { mockPortfolioItems } from "../data/mock-portfolio-items";
import { portfolioStorage } from "../lib/portfolio-storage";
import type {
  PhotographerPortfolioItem,
  PortfolioItemDraft,
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

const createPortfolioItem = (
  draft: PortfolioItemDraft,
  currentItems: PhotographerPortfolioItem[],
): PhotographerPortfolioItem =>
{
  if (!draft.asset) {
    throw new Error("Asset is required to create a portfolio item.");
  }

  return {
    id: `portfolio-${Date.now()}`,
    title: draft.title,
    description: draft.description,
    asset: draft.asset,
    category: draft.category,
    isFeatured: draft.isFeatured,
    sortOrder: currentItems.length + 1,
    createdAt: new Date().toISOString(),
  };
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

export const PhotographerPortfolioPage = () =>
{
  const { user } = useAuthStore();

  const [portfolioItems, setPortfolioItems] = useState<
    PhotographerPortfolioItem[]
  >([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const isPhotographer = user?.role === "photographer";
  const displayName = user?.fullName?.trim() || user?.email || "Photographer";

  useEffect(() =>
  {
    const savedItems = portfolioStorage.load();
    setPortfolioItems(sortPortfolioItems(savedItems));
    setIsStorageReady(true);
  }, []);

  useEffect(() =>
  {
    if (!isStorageReady) return;
    portfolioStorage.save(portfolioItems);
  }, [isStorageReady, portfolioItems]);

  const sortedItems = useMemo(() =>
  {
    return sortPortfolioItems(portfolioItems);
  }, [portfolioItems]);

  const featuredCount = useMemo(() =>
  {
    return portfolioItems.filter((item) => item.isFeatured).length;
  }, [portfolioItems]);

  const localPreviewCount = useMemo(() =>
  {
    return portfolioItems.filter(
      (item) => item.asset.source === "local-preview",
    ).length;
  }, [portfolioItems]);

  const editingItem = useMemo(() =>
  {
    return portfolioItems.find((item) => item.id === editingItemId) ?? null;
  }, [editingItemId, portfolioItems]);

  const handleAddItem = (draft: PortfolioItemDraft) =>
  {
    setPortfolioItems((current) =>
      sortPortfolioItems([createPortfolioItem(draft, current), ...current]),
    );
  };

  const handleLoadSamples = () =>
  {
    setEditingItemId(null);
    setPortfolioItems(sortPortfolioItems([...mockPortfolioItems]));
  };

  const handleResetPortfolio = () =>
  {
    setEditingItemId(null);
    setPortfolioItems([]);
    portfolioStorage.clear();
  };

  const handleStartEdit = (itemId: string) =>
  {
    setEditingItemId(itemId);
  };

  const handleCancelEdit = () =>
  {
    setEditingItemId(null);
  };

  const handleSaveEdit = (draft: PortfolioItemDraft) =>
  {
    if (!editingItemId) return;

    setPortfolioItems((current) =>
      sortPortfolioItems(
        current.map((item) =>
          item.id === editingItemId && draft.asset
            ? {
              ...item,
              title: draft.title,
              description: draft.description,
              asset: draft.asset,
              category: draft.category,
              isFeatured: draft.isFeatured,
            }
            : item,
        ),
      ),
    );

    setEditingItemId(null);
  };

  const handleDeleteItem = (itemId: string) =>
  {
    setPortfolioItems((current) =>
      sortPortfolioItems(current.filter((item) => item.id !== itemId)),
    );

    if (editingItemId === itemId) {
      setEditingItemId(null);
    }
  };

  const handleToggleFeatured = (itemId: string) =>
  {
    setPortfolioItems((current) =>
      sortPortfolioItems(
        current.map((item) =>
          item.id === itemId
            ? {
              ...item,
              isFeatured: !item.isFeatured,
            }
            : item,
        ),
      ),
    );
  };

  if (!isPhotographer) {
    return (
      <>
        <Navbar />
        <main className="bg-background">
          <Container className="py-16 md:py-24">
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
              <Badge variant="accent">Portfolio access</Badge>

              <h1 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
                This portfolio workspace is reserved for photographer accounts.
              </h1>

              <p className="mt-4 text-base leading-relaxed text-muted">
                Your account is signed in, but this route is meant for
                photographer-side portfolio setup. You can still return to your
                profile or go back to the main marketplace flow.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/profile"
                  className={buttonVariants({ size: "lg" })}
                >
                  Go to profile
                </Link>

                <Link
                  href="/"
                  className={buttonVariants({
                    size: "lg",
                    variant: "secondary",
                  })}
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bg-background">
        <Container className="space-y-10 py-14 md:py-20">
          <section className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm md:p-10">
            <Badge variant="accent">Persistent portfolio management</Badge>

            <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground md:text-5xl">
              Manage saved portfolio works, {displayName}.
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
              This phase keeps the asset-first portfolio flow from Phase 28, but
              now adds local persistence and item management actions. Your
              portfolio no longer behaves like create-only temporary state.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-background px-5 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  Portfolio items
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {portfolioItems.length}
                </p>
              </div>

              <div className="rounded-2xl bg-background px-5 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  Featured works
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {featuredCount}
                </p>
              </div>

              <div className="rounded-2xl bg-background px-5 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  Local asset previews
                </p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {localPreviewCount}
                </p>
              </div>

              <div className="rounded-2xl bg-background px-5 py-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  Sort mode
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  Newest first
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-4">
              {!isStorageReady ? (
                <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm md:p-8">
                  <div className="h-6 w-40 animate-pulse rounded bg-border/60" />
                  <div className="mt-4 h-8 w-72 animate-pulse rounded bg-border/60" />
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-28 animate-pulse rounded-2xl bg-background"
                      />
                    ))}
                  </div>
                </div>
              ) : sortedItems.length === 0 ? (
                <PortfolioEmptyState onLoadSamples={handleLoadSamples} />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                    <div>
                      <Badge variant="neutral">Portfolio preview</Badge>
                      <h2 className="mt-3 text-2xl font-semibold text-foreground">
                        Your saved portfolio set
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        Changes now persist locally in this browser. You can edit,
                        delete, and feature items. Works are automatically shown
                        with the newest item first.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetPortfolio}
                      className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
                    >
                      Reset portfolio
                    </button>
                  </div>

                  <PortfolioGrid
                    items={sortedItems}
                    renderActions={(item) => (
                      <>
                        <Button
                          type="button"
                          size="md"
                          variant="secondary"
                          onClick={() => handleStartEdit(item.id)}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          size="md"
                          variant="secondary"
                          onClick={() => handleToggleFeatured(item.id)}
                        >
                          {item.isFeatured ? "Unfeature" : "Feature"}
                        </Button>

                        <Button
                          type="button"
                          size="md"
                          variant="secondary"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  />
                </>
              )}
            </div>

            <PortfolioItemForm
              mode={editingItem ? "edit" : "create"}
              initialValue={mapItemToDraft(editingItem)}
              onSubmit={editingItem ? handleSaveEdit : handleAddItem}
              onCancel={editingItem ? handleCancelEdit : undefined}
              onLoadSamples={!editingItem ? handleLoadSamples : undefined}
              canLoadSamples={!editingItem && sortedItems.length === 0}
            />
          </section>
        </Container>
      </main>

      <Footer />
    </>
  );
};