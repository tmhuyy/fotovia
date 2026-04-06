"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { AuthRole } from "../../types/auth.types";
import { Button } from "../ui/button";

interface AccountMenuProps
{
    email?: string;
    userRole?: AuthRole;
    isSigningOut: boolean;
    onSignOut: () => void;
}

export const AccountMenu = ({
    email,
    userRole,
    isSigningOut,
    onSignOut,
}: AccountMenuProps) =>
{
    const pathname = usePathname();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const initials = useMemo(() =>
    {
        if (!email) return "FV";
        return email.slice(0, 2).toUpperCase();
    }, [email]);

    const isPhotographer = userRole === "photographer";

    useEffect(() =>
    {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() =>
    {
        const handlePointerDown = (event: MouseEvent) =>
        {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <div ref={rootRef} className="relative">
            <Button
                type="button"
                variant="secondary"
                size="md"
                className="max-w-[240px] gap-3 rounded-full pl-3 pr-4"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold text-foreground">
                    {initials}
                </span>
                <span className="truncate text-sm">{email ?? "Account"}</span>
                <span className="shrink-0 text-xs text-muted">
                    {isOpen ? "▲" : "▼"}
                </span>
            </Button>

            {isOpen ? (
                <div className="absolute right-0 z-50 mt-3 w-72 rounded-[1.5rem] border border-border bg-surface p-3 shadow-xl">
                    <div className="rounded-2xl bg-background px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            Signed in as
                        </p>
                        <p className="mt-2 break-all text-sm font-medium text-foreground">
                            {email ?? "No email"}
                        </p>
                    </div>

                    <div className="mt-3 space-y-2">
                        {isPhotographer ? (
                            <Link
                                href="/photographer/dashboard"
                                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background"
                            >
                                <span>Workspace</span>
                                <span className="text-muted">→</span>
                            </Link>
                        ) : null}

                        <Link
                            href="/my-bookings"
                            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background"
                        >
                            <span>My bookings</span>
                            <span className="text-muted">→</span>
                        </Link>

                        <Link
                            href="/profile"
                            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background"
                        >
                            <span>Profile</span>
                            <span className="text-muted">→</span>
                        </Link>

                        <button
                            type="button"
                            onClick={onSignOut}
                            disabled={isSigningOut}
                            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span>
                                {isSigningOut ? "Signing out..." : "Sign out"}
                            </span>
                            <span className="text-muted">↗</span>
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};