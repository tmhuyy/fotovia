"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuthStore } from "../../store/auth.store";
import { Container } from "../layout/container";

interface ShootStyleCard
{
    value: string;
    label: string;
    subtitle: string;
    imageUrl: string;
    alt: string;
}

const shootStyleCards: ShootStyleCard[] = [
    {
        value: "aerial",
        label: "Aerial",
        subtitle: "Drone / overhead",
        imageUrl:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
        alt: "Aerial landscape photography view",
    },
    {
        value: "architecture",
        label: "Architecture",
        subtitle: "Buildings / spaces",
        imageUrl:
            "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=80",
        alt: "Modern architecture photography",
    },
    {
        value: "event",
        label: "Event",
        subtitle: "Ceremony / gathering",
        imageUrl:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
        alt: "Event photography with crowd and stage lights",
    },
    {
        value: "fashion",
        label: "Fashion",
        subtitle: "Editorial / outfit",
        imageUrl:
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
        alt: "Fashion portrait photography",
    },
    {
        value: "food",
        label: "Food",
        subtitle: "Restaurant / product",
        imageUrl:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
        alt: "Styled food photography table",
    },
    {
        value: "nature",
        label: "Nature",
        subtitle: "Outdoor / landscape",
        imageUrl:
            "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
        alt: "Nature landscape photography",
    },
    {
        value: "sports",
        label: "Sports",
        subtitle: "Action / movement",
        imageUrl:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
        alt: "Sports action photography",
    },
    {
        value: "street",
        label: "Street",
        subtitle: "Urban / candid",
        imageUrl:
            "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=900&q=80",
        alt: "Street lifestyle photography scene",
    },
    {
        value: "wedding",
        label: "Wedding",
        subtitle: "Couple / ceremony",
        imageUrl:
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
        alt: "Wedding couple photography",
    },
    {
        value: "wildlife",
        label: "Wildlife",
        subtitle: "Animal / nature",
        imageUrl:
            "https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=900&q=80",
        alt: "Wildlife animal photography",
    },
];

const ArrowIcon = ({ direction }: { direction: "left" | "right" }) =>
{
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
        >
            {direction === "left" ? (
                <>
                    <path d="M19 12H5" />
                    <path d="m11 6-6 6 6 6" />
                </>
            ) : (
                <>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </>
            )}
        </svg>
    );
};

export const HomeShootStyleCarousel = () =>
{
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [canScrollBackward, setCanScrollBackward] = useState(false);
    const [canScrollForward, setCanScrollForward] = useState(true);

    const { user, isAuthenticated, hasHydrated, isHydrating } = useAuthStore();

    const isPhotographerHome =
        hasHydrated &&
        !isHydrating &&
        isAuthenticated &&
        user?.role === "photographer";

    const updateScrollState = useCallback(() =>
    {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer) {
            return;
        }

        const maxScrollLeft =
            scrollContainer.scrollWidth - scrollContainer.clientWidth;

        setCanScrollBackward(scrollContainer.scrollLeft > 8);
        setCanScrollForward(scrollContainer.scrollLeft < maxScrollLeft - 8);
    }, []);

    const scrollStyles = (direction: "left" | "right") =>
    {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer) {
            return;
        }

        const distance = scrollContainer.clientWidth * 0.78;

        scrollContainer.scrollBy({
            left: direction === "left" ? -distance : distance,
            behavior: "smooth",
        });
    };

    useEffect(() =>
    {
        const scrollContainer = scrollContainerRef.current;

        if (!scrollContainer) {
            return;
        }

        updateScrollState();

        scrollContainer.addEventListener("scroll", updateScrollState);
        window.addEventListener("resize", updateScrollState);

        return () =>
        {
            scrollContainer.removeEventListener("scroll", updateScrollState);
            window.removeEventListener("resize", updateScrollState);
        };
    }, [updateScrollState]);

    if (isPhotographerHome) {
        return null;
    }

    return (
        <section className="pb-16 pt-0 sm:pb-20">
            <Container size="wide">
                <div className="space-y-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-3 text-center sm:text-left">
                            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-muted">
                                AI style categories
                            </p>

                            <h2 className="font-display text-4xl leading-tight tracking-[-0.03em] text-foreground sm:text-5xl">
                                Variety of Shooting Types
                            </h2>
                        </div>

                        <div className="hidden items-center gap-2 sm:flex">
                            <button
                                type="button"
                                onClick={() => scrollStyles("left")}
                                disabled={!canScrollBackward}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
                                aria-label="Scroll shooting styles left"
                            >
                                <ArrowIcon direction="left" />
                            </button>

                            <button
                                type="button"
                                onClick={() => scrollStyles("right")}
                                disabled={!canScrollForward}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
                                aria-label="Scroll shooting styles right"
                            >
                                <ArrowIcon direction="right" />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={scrollContainerRef}
                        className="flex snap-x gap-4 overflow-x-auto pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
                    >
                        {shootStyleCards.map((style) => (
                            <Link
                                key={style.value}
                                href={`/bookings/new?style=${encodeURIComponent(
                                    style.value,
                                )}`}
                                className="group relative h-44 min-w-0 flex-[0_0_78%] snap-start overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-[0_18px_45px_rgba(23,23,23,0.08)] transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_24px_60px_rgba(23,23,23,0.12)] sm:h-48 sm:flex-[0_0_42%] md:flex-[0_0_31%] lg:flex-[0_0_23%] xl:flex-[0_0_18%]"
                            >
                                <img
                                    src={style.imageUrl}
                                    alt={style.alt}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/78 via-foreground/18 to-transparent" />

                                

                                <div className="absolute inset-x-0 bottom-0 p-5">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-background">
                                                {style.label}
                                            </h3>

                                        </div>

                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/95 text-foreground transition group-hover:bg-accent group-hover:text-background">
                                            <ArrowIcon direction="right" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="flex justify-center gap-2 sm:hidden">
                        <button
                            type="button"
                            onClick={() => scrollStyles("left")}
                            disabled={!canScrollBackward}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Scroll shooting styles left"
                        >
                            <ArrowIcon direction="left" />
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollStyles("right")}
                            disabled={!canScrollForward}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label="Scroll shooting styles right"
                        >
                            <ArrowIcon direction="right" />
                        </button>
                    </div>
                </div>
            </Container>
        </section>
    );
};