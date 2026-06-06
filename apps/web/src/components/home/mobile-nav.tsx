"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { AuthRole } from "../../types/auth.types";
import { Button } from "../ui/button";

interface NavLinkItem
{
    label: string;
    href: string;
}

interface MobileNavProps
{
    navLinks: NavLinkItem[];
    isAuthenticated: boolean;
    isHydrating: boolean;
    hasHydrated: boolean;
    userEmail?: string;
    userRole?: AuthRole;
    isSigningOut: boolean;
    onSignOut: () => void;
}

const MenuIcon = () =>
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
            <path d="M5 7h14" />
            <path d="M5 12h14" />
            <path d="M5 17h14" />
        </svg>
    );
};

const CloseIcon = () =>
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
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
};

const isActiveNavLink = (pathname: string, href: string) =>
{
    if (href.startsWith("/#")) {
        return pathname === "/";
    }

    if (href === "/") {
        return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
};

export const MobileNav = ({
    navLinks,
    isAuthenticated,
    isHydrating,
    hasHydrated,
    userEmail,
    userRole,
    isSigningOut,
    onSignOut,
}: MobileNavProps) =>
{
    const pathname = usePathname();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const isPhotographer = userRole === "photographer";

    useEffect(() =>
    {
        setIsMounted(true);
    }, []);

    useEffect(() =>
    {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() =>
    {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () =>
        {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    const handleClose = () => setIsOpen(false);

    const panel = (
        <div
            className={[
                "fixed inset-0 z-[80] lg:hidden",
                "transition-[opacity,visibility] duration-300 ease-out",
                isOpen
                    ? "visible opacity-100"
                    : "invisible pointer-events-none opacity-0",
            ].join(" ")}
            aria-hidden={!isOpen}
        >
            <button
                type="button"
                className={[
                    "absolute inset-0 bg-foreground/20 backdrop-blur-[2px]",
                    "transition-opacity duration-300 ease-out",
                    isOpen ? "opacity-100" : "opacity-0",
                ].join(" ")}
                onClick={handleClose}
                aria-label="Close menu overlay"
                tabIndex={isOpen ? 0 : -1}
            />

            <div
                className={[
                    "relative flex h-full w-full flex-col bg-background shadow-2xl",
                    "transition-[transform,opacity] duration-300 ease-out",
                    isOpen
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-4 opacity-0",
                ].join(" ")}
            >
                <div className="flex items-center justify-between border-b border-border px-5 py-5">
                    <div className="flex min-w-0 items-center gap-4">
                        <Link
                            href="/"
                            onClick={handleClose}
                            className="font-serif text-2xl tracking-tight text-foreground"
                        >
                            Fotovia
                        </Link>

                        <button
                            type="button"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-accent hover:text-accent"
                            onClick={handleClose}
                            aria-label="Close menu"
                            tabIndex={isOpen ? 0 : -1}
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">

                        {!hasHydrated || isHydrating ? (
                            <div className="h-10 w-28 animate-pulse rounded-full border border-border bg-surface/60" />
                        ) : !isAuthenticated ? (
                            <Button
                                size="sm"
                                className="h-10 px-4 text-xs hover:bg-foreground/85 cursor-pointer"
                                onClick={() =>
                                {
                                    handleClose();
                                    router.push("/sign-in");
                                }}
                                tabIndex={isOpen ? 0 : -1}
                            >
                                Sign In / Sign Up
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-7">
                    <nav className="space-y-2">
                        {navLinks.map((link, index) =>
                        {
                            const isActive = isActiveNavLink(pathname, link.href);

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={handleClose}
                                    tabIndex={isOpen ? 0 : -1}
                                    className={[
                                        "flex items-center justify-between rounded-2xl border px-4 py-4 text-base font-medium",
                                        "transition-[opacity,transform,background-color,border-color,color]",
                                        "duration-300 ease-out",
                                        isOpen
                                            ? "translate-y-0 opacity-100"
                                            : "translate-y-2 opacity-0",
                                        isActive
                                            ? "border-accent/30 bg-accent/10 text-accent"
                                            : "border-transparent text-foreground hover:border-border hover:bg-surface hover:text-accent",
                                    ].join(" ")}
                                    style={{
                                        transitionDelay: isOpen
                                            ? `${80 + index * 40}ms`
                                            : "0ms",
                                    }}
                                >
                                    <span>{link.label}</span>
                                    <span
                                        className={isActive ? "text-accent" : "text-muted"}
                                    >
                                        →
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* <div
                        className={[
                            "mt-8 rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm",
                            "transition-[opacity,transform] duration-300 ease-out",
                            isOpen
                                ? "translate-y-0 opacity-100 delay-200"
                                : "translate-y-2 opacity-0",
                        ].join(" ")}
                    >
                        {!hasHydrated || isHydrating ? (
                            <div className="space-y-3">
                                <div className="h-4 w-24 animate-pulse rounded bg-border/60" />
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
                                        <>
                                            <button
                                                type="button"
                                                className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-sm text-foreground transition hover:bg-background"
                                                onClick={() =>
                                                {
                                                    handleClose();
                                                    router.push("/photographer/portfolio");
                                                }}
                                                tabIndex={isOpen ? 0 : -1}
                                            >
                                                <span>My portfolio</span>
                                                <span className="text-muted">→</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-sm text-foreground transition hover:bg-background"
                                                onClick={() =>
                                                {
                                                    handleClose();
                                                    router.push("/photographer/bookings");
                                                }}
                                                tabIndex={isOpen ? 0 : -1}
                                            >
                                                <span>Booking requests</span>
                                                <span className="text-muted">→</span>
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-sm text-foreground transition hover:bg-background"
                                            onClick={() =>
                                            {
                                                handleClose();
                                                router.push("/my-bookings");
                                            }}
                                            tabIndex={isOpen ? 0 : -1}
                                        >
                                            <span>My bookings</span>
                                            <span className="text-muted">→</span>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-sm text-foreground transition hover:bg-background"
                                        onClick={() =>
                                        {
                                            handleClose();
                                            router.push("/profile");
                                        }}
                                        tabIndex={isOpen ? 0 : -1}
                                    >
                                        <span>{isPhotographer ? "Public info" : "Profile"}</span>
                                        <span className="text-muted">→</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                        {
                                            handleClose();
                                            onSignOut();
                                        }}
                                        disabled={isSigningOut}
                                        className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-sm text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                                        tabIndex={isOpen ? 0 : -1}
                                    >
                                        <span>
                                            {isSigningOut ? "Signing out..." : "Sign out"}
                                        </span>
                                        <span className="text-muted">↗</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                    Account
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Sign in before sending a booking request, or create a new account if this is your first time using Fotovia.
                                </p>
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                type="button"
                className={[
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground",
                    "transition hover:border-accent hover:text-accent",
                    isOpen ? "border-accent text-accent" : "",
                ].join(" ")}
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                aria-expanded={isOpen}
            >
                <MenuIcon />
            </button>

            {isMounted ? createPortal(panel, document.body) : null}
        </>
    );
};