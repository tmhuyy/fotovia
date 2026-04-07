"use client";

import Link from "next/link";

import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { useAuthStore } from "../../store/auth.store";

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
        <section className="pb-10 pt-10 sm:pt-14">
            <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-center">
                <div className="space-y-6">
                    <Badge variant="ai">AI-first photographer discovery</Badge>

                    <div className="space-y-4">
                        <h1 className="font-serif text-5xl leading-tight text-foreground sm:text-6xl">
                            Find the right photographer without the clutter.
                        </h1>

                        <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                            Fotovia keeps the entry simple: browse public
                            portfolios, use AI-detected style signals, then book
                            once the visual fit is clear.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
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
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            Popular discovery paths
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {quickStyleLinks.map((entry) => (
                                <Link
                                    key={entry.label}
                                    href={entry.href}
                                    className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:border-accent"
                                >
                                    {entry.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            What changes now
                        </p>

                        <div className="mt-4 space-y-3">
                            <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4">
                                <p className="text-sm font-medium text-foreground">
                                    Discovery starts from visual style
                                </p>

                                <p className="mt-1 text-sm leading-6 text-muted">
                                    AI-detected portfolio styles now guide the public
                                    discovery experience.
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4">
                                <p className="text-sm font-medium text-foreground">
                                    Homepage stays short
                                </p>

                                <p className="mt-1 text-sm leading-6 text-muted">
                                    Less placeholder explanation, more direct entry
                                    into browse and booking.
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4">
                                <p className="text-sm font-medium text-foreground">
                                    Public portfolios carry the proof
                                </p>

                                <p className="mt-1 text-sm leading-6 text-muted">
                                    Users can compare real portfolio work before
                                    moving into the booking flow.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};