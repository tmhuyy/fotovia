import Link from "next/link";

import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import type { PhotographerProfile } from "../types/photographer.types";

interface PhotographerCardProps
{
  photographer: PhotographerProfile;
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

const formatStartingPrice = (value: number | null) =>
{
  if (value === null) {
    return "Pricing on request";
  }

  return `From $${Math.round(value)}`;
};

export const PhotographerCard = ({ photographer }: PhotographerCardProps) =>
{
  const hasReviews =
    typeof photographer.rating === "number" &&
    typeof photographer.reviewCount === "number" &&
    photographer.reviewCount > 0;

  return (
    <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-semibold text-foreground">
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

          <div className="min-w-0 space-y-2">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl text-foreground">
                {photographer.name}
              </h2>

              <p className="text-sm font-medium text-foreground">
                {photographer.specialty}
              </p>

              <p className="text-sm text-muted">{photographer.location}</p>
            </div>
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-7 text-muted">
          {photographer.bio}
        </p>

        <div className="flex flex-wrap gap-2">
          {photographer.styles.slice(0, 3).map((style) => (
            <Badge key={style} variant="neutral">
              {style}
            </Badge>
          ))}

          {photographer.tags.slice(0, 1).map((tag) => (
            <Badge key={tag} variant="accent">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4">
          <div className="space-y-1 text-sm text-muted">
            <p>
              {hasReviews
                ? `${photographer.rating?.toFixed(1)} rating · ${photographer.reviewCount} reviews`
                : "New public profile on Fotovia"}
            </p>

            <p className="font-medium text-foreground">
              {formatStartingPrice(photographer.startingPrice)}
            </p>
          </div>

          <Link
            href={`/photographers/${encodeURIComponent(photographer.slug)}`}
            className={buttonVariants({
              size: "sm",
            })}
          >
            View profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};