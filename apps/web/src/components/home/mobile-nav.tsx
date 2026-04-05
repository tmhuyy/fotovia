"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { AuthRole } from "../../types/auth.types";
import { Button } from "../ui/button";

interface NavLinkItem {
    label: string;
    href: string;
}

interface MobileNavProps {
    navLinks: NavLinkItem[];
    isAuthenticated: boolean;
    isHydrating: boolean;
    hasHydrated: boolean;
    userEmail?: string;
    userRole?: AuthRole;
    isSigningOut: boolean;
    onSignOut: () => void;
}

export const MobileNav = ({
    navLinks,
    isAuthenticated,
    isHydrating,
    hasHydrated,
    userEmail,
    userRole,
    isSigningOut,
    onSignOut,
}: MobileNavProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const primaryAction = useMemo(() => {
        if (
            hasHydrated &&
            !isHydrating &&
            isAuthenticated &&
            userRole === "photographer"
        ) {
            return {
                label: "Open workspace",
                href: "/photographer/dashboard",
            };
        }

        return {
            label: "Book a Photographer",
            href: "/bookings/new",
        };
    }, [hasHydrated, isAuthenticated, isHydrating, userRole]);

    const isPhotographer = userRole === "photographer";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    const handleClose = () => setIsOpen(false);

    const panel = isOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
            <div className="absolute inset-0 bg-background" />

            <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border px-5 py-5">
                    <div className="min-w-0">
                        <p className="font-serif text-2xl text-foreground">
                            Fotovia
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.26em] text-muted">
                            Premium Photography Booking
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm text-foreground"
                        onClick={handleClose}
                        aria-label="Close menu"
                    >
                        Close
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6">
                    <div className="space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block rounded-2xl border border-transparent px-4 py-4 text-base text-foreground transition hover:border-border hover:bg-surface"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-6">
                        <Button
                            type="button"
                            className="w-full rounded-full"
                            onClick={() => {
                                handleClose();
                                router.push(primaryAction.href);
                            }}
                        >
                            {primaryAction.label}
                        </Button>
                    </div>

                    <div className="mt-8 rounded-[1.5rem] border border-border bg-surface p-4">
                        {!hasHydrated || isHydrating ? (
                            <div className="space-y-3">
                                <div className="h-4 w-24 animate-pulse rounded bg-border/60" />
                                <div className="h-11 w-full animate-pulse rounded-full bg-border/60" />
                                <div className="h-11 w-full animate-pulse rounded-full bg-border/60" />
                            </div>
                        ) : isAuthenticated ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl bg-background px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                        Signed in as
                                    </p>
                                    <p className="mt-2 break-all text-sm font-medium text-foreground">
                                        {userEmail ?? "No email"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {isPhotographer ? (
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-sm text-foreground transition hover:bg-background"
                                            onClick={() => {
                                                handleClose();
                                                router.push(
                                                    "/photographer/dashboard",
                                                );
                                            }}
                                        >
                                            <span>Workspace</span>
                                            <span className="text-muted">
                                                →
                                            </span>
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-sm text-foreground transition hover:bg-background"
                                        onClick={() => {
                                            handleClose();
                                            router.push("/profile");
                                        }}
                                    >
                                        <span>Profile</span>
                                        <span className="text-muted">→</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleClose();
                                            onSignOut();
                                        }}
                                        disabled={isSigningOut}
                                        className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-sm text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <span>
                                            {isSigningOut
                                                ? "Signing out..."
                                                : "Sign out"}
                                        </span>
                                        <span className="text-muted">↗</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full rounded-full"
                                    onClick={() => {
                                        handleClose();
                                        router.push("/sign-in");
                                    }}
                                >
                                    Sign in
                                </Button>

                                <Button
                                    type="button"
                                    className="w-full rounded-full"
                                    onClick={() => {
                                        handleClose();
                                        router.push("/sign-up");
                                    }}
                                >
                                    Create account
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                type="button"
                className="inline-flex h-11 items-center rounded-full border border-border bg-surface px-4 text-sm text-foreground transition hover:bg-background lg:hidden"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
            >
                Menu
            </button>

            {isMounted ? createPortal(panel, document.body) : null}
        </>
    );
};
