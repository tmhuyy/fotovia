"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { Container } from "../layout/container";
import { Button } from "../ui/button";
import { AccountMenu } from "./account-menu";
import { MobileNav } from "./mobile-nav";

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

            toast.success("Signed out", {
                description: "You have been signed out successfully.",
            });
        } catch {
            toast.error("We couldn’t sign you out cleanly", {
                description:
                    "We cleared your local session. Please try again if needed.",
            });
        } finally {
            clearAuth();
            router.push("/");
            router.refresh();
            setIsSigningOut(false);
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
            <Container className="flex h-20 items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4 md:gap-8">
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

                <div className="hidden items-center gap-3 lg:flex">
                    <Button
                        size="md"
                        onClick={() => router.push("/bookings/new")}
                    >
                        Book a Photographer
                    </Button>

                    {!hasHydrated || isHydrating ? (
                        <div className="h-11 w-48 animate-pulse rounded-full border border-border bg-surface/60" />
                    ) : isAuthenticated ? (
                        <AccountMenu
                            email={user?.email}
                            isSigningOut={isSigningOut}
                            onSignOut={handleSignOut}
                        />
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

                <div className="lg:hidden">
                    <MobileNav
                        navLinks={navLinks}
                        isAuthenticated={isAuthenticated}
                        isHydrating={isHydrating}
                        hasHydrated={hasHydrated}
                        userEmail={user?.email}
                        isSigningOut={isSigningOut}
                        onSignOut={handleSignOut}
                    />
                </div>
            </Container>
        </header>
    );
};
