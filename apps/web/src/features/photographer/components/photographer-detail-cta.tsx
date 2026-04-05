import Link from "next/link";

import { Card, CardContent } from "../../../components/ui/card";
import { buttonVariants } from "../../../components/ui/button";
import type { PhotographerDetail } from "../types/photographer-detail.types";

interface PhotographerDetailCtaProps
{
  photographer: PhotographerDetail;
}

const formatPrice = (value: number | null) =>
{
  if (value === null) {
    return "Pricing on request";
  }

  return `$${Math.round(value)}`;
};

export const PhotographerDetailCta = ({
  photographer,
}: PhotographerDetailCtaProps) =>
{
  return (
    <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            Starting at
          </p>

          <p className="font-serif text-4xl text-foreground">
            {formatPrice(photographer.startingPrice)}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4">
          <p className="text-sm leading-7 text-muted">
            {photographer.availability}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href={`/bookings/new?photographerSlug=${encodeURIComponent(
              photographer.slug,
            )}`}
            className={buttonVariants({
              size: "lg",
            })}
          >
            Request booking
          </Link>

          <p className="text-sm leading-6 text-muted">
            Share a few details to start your booking request.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};