"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavLinkItem
{
    label: string;
    href: string;
}

interface MobileNavProps
{
    navLinks: NavLinkItem[];
}

const MenuIcon = () => (
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

const CloseIcon = () => (
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

const isActiveNavLink = (pathname: string, href: string) =>
{
    if (href.startsWith("/#")) {
        return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
};

export const MobileNav = ({ navLinks }: MobileNavProps) =>
{
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

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

    return (
        <div className="lg:hidden">
            <button
                type="button"
                className={[
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground",
                    "transition-colors duration-150 hover:border-accent hover:text-accent",
                    isOpen ? "border-accent text-accent" : "",
                ].join(" ")}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {isOpen ? (
                <div className="fixed inset-x-0 top-[4.75rem] z-[60] border-b border-border bg-background shadow-xl">
                    <div className="mx-auto max-w-md min-h-screen px-5 py-5">
                        <nav className="space-y-2">
                            {navLinks.map((link) =>
                            {
                                const isActive = isActiveNavLink(pathname, link.href);

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={[
                                            "flex items-center justify-between rounded-2xl border px-4 py-4 text-base font-medium",
                                            "transition-colors duration-150",
                                            isActive
                                                ? "border-accent/30 bg-accent/10 text-accent"
                                                : "border-transparent text-foreground hover:border-border hover:bg-surface hover:text-accent",
                                        ].join(" ")}
                                    >
                                        <span>{link.label}</span>
                                        <span className={isActive ? "text-accent" : "text-muted"}>
                                            →
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            ) : null}
        </div>
    );
};