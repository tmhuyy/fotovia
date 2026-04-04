"use client";

import Link from "next/link";

import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { useAuthStore } from "../../store/auth.store";

export const HeroSection = () => {
    const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

    const isAuthReady = hasHydrated && !isHydrating;
    const role = user?.role;

    const showSignedOutActions = isAuthReady && !isAuthenticated;
    const showClientActions =
        isAuthReady && isAuthenticated && role === "client";
    const showPhotographerActions =
        isAuthReady && isAuthenticated && role === "photographer";
    const showActionSkeleton = !isAuthReady;

    return (
        <section className="relative overflow-hidden">
            <Container className="grid gap-12 py-16 sm:py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-28">
                <div className="space-y-6">
                    <Badge variant="accent">Premium Photography Booking</Badge>
                    <h1 className="font-display text-4xl leading-tight text-foreground md:text-6xl">
                        Book photographers who match your vision, instantly.
                    </h1>
                    <p className="text-base leading-relaxed text-muted md:text-lg">
                        Discover curated talent, explore portfolios, and use AI
                        style matching to find the perfect photographer for your
                        next moment.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        {showActionSkeleton ? (
                            <>
                                <div className="h-11 w-48 animate-pulse rounded-full border border-border bg-surface/60" />
                                <div className="h-11 w-56 animate-pulse rounded-full border border-border bg-surface/60" />
                            </>
                        ) : null}

                        {showSignedOutActions ? (
                            <>
                                <Link
                                    href="/photographers"
                                    className={buttonVariants({ size: "lg" })}
                                >
                                    Explore photographers
                                </Link>
                                <Link
                                    href="/bookings/new"
                                    className={buttonVariants({
                                        size: "lg",
                                        variant: "secondary",
                                    })}
                                >
                                    Start a booking request
                                </Link>
                            </>
                        ) : null}

                        {showClientActions ? (
                            <>
                                <Link
                                    href="/photographers"
                                    className={buttonVariants({ size: "lg" })}
                                >
                                    Explore photographers
                                </Link>
                                <Link
                                    href="/bookings/new"
                                    className={buttonVariants({
                                        size: "lg",
                                        variant: "secondary",
                                    })}
                                >
                                    Start a booking request
                                </Link>
                            </>
                        ) : null}

                        {showPhotographerActions ? (
                            <>
                                <Link
                                    href="/photographer/dashboard"
                                    className={buttonVariants({ size: "lg" })}
                                >
                                    Open workspace
                                </Link>
                                <Link
                                    href="/profile"
                                    className={buttonVariants({
                                        size: "lg",
                                        variant: "secondary",
                                    })}
                                >
                                    View profile
                                </Link>
                            </>
                        ) : null}
                    </div>

                    {showSignedOutActions ? (
                        <Link
                            href="/sign-up?role=photographer"
                            className="text-sm font-medium text-foreground"
                        >
                            Are you a photographer? Join the platform.
                        </Link>
                    ) : null}

                    <div className="flex items-center gap-6 text-xs uppercase tracking-[0.3em] text-muted">
                        <span>Editorial</span>
                        <span>Portrait</span>
                        <span>Luxury Events</span>
                    </div>
                </div>

                <div className="relative">
                    <div className="aspect-[4/5] w-full rounded-3xl border border-border bg-surface p-4 shadow-sm">
                        <div className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-surface to-background p-6">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                                    Featured Portfolio
                                </p>
                                <p className="font-display text-2xl text-foreground">
                                    Studio Reverie
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-28 rounded-2xl border border-border bg-background" />
                                <div className="h-28 rounded-2xl border border-border bg-background" />
                                <div className="h-28 rounded-2xl border border-border bg-background" />
                                <div className="h-28 rounded-2xl border border-border bg-background" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-6 bottom-10 hidden rounded-2xl border border-border bg-surface px-5 py-4 text-sm shadow-sm md:block">
                        <p className="font-medium text-foreground">
                            92% style match rate
                        </p>
                        <p className="text-xs text-muted">
                            Based on AI recommendations
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    );
};
