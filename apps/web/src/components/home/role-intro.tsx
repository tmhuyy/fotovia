import Link from "next/link";
import { Section } from "../common/section";
import { SectionHeading } from "../common/section-heading";
import { Container } from "../layout/container";
import { Card, CardContent } from "../ui/card";

export const RoleIntro = () => {
  return (
    <Section className="pt-0">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Roles"
          title="Two tailored paths into Fotovia"
          description="Whether you are booking a session or growing a photography business, Fotovia keeps the experience calm and curated."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                For clients
              </p>
              <h3 className="font-display text-2xl text-foreground">
                Book photographers with confidence
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Browse curated portfolios, request sessions, and track every
                booking in one place.
              </p>
              <Link
                href="/photographers"
                className="text-sm font-medium text-foreground"
              >
                Browse photographers
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                For photographers
              </p>
              <h3 className="font-display text-2xl text-foreground">
                Join a platform built for your craft
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                Build your portfolio, receive booking requests, and manage
                client communication effortlessly.
              </p>
              <Link
                href="/sign-up?role=photographer"
                className="text-sm font-medium text-foreground"
              >
                Become a photographer
              </Link>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
};
