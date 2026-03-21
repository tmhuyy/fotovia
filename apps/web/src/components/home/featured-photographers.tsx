import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Section } from "../common/section";
import { SectionHeading } from "../common/section-heading";
import { Container } from "../layout/container";

const photographers = [
  {
    name: "Lina Moreno",
    specialty: "Fine Art Portraits",
    location: "Paris · Studio & On Location",
    tag: "Editorial",
  },
  {
    name: "Ethan Park",
    specialty: "Luxury Weddings",
    location: "New York · Destination",
    tag: "Romantic",
  },
  {
    name: "Amara Singh",
    specialty: "Cinematic Storytelling",
    location: "Singapore · Studio",
    tag: "Cinematic",
  },
];

export const FeaturedPhotographers = () => {
  return (
    <Section>
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Featured"
          title="Photographers with a signature point of view"
          description="A curated selection of talent known for refined storytelling, light, and composition."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {photographers.map((photographer) => (
            <Card key={photographer.name} className="overflow-hidden">
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-brand-background to-brand-surface" />
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl text-brand-primary">
                    {photographer.name}
                  </p>
                  <Badge variant="accent">{photographer.tag}</Badge>
                </div>
                <p className="text-sm text-brand-muted">
                  {photographer.specialty}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">
                  {photographer.location}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
};
