"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    isSigningOut: boolean;
    onSignOut: () => void;
}

export const MobileNav = ({
    navLinks,
    isAuthenticated,
    isHydrating,
    hasHydrated,
    userEmail,
    isSigningOut,
    onSignOut,
}: MobileNavProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

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

            {isOpen ? (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close menu overlay"
                    />

                    <div className="absolute inset-y-0 right-0 flex h-full w-full max-w-[420px] flex-col border-l border-border bg-background shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border px-6 py-5">
                            <p className="font-serif text-2xl text-foreground">
                                Fotovia
                            </p>
                            <button
                                type="button"
                                className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm text-foreground"
                                onClick={() => setIsOpen(false)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <div className="space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="block rounded-2xl px-4 py-4 text-base text-foreground transition hover:bg-surface"
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
                                        setIsOpen(false);
                                        router.push("/bookings/new");
                                    }}
                                >
                                    Book a Photographer
                                </Button>
                            </div>

                            <div className="mt-6 rounded-[1.5rem] border border-border bg-surface p-4">
                                {!hasHydrated || isHydrating ? (
                                    <div className="space-y-3">
                                        <div className="h-5 w-24 animate-pulse rounded bg-border/60" />
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
                                            <button
                                                type="button"
                                                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    router.push("/profile");
                                                }}
                                            >
                                                <span>Profile</span>
                                                <span className="text-muted">
                                                    →
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={onSignOut}
                                                disabled={isSigningOut}
                                                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <span>
                                                    {isSigningOut
                                                        ? "Signing out..."
                                                        : "Sign out"}
                                                </span>
                                                <span className="text-muted">
                                                    ↗
                                                </span>
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
                                                setIsOpen(false);
                                                router.push("/sign-in");
                                            }}
                                        >
                                            Sign in
                                        </Button>

                                        <Button
                                            type="button"
                                            className="w-full rounded-full"
                                            onClick={() => {
                                                setIsOpen(false);
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
            ) : null}
        </>
    );
};
