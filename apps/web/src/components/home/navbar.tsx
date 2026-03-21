import Link from "next/link";
import { Container } from "../layout/container";
import { buttonVariants } from "../ui/button";
import { ThemeToggle } from "../common/theme-toggle";

const navLinks = [
  { label: "Photographers", href: "/photographers" },
  { label: "AI Match", href: "/ai" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Portfolio", href: "#portfolio" },
];

export const Navbar = () => {
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
          <ThemeToggle className="px-2 py-1 text-[10px] sm:text-xs" />
        </div>
      </Container>
    </header>
  );
};
