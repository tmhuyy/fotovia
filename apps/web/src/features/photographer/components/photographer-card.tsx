import Link from "next/link";

import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import type { PhotographerProfile } from "../types/photographer.types";

interface PhotographerCardProps {
  photographer: PhotographerProfile;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const formatStartingPrice = (value: number | null) => {
  if (value === null) {
    return "Pricing on request";
  }

  return `From ${new Intl.NumberFormat("vi-VN").format(value)} VND`;
};

const normalizeStyleLabel = (value: string | null | undefined) =>
{
  if (!value?.trim()) return "Portfolio";

  return value
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const PhotographerCard = ({ photographer }: PhotographerCardProps) =>
{
  const visibleStyleChips = (
    photographer.discoveryStyles.length
      ? photographer.discoveryStyles
      : photographer.styles
  ).slice(0, 3);

  const primaryStyle = normalizeStyleLabel(
    photographer.primaryDiscoveryStyle ||
    visibleStyleChips[0] ||
    photographer.specialty,
  );

  const heroImageUrl = photographer.avatarUrl;
  const hasPortfolioWork = photographer.portfolioItemCount > 0;

  return (
    <Card className="overflow-hidden rounded-[2rem] border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(23,23,23,0.1)]">
      <CardContent className="space-y-5 p-5">
        <div className="relative h-72 overflow-hidden rounded-[1.75rem] border border-border bg-background">
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt={`${photographer.name} portfolio preview`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(214,187,145,0.5),transparent_32%),radial-gradient(circle_at_80%_30%,rgba(237,229,255,0.85),transparent_36%)] text-5xl font-semibold text-foreground">
              {getInitials(photographer.name)}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-surface/90 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur">
              {hasPortfolioWork ? "Latest work" : "Profile"}
            </span>

            <span className="rounded-full bg-foreground/55 px-4 py-2 text-sm font-semibold text-background shadow-sm backdrop-blur">
              {photographer.portfolioItemCount} public work
              {photographer.portfolioItemCount === 1 ? "" : "s"}
            </span>
          </div>

          {heroImageUrl ? (
            <div className="absolute right-4 top-4 h-20 w-20 overflow-hidden rounded-2xl border-2 border-surface shadow-md">
              <img
                src={heroImageUrl}
                alt={`${photographer.name} thumbnail`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-xs uppercase tracking-[0.32em] text-background/75">
              Style signal
            </p>

            <h3 className="mt-2 font-serif text-4xl leading-none text-background">
              {primaryStyle}
            </h3>
          </div>
        </div>

        <div className="space-y-4 px-1">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              {photographer.location}
            </p>

            <h2 className="mt-3 font-serif text-4xl leading-none text-foreground">
              {photographer.name}
            </h2>
          </div>

          <p className="line-clamp-4 text-base leading-8 text-muted">
            {photographer.bio}
          </p>

          {visibleStyleChips.length ? (
            <div className="flex flex-wrap gap-2">
              {visibleStyleChips.map((style) => (
                <Badge
                  key={style}
                  variant={
                    style === photographer.primaryDiscoveryStyle
                      ? "ai"
                      : "neutral"
                  }
                  className="px-4 py-2 text-sm"
                >
                  {normalizeStyleLabel(style)}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 rounded-[1.5rem] border border-border bg-background px-4 py-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted">Portfolio</p>
              <p className="mt-1 font-semibold text-foreground">
                {photographer.portfolioItemCount} public work
                {photographer.portfolioItemCount === 1 ? "" : "s"}
              </p>
            </div>

            <div>
              <p className="text-muted">AI-ready</p>
              <p className="mt-1 font-semibold text-foreground">
                {photographer.classifiedPortfolioCount} classified
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="text-muted">
              {photographer.reviewCount && photographer.rating
                ? `${photographer.rating.toFixed(1)} rating · ${photographer.reviewCount} reviews`
                : "New public profile"}
            </p>

            <p className="font-semibold text-foreground">
              {formatStartingPrice(photographer.startingPrice)}
            </p>
          </div>

          <Link
            href={`/photographers/${photographer.slug}`}
            className={buttonVariants({
              size: "lg",
              className:
                "w-full cursor-pointer rounded-2xl py-6 text-base font-semibold",
            })}
          >
            View portfolio
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
