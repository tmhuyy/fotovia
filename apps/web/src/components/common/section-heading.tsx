import { cn } from "../../lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) => {
  return (
    <div className={cn("max-w-2xl space-y-4", className)}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.3em] text-brand-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl text-brand-primary md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-brand-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
};
