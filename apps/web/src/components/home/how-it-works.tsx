import { Section } from "../common/section";
import { SectionHeading } from "../common/section-heading";
import { Container } from "../layout/container";

const steps = [
  {
    title: "Explore photographers",
    description:
      "Browse curated portfolios and filter by specialty, location, and style.",
  },
  {
    title: "Upload inspiration",
    description:
      "Share a reference image so Fotovia can classify the visual style you love.",
  },
  {
    title: "Book with confidence",
    description:
      "Send a booking request and manage details in a streamlined dashboard.",
  },
];

export const HowItWorks = () => {
  return (
    <Section id="how-it-works">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Process"
          title="A calm, guided booking experience"
          description="From discovery to confirmation, every step is designed for clarity and ease."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-brand-muted">
                Step {index + 1}
              </p>
              <h3 className="mt-4 font-display text-xl text-brand-primary">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
