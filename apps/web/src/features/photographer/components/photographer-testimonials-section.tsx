import type { PhotographerDetail } from "../types/photographer-detail.types";
import { PhotographerDetailSection } from "./photographer-detail-section";

interface PhotographerTestimonialsSectionProps {
  photographer: PhotographerDetail;
}

export const PhotographerTestimonialsSection = ({
  photographer,
}: PhotographerTestimonialsSectionProps) => {
  if (!photographer.testimonials.length) return null;

  return (
    <PhotographerDetailSection
      title="Client notes"
      description="Highlights from recent collaborations."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {photographer.testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="rounded-2xl border border-border bg-background p-4"
          >
            <p className="text-sm text-foreground">“{testimonial.quote}”</p>
            <p className="mt-3 text-xs text-muted">
              {testimonial.name} · {testimonial.context}
            </p>
          </div>
        ))}
      </div>
    </PhotographerDetailSection>
  );
};
