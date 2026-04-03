import { Section } from "../common/section";
import { SectionHeading } from "../common/section-heading";
import { Container } from "../layout/container";

const tiles = [
  "Modern studio editorial",
  "Sunlit bridal portraits",
  "Architectural interiors",
  "Cinematic night scenes",
  "Food styling detail",
  "Coastal lifestyle",
];

export const PortfolioShowcase = () => {
  return (
    <Section id="portfolio">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Portfolio"
          title="A visual-first marketplace"
          description="Preview real portfolios to understand light, composition, and creative point of view."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((label, index) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface shadow-sm"
            >
              <div className="aspect-[4/5] bg-gradient-to-br from-background to-surface" />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/70 via-foreground/0 to-transparent p-4">
                <p className="text-sm font-medium text-background">
                  {label}
                </p>
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-surface/80 px-3 py-1 text-xs text-foreground">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
