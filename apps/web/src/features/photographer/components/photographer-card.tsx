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
    .map((part) => part.charAt(0))
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

  const visibleStyleChips = (
    photographer.discoveryStyles.length
      ? photographer.discoveryStyles
      : photographer.styles
  ).slice(0, 3);

  return (
    <Card className="overflow-hidden rounded-[2rem] border-border bg-surface shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start gap-4">
          {photographer.avatarUrl ? (
            <img
              src={photographer.avatarUrl}
              alt={photographer.name}
              className="h-16 w-16 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-lg font-medium text-foreground">
              {getInitials(photographer.name)}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              {photographer.primaryDiscoveryStyle ? (
                <Badge variant="ai">
                  AI style · {photographer.primaryDiscoveryStyle}
                </Badge>
              ) : null}

              {photographer.hasFeaturedWork ? (
                <Badge variant="accent">Featured work</Badge>
              ) : null}
            </div>

            <div>
              <h3 className="font-serif text-2xl text-foreground">
                {photographer.name}
              </h3>

              <p className="text-sm text-muted">
                {photographer.specialty}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            Location
          </p>

          <p className="text-sm text-foreground">{photographer.location}</p>
        </div>

        <p className="text-sm leading-7 text-muted">{photographer.bio}</p>

        {visibleStyleChips.length ? (
          <div className="flex flex-wrap gap-2">
            {visibleStyleChips.map((style) => (
              <Badge key={style} variant="neutral">
                {style}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            Discovery signal
          </p>

          <p className="mt-2 text-sm text-foreground">
            {photographer.classifiedPortfolioCount > 0
              ? `${photographer.classifiedPortfolioCount} AI-classified work${photographer.classifiedPortfolioCount === 1 ? "" : "s"} across ${photographer.portfolioItemCount} saved portfolio item${photographer.portfolioItemCount === 1 ? "" : "s"}.`
              : photographer.portfolioItemCount > 0
                ? `${photographer.portfolioItemCount} saved portfolio item${photographer.portfolioItemCount === 1 ? "" : "s"} ready for discovery.`
                : "Portfolio discovery data is still growing for this profile."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <p className="text-muted">
            {hasReviews
              ? `${photographer.rating?.toFixed(1)} rating · ${photographer.reviewCount} reviews`
              : "New public profile on Fotovia"}
          </p>

          <p className="font-medium text-foreground">
            {formatStartingPrice(photographer.startingPrice)}
          </p>
        </div>

        <Link
          href={`/photographers/${photographer.slug}`}
          className={buttonVariants({
            size: "lg",
            className: "w-full rounded-full",
          })}
        >
          View profile
        </Link>
      </CardContent>
    </Card>
  );
};