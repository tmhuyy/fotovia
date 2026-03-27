import Link from "next/link";
import { Section } from "../common/section";
import { Container } from "../layout/container";
import { buttonVariants } from "../ui/button";

export const CtaSection = () => {
  return (
    <Section>
      <Container>
        <div className="rounded-3xl bg-foreground px-8 py-12 text-background md:px-14 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">
                Start Booking
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                Find a photographer who feels like the perfect fit.
              </h2>
              <p className="text-sm text-background/80 md:text-base">
                Explore curated talent, upload inspiration, and send booking
                requests in minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Link
                href="/photographers"
                className={`${buttonVariants({ size: "lg" })} bg-surface text-foreground`}
              >
                Explore photographers
              </Link>
              <Link
                href="/bookings/new"
                className={buttonVariants({ size: "lg", variant: "secondary" })}
              >
                Start booking request
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
