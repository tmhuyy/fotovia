"use client";

import Link from "next/link";

import { useAuthStore } from "../../store/auth.store";
import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";

const clientStyleCards = [
    {
        label: "Wedding",
        title: "Soft wedding stories",
        description: "Romantic light, emotion, clean editorial frames.",
        href: "/photographers?style=Wedding",
    },
    {
        label: "Fashion",
        title: "Fashion portraits",
        description: "Styled poses, strong mood, and visual direction.",
        href: "/photographers?style=Fashion",
    },
    {
        label: "Street",
        title: "Street moments",
        description: "Natural movement, city rhythm, candid energy.",
        href: "/photographers?style=Street",
    },
    {
        label: "Food",
        title: "Food styling",
        description: "Warm details, texture, color, and table scenes.",
        href: "/photographers?style=Food",
    },
];

export const HomeValueStrip = () =>
{
    const { user, isAuthenticated, hasHydrated, isHydrating } = useAuthStore();

    const isPhotographerHome =
        hasHydrated &&
        !isHydrating &&
        isAuthenticated &&
        user?.role === "photographer";

    if (isPhotographerHome) {
        return null;
    }

    return (
        <section className="pb-12 pt-2">
            <Container>
                <div className="overflow-hidden rounded-[2.5rem] border border-border bg-surface p-5 shadow-sm sm:p-6 lg:p-8">
                    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                        <div className="space-y-5">
                            <Badge variant="ai">Start with a style</Badge>

                            <div className="space-y-4">
                                <h2 className="max-w-2xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                                    Choose the look first. Pick the photographer after.
                                </h2>

                                <p className="max-w-xl text-sm leading-7 text-muted sm:text-base">
                                    Fotovia starts from visual taste. Browse by the kind
                                    of photos you want, then compare real portfolio work
                                    before sending a request.
                                </p>
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

                                <Link
                                    href="/bookings/new"
                                    className={buttonVariants({
                                        variant: "secondary",
                                        size: "lg",
                                        className: "rounded-full",
                                    })}
                                >
                                    Start a booking brief
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {clientStyleCards.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="group rounded-[1.5rem] border border-border bg-background p-5 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                                >
                                    <div className="mb-8 flex items-center justify-between gap-4">
                                        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                                            {item.label}
                                        </span>

                                        <span className="text-muted transition group-hover:translate-x-0.5 group-hover:text-accent">
                                            →
                                        </span>
                                    </div>

                                    <h3 className="font-serif text-2xl leading-tight text-foreground">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-muted">
                                        {item.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};