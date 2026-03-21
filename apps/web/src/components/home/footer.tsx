import Link from "next/link";
import { Container } from "../layout/container";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Photographers", href: "/photographers" },
  { label: "AI Match", href: "/ai" },
  { label: "Bookings", href: "/bookings" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-brand-border bg-brand-surface">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-display text-lg text-brand-primary">Fotovia</p>
          <p className="text-sm text-brand-muted">
            Premium photography booking with AI-assisted style matching.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-brand-muted">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-brand-primary">
              {link.label}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
};
