"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { profileService } from "../../services/profile.service";
import type { AuthRole } from "../../types/auth.types";

interface AccountMenuProps
{
    email?: string;
    fullName?: string;
    avatarUrl?: string | null;
    userRole?: AuthRole;
    isSigningOut: boolean;
    onSignOut: () => void;
    compact?: boolean;
}

const BellIcon = () => (
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
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const ChatIcon = () => (
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
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
);

const getInitials = (fullName?: string, email?: string) =>
{
    const normalizedName = fullName?.trim();

    if (normalizedName) {
        const nameParts = normalizedName.split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] ?? "";
        const lastName = nameParts[nameParts.length - 1] ?? firstName;

        if (nameParts.length === 1) {
            return firstName.slice(0, 2).toUpperCase();
        }

        return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
    }

    if (email) {
        return email.slice(0, 2).toUpperCase();
    }

    return "FV";
};

export const AccountMenu = ({
    email,
    fullName,
    avatarUrl,
    userRole,
    isSigningOut,
    onSignOut,
    compact = false,
}: AccountMenuProps) =>
{
    const pathname = usePathname();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const profileQuery = useQuery({
        queryKey: ["navbar-profile", email ?? "anonymous"],
        queryFn: () => profileService.getMyProfile(email ?? ""),
        enabled: Boolean(email),
        retry: false,
        staleTime: 60_000,
    });

    const resolvedFullName =
        profileQuery.data?.fullName?.trim() || fullName?.trim() || "";

    const resolvedAvatarUrl =
        profileQuery.data?.avatarUrl ?? avatarUrl ?? null;

    const resolvedRole = profileQuery.data?.role ?? userRole;
    const isPhotographer = resolvedRole === "photographer";

    const displayName = useMemo(() =>
    {
        return resolvedFullName || email?.split("@")[0] || "Fotovia user";
    }, [email, resolvedFullName]);

    const initials = useMemo(() =>
    {
        return getInitials(resolvedFullName, email);
    }, [email, resolvedFullName]);

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
        <div
            ref={rootRef}
            className={[
                "relative flex items-center",
                compact ? "gap-2" : "gap-3",
            ].join(" ")}
        >

            <button
                type="button"
                className={[
                    "flex items-center justify-center overflow-hidden rounded-full border border-border bg-surface font-semibold text-foreground shadow-sm transition hover:border-accent hover:text-accent",
                    compact ? "h-10 w-10 text-xs" : "h-11 w-11 text-sm",
                    isOpen ? "border-accent text-accent" : "",
                ].join(" ")}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
            >
                {resolvedAvatarUrl ? (
                    <img
                        src={resolvedAvatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    initials
                )}
            </button>

            {isOpen ? (
                <div
                    className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(19rem,calc(100vw-2rem))] rounded-[1.5rem] border border-border bg-surface p-3 shadow-2xl"
                    role="menu"
                >
                    <div className="rounded-2xl bg-background px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">
                            {displayName}
                        </p>

                        {email ? (
                            <p className="mt-1 break-all text-xs text-muted">
                                {email}
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-3 space-y-1">
                        {isPhotographer ? (
                            <Link
                                href="/photographer/bookings"
                                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background hover:text-accent"
                            >
                                <span>Booking requests</span>
                                <span className="text-muted">→</span>
                            </Link>
                        ) : (
                            <Link
                                href="/my-bookings"
                                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background hover:text-accent"
                            >
                                <span>My bookings</span>
                                <span className="text-muted">→</span>
                            </Link>
                        )}

                        <Link
                            href="/profile"
                            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background hover:text-accent"
                        >
                            <span>{isPhotographer ? "Public info" : "Profile"}</span>
                            <span className="text-muted">→</span>
                        </Link>

                        <Link
                            href="/bookings/new"
                            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-background hover:text-accent"
                        >
                            <span>Book a photoshoot</span>
                            <span className="text-muted">→</span>
                        </Link>

                        <div className="my-2 h-px bg-border" />

                        <button
                            type="button"
                            onClick={onSignOut}
                            disabled={isSigningOut}
                            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-foreground transition hover:bg-background hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                            <span className="text-muted">↗</span>
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};