"use client";

import Link from "next/link";
import { Container } from "../layout/container";
import { buttonVariants } from "../ui/button";
import { ThemeToggle } from "../common/theme-toggle";
import { useMockSessionStore } from "../../store/mock-session.store";

const navLinks = [
  { label: "Photographers", href: "/photographers" },
  { label: "AI Match", href: "/ai" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Portfolio", href: "#portfolio" },
];

export const Navbar = () => {
  const { isAuthenticated, role, signOut } = useMockSessionStore();

  const isPhotographer = isAuthenticated && role === "photographer";
  const isClient = isAuthenticated && role === "client";

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="font-display text-xl">
          Fotovia
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link
                href="/sign-in"
                className="text-xs text-muted hover:text-foreground sm:text-sm"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up?role=photographer"
                className={`${buttonVariants({ variant: "secondary", size: "sm" })} hidden sm:inline-flex`}
              >
                Become a photographer
              </Link>
              <Link
                href="/sign-up?role=client"
                className={buttonVariants({ size: "sm" })}
              >
                Get started
              </Link>
            </>
          ) : (
            <>
              {isClient ? (
                <Link
                  href="/photographers"
                  className={buttonVariants({ size: "sm" })}
                >
                  Explore photographers
                </Link>
              ) : null}
              {isPhotographer ? (
                <Link
                  href="/photographer/dashboard"
                  className={buttonVariants({ size: "sm" })}
                >
                  Workspace
                </Link>
              ) : null}
              <Link
                href="/profile"
                className="text-xs text-muted hover:text-foreground sm:text-sm"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="text-xs text-muted hover:text-foreground sm:text-sm"
              >
                Sign out
              </button>
            </>
          )}
          <ThemeToggle className="px-2 py-1 text-[10px] sm:text-xs" />
        </div>
      </Container>
    </header>
  );
};
