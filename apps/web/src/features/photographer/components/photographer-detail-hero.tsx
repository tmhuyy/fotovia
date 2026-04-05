import { Badge } from "../../../components/ui/badge";
import type { PhotographerDetail } from "../types/photographer-detail.types";

interface PhotographerDetailHeroProps
{
  photographer: PhotographerDetail;
}

const getInitials = (name: string) =>
{
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatPrice = (value: number | null) =>
{
  if (value === null) {
    return "Pricing on request";
  }

  return `From $${Math.round(value)}`;
};

export const PhotographerDetailHero = ({
  photographer,
}: PhotographerDetailHeroProps) =>
{
  const hasReviews =
    typeof photographer.rating === "number" &&
    typeof photographer.reviewCount === "number" &&
    photographer.reviewCount > 0;

  return (
    <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-5">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-2xl font-semibold text-foreground">
            {photographer.avatarUrl ? (
              <img
                src={photographer.avatarUrl}
                alt={`${photographer.name} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(photographer.name)
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                {photographer.specialty}
              </p>

              <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
                {photographer.name}
              </h1>

              <p className="text-sm leading-7 text-muted sm:text-base">
                {photographer.location}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              {photographer.experienceYears !== null ? (
                <span>{photographer.experienceYears} yrs experience</span>
              ) : (
                <span>Experience details updating soon</span>
              )}

              <span>•</span>

              <span>
                {hasReviews
                  ? `${photographer.rating?.toFixed(1)} · ${photographer.reviewCount} reviews`
                  : "New public profile"}
              </span>

              <span>•</span>

              <span>{formatPrice(photographer.startingPrice)}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {photographer.styles.map((style) => (
                <Badge key={style} variant="neutral">
                  {style}
                </Badge>
              ))}

              {photographer.tags.map((tag) => (
                <Badge key={tag} variant="accent">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-xl rounded-[1.5rem] border border-border bg-background px-5 py-4">
          <p className="text-sm leading-7 text-muted">{photographer.intro}</p>
        </div>
      </div>
    </div>
  );
};