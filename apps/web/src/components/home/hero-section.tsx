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

export const HeroSection = () =>
{
    const { user, isAuthenticated, hasHydrated, isHydrating } = useAuthStore();

    const showWorkspaceAction =
        hasHydrated &&
        !isHydrating &&
        isAuthenticated &&
        user?.role === "photographer";

    return (
        <section className="overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
<Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:items-center lg:gap-16">                <div className="space-y-8">
                    <div className="space-y-5">
                        <Badge variant="ai">AI-powered photography booking</Badge>

                        <div className="space-y-5">
                            <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                                Find the right photographer by visual style.
                            </h1>

                            <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                                Browse photographers through portfolio-first discovery, compare
                                AI style signals, and send a focused booking request when the
                                visual fit feels right.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/photographers"
                            className={buttonVariants({
                                size: "lg",
                                className: "rounded-full",
                            })}
                        >
                            Browse photographers
                        </Link>

                        {showWorkspaceAction ? (
                            <Link
                                href="/photographer/portfolio"
                                className={buttonVariants({
                                    size: "lg",
                                    variant: "secondary",
                                    className: "rounded-full",
                                })}
                            >
                                Open workspace
                            </Link>
                        ) : (
                            <Link
                                href="/photographers"
                                className={buttonVariants({
                                    size: "lg",
                                    variant: "secondary",
                                    className: "rounded-full",
                                })}
                            >
                                Explore AI styles
                            </Link>
                        )}
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted">
                            Popular discovery paths
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {quickStyleLinks.map((entry) => (
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