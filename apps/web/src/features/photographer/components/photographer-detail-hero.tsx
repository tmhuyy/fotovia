import { Badge } from "../../../components/ui/badge";
import type { PhotographerDetail } from "../types/photographer-detail.types";

interface PhotographerDetailHeroProps {
  photographer: PhotographerDetail;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const PhotographerDetailHero = ({
  photographer,
}: PhotographerDetailHeroProps) => {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-surface" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
            {getInitials(photographer.name)}
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              {photographer.specialty}
            </p>
            <h1 className="font-display text-3xl text-foreground md:text-4xl">
              {photographer.name}
            </h1>
            <p className="text-sm text-muted">{photographer.location}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge variant="neutral">
            {photographer.experienceYears} yrs experience
          </Badge>
          <Badge variant="accent">
            {photographer.rating.toFixed(1)} · {photographer.reviewCount} reviews
          </Badge>
          <Badge variant="neutral">From ${photographer.startingPrice}</Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {photographer.styles.map((style) => (
          <span
            key={style}
            className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted"
          >
            {style}
          </span>
        ))}
        {photographer.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted md:text-base">
        {photographer.intro}
      </p>
    </div>
  );
};
