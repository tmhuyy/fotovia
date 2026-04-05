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
        title: "Persistent portfolio management",
        description:
            "The portfolio page now supports asset-first item creation plus local persistence, editing, delete, featured toggles, and simple reorder actions.",
        ctaLabel: "Open portfolio",
        href: "/photographer/portfolio",
    },
    {
        title: "Booking readiness",
        description:
            "Protected booking entry is already in place. Request management can grow here once booking features become real backend flows.",
        ctaLabel: "View booking entry",
        href: "/bookings/new",
    },
];

export const PhotographerDashboardPage = () => {
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

    const completion = useMemo(() => {
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
                <main className="bg-background">
                    <Container className="py-16 md:py-24">
                        <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
                            <Badge variant="accent">Workspace access</Badge>
                            <h1 className="mt-4 font-serif text-3xl text-foreground md:text-4xl">
                                This workspace is reserved for photographer
                                accounts.
                            </h1>
                            <p className="mt-4 text-base leading-relaxed text-muted">
                                Your account is signed in, but this route is
                                meant for the photographer side of Fotovia. You
                                can still manage your current profile or return
                                to the main marketplace flow.
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
                        <Badge variant="accent">Photographer workspace</Badge>

                        <h1 className="mt-4 font-serif text-3xl leading-tight text-foreground md:text-5xl">
                            Welcome back, {displayName}.
                        </h1>

                        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
                            This workspace now points you toward the next
                            practical creative step: keep your profile strong,
                            then move into a portfolio flow that can actually
                            save, edit, and organize your works on this device
                            while the real media backend is still being
                            prepared.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/profile"
                                className={buttonVariants({ size: "lg" })}
                            >
                                Edit profile details
                            </Link>

                            <Link
                                href="/photographer/portfolio"
                                className={buttonVariants({
                                    size: "lg",
                                    variant: "secondary",
                                })}
                            >
                                Open portfolio
                            </Link>
                        </div>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
                        <PhotographerProfileCompletionCard
                            completion={completion}
                            isLoading={profileQuery.isLoading}
                            isProfileMissing={isProfileMissing}
                            errorMessage={
                                isProfileMissing
                                    ? undefined
                                    : profileError?.message
                            }
                        />

                        <div className="space-y-4">
                            <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.28em] text-muted">
                                    Current status
                                </p>

                                <p className="mt-4 text-2xl font-semibold text-foreground">
                                    {completion.isComplete
                                        ? "Ready for persistent portfolio setup"
                                        : `${completion.totalCount - completion.completedCount} items left`}
                                </p>

                                <p className="mt-3 text-sm leading-7 text-muted">
                                    {completion.isComplete
                                        ? "Your core profile is ready enough to move into the first persistent portfolio management phase."
                                        : "Finish the missing profile fields first, then your portfolio setup will feel more complete and trustworthy."}
                                </p>

                                <div className="mt-6 rounded-2xl bg-background px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                        Completion score
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-foreground">
                                        {completion.completionPercentage}%
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.28em] text-muted">
                                    Next product direction
                                </p>

                                <div className="mt-4 space-y-4">
                                    {workspaceHighlights.map((item) => (
                                        <div
                                            key={item.title}
                                            className="rounded-2xl border border-border bg-background px-4 py-4"
                                        >
                                            <h2 className="text-base font-semibold text-foreground">
                                                {item.title}
                                            </h2>

                                            <p className="mt-2 text-sm leading-7 text-muted">
                                                {item.description}
                                            </p>

                                            {item.href ? (
                                                <Link
                                                    href={item.href}
                                                    className="mt-4 inline-flex text-sm font-medium text-foreground transition hover:text-accent"
                                                >
                                                    {item.ctaLabel} →
                                                </Link>
                                            ) : (
                                                <p className="mt-4 text-sm font-medium text-accent">
                                                    {item.ctaLabel}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </Container>
            </main>

            <Footer />
        </>
    );
};
