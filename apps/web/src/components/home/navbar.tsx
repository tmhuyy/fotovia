"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { Container } from "../layout/container";
import { Button } from "../ui/button";
import { AccountMenu } from "./account-menu";
import { MobileNav } from "./mobile-nav";

const clientNavLinks = [
    {
        label: "Photographers",
        href: "/photographers",
    },
    {
        label: "Booking List",
        href: "/bookings/open",
    },
    {
        label: "Book A Photoshoot",
        href: "/bookings/new",
    },
];

const photographerNavLinks = [
    {
        label: "Photographers",
        href: "/photographers",
    },
    {
        label: "Booking List",
        href: "/bookings/open",
    },
];

const isActiveNavLink = (pathname: string, href: string) =>
{
    if (href === "/") {
        return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
};

export const Navbar = () =>
{
    const router = useRouter();
    const pathname = usePathname();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const { user, isAuthenticated, isHydrating, hasHydrated, clearAuth } =
        useAuthStore();

    const navLinks = useMemo(() =>
    {
        if (
            hasHydrated &&
            !isHydrating &&
            isAuthenticated &&
            user?.role === "photographer"
        ) {
            return photographerNavLinks;
        }

        return clientNavLinks;
    }, [hasHydrated, isAuthenticated, isHydrating, user?.role]);

    const handleSignOut = async () =>
    {
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
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
            <Container
                size="wide"
                className="flex h-[4.75rem] items-center justify-between gap-3 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4"
            >
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <Link href="/" className="flex min-w-0 items-center gap-4">
                        <span className="font-serif text-2xl tracking-tight text-foreground">
                            Fotovia
                        </span>

                        <span className="hidden text-xs uppercase tracking-[0.42em] text-muted sm:block">
                            Photography Booking
                        </span>
                    </Link>

                    <MobileNav navLinks={navLinks} />
                </div>

                <nav className="hidden items-center gap-7 lg:flex xl:gap-8">
                    {navLinks.map((link) =>
                    {
                        const isActive = isActiveNavLink(pathname, link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={[
                                    "text-sm font-medium tracking-[0.02em] transition",
                                    isActive
                                        ? "text-accent"
                                        : "text-foreground hover:text-accent",
                                ].join(" ")}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-end gap-3">
                    <div className="hidden items-center gap-3 lg:flex">
                        {!hasHydrated || isHydrating ? (
                            <div className="h-11 w-48 animate-pulse rounded-full border border-border bg-surface/60" />
                        ) : isAuthenticated ? (
                            <AccountMenu
                                email={user?.email}
                                fullName={user?.fullName}
                                avatarUrl={user?.avatarUrl}
                                userRole={user?.role}
                                isSigningOut={isSigningOut}
                                onSignOut={handleSignOut}
                            />
                        ) : (
                            <Button
                                size="md"
                                className="cursor-pointer px-7 hover:bg-foreground/85"
                                onClick={() => router.push("/sign-in")}
                            >
                                Sign In / Sign Up
                            </Button>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-3 lg:hidden">
                        {!hasHydrated || isHydrating ? (
                            <div className="h-10 w-10 animate-pulse rounded-full border border-border bg-surface/60" />
                        ) : isAuthenticated ? (
                            <AccountMenu
                                email={user?.email}
                                fullName={user?.fullName}
                                avatarUrl={user?.avatarUrl}
                                userRole={user?.role}
                                isSigningOut={isSigningOut}
                                onSignOut={handleSignOut}
                                compact
                            />
                        ) : (
                            <Button
                                size="sm"
                                className="h-10 cursor-pointer px-4 text-xs min-[380px]:px-5"
                                onClick={() => router.push("/sign-in")}
                            >
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </Container>
        </header>
    );
};