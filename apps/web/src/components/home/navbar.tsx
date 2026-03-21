import Link from "next/link";
import { Container } from "../layout/container";
import { Button } from "../ui/button";

const navLinks = [
  { label: "Photographers", href: "/photographers" },
  { label: "AI Match", href: "/ai" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Portfolio", href: "#portfolio" },
];

export const Navbar = () => {
  return (
    <header className="border-b border-brand-border bg-brand-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl">
          Fotovia
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-brand-muted md:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-brand-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            Explore
          </Button>
          <Button size="sm">Book a Photographer</Button>
        </div>
      </Container>
    </header>
  );
};
