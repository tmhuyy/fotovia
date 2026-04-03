import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Section } from "../common/section";
import { SectionHeading } from "../common/section-heading";
import { Container } from "../layout/container";
import { mockPhotographers } from "../../features/photographer/data/mock-photographers";

const featuredPhotographers = [...mockPhotographers]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3);

export const FeaturedPhotographers = () => {
  return (
    <Section>
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Featured"
          title="Photographers with a signature point of view"
          description="A curated selection of talent known for refined storytelling, light, and composition."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPhotographers.map((photographer) => (
            <Card key={photographer.id} className="overflow-hidden">
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-background to-surface">
                <div className="h-full w-full border-b border-border bg-background/40" />
              </div>
              <CardContent className="space-y-4 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-foreground">
                      {photographer.name}
                    </p>
                    <p className="text-sm text-muted">
                      {photographer.specialty}
                    </p>
                  </div>
                  <Badge variant="accent">
                    {photographer.tags[0] ?? photographer.styles[0]}
                  </Badge>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {photographer.location}
                </p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>
                    {photographer.rating.toFixed(1)} rating · {photographer.reviewCount} reviews
                  </span>
                  <span>From ${photographer.startingPrice}</span>
                </div>
                <Link
                  href={`/photographers/${encodeURIComponent(photographer.slug)}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  View profile
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
};
