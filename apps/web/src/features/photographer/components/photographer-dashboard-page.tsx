"use client";

import Link from "next/link";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import { useAuthStore } from "../../../store/auth.store";

const workspaceHighlights = [
    {
        title: "Profile foundation",
        description:
            "Keep your photographer-facing details ready so future portfolio and booking flows have a stable profile source.",
        ctaLabel: "Update profile",
        href: "/profile",
    },
    {
        title: "Portfolio direction",
        description:
            "Portfolio tools will land in a later phase. This workspace now gives that future feature a real home in the product flow.",
        ctaLabel: "Coming next",
    },
    {
        title: "Booking readiness",
        description:
            "Direct and guided booking entry are already protected. Request management can grow here once the booking backend is ready.",
        ctaLabel: "View booking entry",
        href: "/bookings/new",
    },
];

export const PhotographerDashboardPage = () => {
    const { user } = useAuthStore();

    const isPhotographer = user?.role === "photographer";
    const displayName = user?.fullName?.trim() || user?.email || "Photographer";

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
                            This workspace is the first protected landing area
                            for photographers after sign-in when no stronger
                            destination exists. It keeps the next product steps
                            focused while deeper marketplace tools are still
                            being built.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/profile"
                                className={buttonVariants({ size: "lg" })}
                            >
                                Complete your profile
                            </Link>

                            <Link
                                href="/photographers"
                                className={buttonVariants({
                                    size: "lg",
                                    variant: "secondary",
                                })}
                            >
                                Preview the marketplace
                            </Link>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-3">
                        {workspaceHighlights.map((item) => (
                            <div
                                key={item.title}
                                className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm"
                            >
                                <p className="text-xs uppercase tracking-[0.28em] text-muted">
                                    Workspace pillar
                                </p>

                                <h2 className="mt-4 text-xl font-semibold text-foreground">
                                    {item.title}
                                </h2>

                                <p className="mt-3 text-sm leading-7 text-muted">
                                    {item.description}
                                </p>

                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className="mt-6 inline-flex text-sm font-medium text-foreground transition hover:text-accent"
                                    >
                                        {item.ctaLabel} →
                                    </Link>
                                ) : (
                                    <p className="mt-6 text-sm font-medium text-accent">
                                        {item.ctaLabel}
                                    </p>
                                )}
                            </div>
                        ))}
                    </section>
                </Container>
            </main>

            <Footer />
        </>
    );
};
