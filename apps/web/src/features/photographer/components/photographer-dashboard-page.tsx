"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import { normalizeApiError } from "../../../services/api/error";
import { profileService } from "../../../services/profile.service";
import { useAuthStore } from "../../../store/auth.store";
import { getPhotographerProfileCompletion } from "../../profile/lib/get-profile-completion";
import { PhotographerProfileCompletionCard } from "./photographer-profile-completion-card";

const workspaceHighlights = [
    {
        title: "Profile editing",
        description:
            "Your real photographer data still lives in /profile. This workspace is meant to guide what needs attention first.",
        ctaLabel: "Open profile",
        href: "/profile",
    },
    {
        title: "Portfolio workspace",
        description:
            "Keep your public creative presence strong with real saved portfolio items, cover + gallery media, and public showcase rendering.",
        ctaLabel: "Open portfolio",
        href: "/photographer/portfolio",
    },
    {
        title: "Booking inbox",
        description:
            "Real client requests can now be reviewed from a photographer-side inbox, including the first confirm / decline decision.",
        ctaLabel: "Open bookings",
        href: "/photographer/bookings",
    },
];

export const PhotographerDashboardPage = () =>
{
    const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

    const authEmail = user?.email ?? "";
    const isPhotographer = user?.role === "photographer";

    const profileQuery = useQuery({
        queryKey: [
            "photographer-workspace-profile",
            user?.id ?? authEmail ?? "anonymous",
        ],
        queryFn: () => profileService.getMyProfile(authEmail),
        enabled:
            hasHydrated &&
            !isHydrating &&
            isAuthenticated &&
            isPhotographer &&
            Boolean(authEmail),
        retry: false,
    });

    const profileError = profileQuery.error
        ? normalizeApiError(
            profileQuery.error,
            "We couldn’t load your profile progress right now.",
        )
        : null;

    const isProfileMissing = profileError?.status === 404;

    const completion = useMemo(() =>
    {
        if (profileQuery.data) {
            return getPhotographerProfileCompletion(profileQuery.data);
        }

        return getPhotographerProfileCompletion(null);
    }, [profileQuery.data]);

    const displayName =
        profileQuery.data?.fullName?.trim() ||
        user?.fullName?.trim() ||
        user?.email ||
        "Photographer";

    if (!isPhotographer) {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-brand-background py-10 sm:py-14">
                    <Container className="max-w-4xl">
                        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 sm:p-8">
                            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                                Workspace access
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-brand-primary">
                                This workspace is reserved for photographer accounts.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-muted">
                                Your account is signed in, but this route is meant for the
                                photographer side of Fotovia. You can still manage your current
                                profile or return to the main marketplace flow.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href="/profile"
                                    className={buttonVariants({
                                        variant: "secondary",
                                        size: "md",
                                    })}
                                >
                                    Go to profile
                                </Link>
                                <Link
                                    href="/"
                                    className={buttonVariants({ variant: "primary", size: "md" })}
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

            <main className="min-h-screen bg-brand-background py-10 sm:py-14">
                <Container className="space-y-8">
                    <div className="space-y-4">
                        <Badge>Photographer workspace</Badge>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-semibold tracking-tight text-brand-primary sm:text-4xl">
                                Welcome back, {displayName}.
                            </h1>
                            <p className="max-w-3xl text-base leading-7 text-brand-muted">
                                This workspace now connects the three practical operating areas
                                that matter most right now: strengthen your public profile,
                                manage the portfolio clients can browse, and respond to incoming
                                booking requests.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/profile"
                                className={buttonVariants({ variant: "secondary", size: "md" })}
                            >
                                Edit profile details
                            </Link>
                            <Link
                                href="/photographer/portfolio"
                                className={buttonVariants({ variant: "secondary", size: "md" })}
                            >
                                Open portfolio
                            </Link>
                            <Link
                                href="/photographer/bookings"
                                className={buttonVariants({ variant: "primary", size: "md" })}
                            >
                                Open bookings
                            </Link>
                        </div>
                    </div>

                    <PhotographerProfileCompletionCard
                        completion={completion}
                        isLoading={profileQuery.isLoading}
                        isProfileMissing={isProfileMissing}
                        errorMessage={profileError?.message}
                    />

                    <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6">
                            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                                Current status
                            </p>

                            <p className="mt-4 text-lg font-semibold text-brand-primary">
                                {completion.isComplete
                                    ? "Marketplace-ready profile foundation"
                                    : `${completion.totalCount - completion.completedCount} items left`}
                            </p>

                            <p className="mt-3 text-sm leading-7 text-brand-muted">
                                {completion.isComplete
                                    ? "Your core profile is ready enough to support public browsing, portfolio visibility, and booking operations."
                                    : "Finish the missing profile fields first, then your public presence and booking trust signals will feel stronger."}
                            </p>

                            <div className="mt-6 rounded-2xl border border-brand-border bg-brand-background/70 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                                    Completion score
                                </p>
                                <p className="mt-2 text-3xl font-semibold text-brand-primary">
                                    {completion.completionPercentage}%
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                                    Next product direction
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                {workspaceHighlights.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-3xl border border-brand-border bg-brand-surface p-5"
                                    >
                                        <h2 className="text-lg font-semibold text-brand-primary">
                                            {item.title}
                                        </h2>
                                        <p className="mt-3 text-sm leading-7 text-brand-muted">
                                            {item.description}
                                        </p>

                                        <div className="mt-5">
                                            <Link
                                                href={item.href}
                                                className="text-sm font-medium text-brand-primary transition hover:text-brand-accent"
                                            >
                                                {item.ctaLabel} →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </Container>
            </main>

            <Footer />
        </>
    );
};