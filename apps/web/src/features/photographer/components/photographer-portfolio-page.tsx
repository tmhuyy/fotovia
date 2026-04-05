"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import { useAuthStore } from "../../../store/auth.store";
import { mockPortfolioItems } from "../data/mock-portfolio-items";
import type {
    PhotographerPortfolioItem,
    PortfolioItemDraft,
} from "../types/portfolio.types";
import { PortfolioEmptyState } from "./portfolio-empty-state";
import { PortfolioGrid } from "./portfolio-grid";
import { PortfolioItemForm } from "./portfolio-item-form";

const createPortfolioItem = (
    draft: PortfolioItemDraft,
    currentItems: PhotographerPortfolioItem[],
): PhotographerPortfolioItem => {
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

export const PhotographerPortfolioPage = () => {
    const { user } = useAuthStore();
    const [portfolioItems, setPortfolioItems] = useState<
        PhotographerPortfolioItem[]
    >([]);

    const isPhotographer = user?.role === "photographer";
    const displayName = user?.fullName?.trim() || user?.email || "Photographer";

    const sortedItems = useMemo(() => {
        return [...portfolioItems].sort((a, b) => a.sortOrder - b.sortOrder);
    }, [portfolioItems]);

    const featuredCount = useMemo(() => {
        return portfolioItems.filter((item) => item.isFeatured).length;
    }, [portfolioItems]);

    const localPreviewCount = useMemo(() => {
        return portfolioItems.filter(
            (item) => item.asset.source === "local-preview",
        ).length;
    }, [portfolioItems]);

    const handleAddItem = (draft: PortfolioItemDraft) => {
        setPortfolioItems((current) => [
            ...current,
            createPortfolioItem(draft, current),
        ]);
    };

    const handleLoadSamples = () => {
        setPortfolioItems([...mockPortfolioItems]);
    };

    const handleResetPortfolio = () => {
        setPortfolioItems([]);
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
                                This portfolio workspace is reserved for
                                photographer accounts.
                            </h1>

                            <p className="mt-4 text-base leading-relaxed text-muted">
                                Your account is signed in, but this route is
                                meant for photographer-side portfolio setup. You
                                can still return to your profile or go back to
                                the main marketplace flow.
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
                        <Badge variant="accent">
                            Portfolio asset upload foundation
                        </Badge>

                        <h1 className="mt-4 text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                            Build your portfolio with real image assets,{" "}
                            {displayName}.
                        </h1>

                        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
                            This phase upgrades the portfolio flow from manual
                            image URLs into an upload-oriented experience. The
                            files are still frontend-only for now, but the page
                            now behaves like an asset-first portfolio workspace.
                        </p>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
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
                        </div>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                        <div className="space-y-4">
                            {sortedItems.length === 0 ? (
                                <PortfolioEmptyState
                                    onLoadSamples={handleLoadSamples}
                                />
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                                        <div>
                                            <Badge variant="neutral">
                                                Portfolio preview
                                            </Badge>
                                            <h2 className="mt-3 text-2xl font-semibold text-foreground">
                                                Your current portfolio set
                                            </h2>
                                            <p className="mt-2 text-sm leading-7 text-muted">
                                                These works now use asset-style
                                                preview data instead of a plain
                                                image URL field. That makes the
                                                portfolio page closer to a later
                                                real upload flow.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleResetPortfolio}
                                            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
                                        >
                                            Reset to empty state
                                        </button>
                                    </div>

                                    <PortfolioGrid items={sortedItems} />
                                </>
                            )}
                        </div>

                        <PortfolioItemForm
                            onSubmit={handleAddItem}
                            onLoadSamples={handleLoadSamples}
                            canLoadSamples={sortedItems.length === 0}
                        />
                    </section>
                </Container>
            </main>

            <Footer />
        </>
    );
};
