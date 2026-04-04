"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { Container } from "../layout/container";
import { Button } from "../ui/button";

const navLinks = [
    { label: "Photographers", href: "/photographers" },
    { label: "AI Match", href: "/ai" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Portfolio", href: "#portfolio" },
];

export const Navbar = () => {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const { user, isAuthenticated, isHydrating, hasHydrated, clearAuth } =
        useAuthStore();
    const handleSignOut = async () => {
        setIsSigningOut(true);

        try {
            await authService.signOut();
        } catch {
            // keep UI flow resilient even if sign-out request fails
        } finally {
            clearAuth();
            router.push("/");
            router.refresh();
            setIsSigningOut(false);
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
            <Container className="flex h-20 items-center justify-between gap-6">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center gap-4">
                        <span className="font-serif text-2xl tracking-tight text-foreground">
                            Fotovia
                        </span>
                        <span className="hidden text-xs uppercase tracking-[0.42em] text-muted md:block">
                            Premium Photography Booking
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-6 lg:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted transition hover:text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={() => router.push("/photographers")}
                    >
                        Explore
                    </Button>

                    <Button
                        size="md"
                        onClick={() => router.push("/bookings/new")}
                    >
                        Book a Photographer
                    </Button>

                    {!hasHydrated || isHydrating ? (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-36 animate-pulse rounded-full border border-border bg-surface/60" />
                            <div className="h-10 w-28 animate-pulse rounded-full border border-border bg-surface/60" />
                        </div>
                    ) : isAuthenticated ? (
                        <>
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => router.push("/profile")}
                            >
                                Profile
                            </Button>

                            <div className="hidden rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted xl:block">
                                {user?.email ?? "Signed in"}
                            </div>

                            <Button
                                variant="secondary"
                                size="md"
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                            >
                                {isSigningOut ? "Signing out..." : "Sign out"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                size="md"
                                onClick={() => router.push("/sign-in")}
                            >
                                Sign in
                            </Button>

                            <Button
                                size="md"
                                onClick={() => router.push("/sign-up")}
                            >
                                Create account
                            </Button>
                        </>
                    )}
                </div>
            </Container>
        </header>
    );
};
