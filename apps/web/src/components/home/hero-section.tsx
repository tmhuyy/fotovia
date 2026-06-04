"use client";

import Link from "next/link";

import { useAuthStore } from "../../store/auth.store";
import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { HomeHeroVisual } from "./home-hero-visual";

const quickStyleLinks = [
    { label: "Wedding", href: "/photographers?style=Wedding" },
    { label: "Fashion", href: "/photographers?style=Fashion" },
    { label: "Street", href: "/photographers?style=Street" },
    { label: "Food", href: "/photographers?style=Food" },
];

const photographerQuickActions = [
    { label: "Portfolio", href: "/photographer/portfolio" },
    { label: "Add work", href: "/photographer/portfolio/new" },
    { label: "Booking requests", href: "/photographer/bookings" },
];

const photographerPanelItems = [
    {
        label: "01",
        title: "Show your best work",
        description:
            "Keep your public portfolio focused on the photography jobs you want clients to request.",
    },
    {
        label: "02",
        title: "Let AI read the style",
        description:
            "Fotovia uses uploaded cover and gallery images to prepare style signals for discovery.",
    },
    {
        label: "03",
        title: "Respond to clients",
        description:
            "Review booking requests after clients find your portfolio and decide the visual fit is right.",
    },
];

const PhotographerHeroPanel = () =>
{
    return (
        <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                </div>

                <p className="text-xs uppercase tracking-[0.32em] text-muted">
                    Photographer home
                </p>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
                <div className="rounded-[1.5rem] border border-border bg-background p-6">
                    <Badge variant="ai">AI style analysis</Badge>

                    <div className="mt-8 space-y-3">
                        <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                            Your portfolio is the storefront.
                        </h2>

                        <p className="text-sm leading-7 text-muted">
                            Upload real work, keep your public info ready, and let
                            Fotovia turn your images into style signals clients can
                            browse.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3">
                    {photographerPanelItems.map((item) => (
                        <div
                            key={item.label}
                            className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-background px-4 py-4"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-muted">
                                {item.label}
                            </span>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const HeroSection = () =>
{
    const { user, isAuthenticated, hasHydrated, isHydrating } = useAuthStore();

    const isPhotographerHome =
        hasHydrated &&
        !isHydrating &&
        isAuthenticated &&
        user?.role === "photographer";

    return (
        <section className="overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
            <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:items-center lg:gap-16">
                <div className="space-y-8">
                    <div className="space-y-5">
                        <Badge variant={isPhotographerHome ? "neutral" : "ai"}>
                            {isPhotographerHome
                                ? "Photographer tools"
                                : "AI-powered photography booking"}
                        </Badge>

                        <div className="space-y-5">
                            <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                                {isPhotographerHome
                                    ? "Manage your photography portfolio."
                                    : "Find a photographer by the photos you like."}
                            </h1>

                            <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                                {isPhotographerHome
                                    ? "Upload your best work, let Fotovia analyze your visual style, and keep your public profile ready for real booking requests."
                                    : "Choose a visual style, compare real portfolio work, and send a focused booking request when the photographer feels right."}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {isPhotographerHome ? (
                            <>
                                <Link
                                    href="/photographer/portfolio"
                                    className={buttonVariants({
                                        size: "lg",
                                        className: "rounded-full",
                                    })}
                                >
                                    Open my portfolio
                                </Link>

                                <Link
                                    href="/photographer/portfolio/new"
                                    className={buttonVariants({
                                        size: "lg",
                                        variant: "secondary",
                                        className: "rounded-full",
                                    })}
                                >
                                    Add work
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/photographers"
                                    className={buttonVariants({
                                        size: "lg",
                                        className: "rounded-full",
                                    })}
                                >
                                    Find photographers
                                </Link>

                                <Link
                                    href="/photographers"
                                    className={buttonVariants({
                                        size: "lg",
                                        variant: "secondary",
                                        className: "rounded-full",
                                    })}
                                >
                                    Explore styles
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted">
                            {isPhotographerHome
                                ? "Quick photographer actions"
                                : "Popular discovery paths"}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {(isPhotographerHome
                                ? photographerQuickActions
                                : quickStyleLinks
                            ).map((entry) => (
                                <Link
                                    key={entry.label}
                                    href={entry.href}
                                    className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
                                >
                                    {entry.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <HomeHeroVisual />
            </Container>
        </section>
    );
};