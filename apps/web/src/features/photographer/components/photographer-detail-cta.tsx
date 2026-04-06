import Link from "next/link";

import { buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
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
  const bookingHref = `/bookings/new?photographerSlug=${encodeURIComponent(
    photographer.slug,
  )}`;

  return (
    <Card className="border-brand-border bg-brand-surface">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
            Starting at
          </p>
          <p className="text-2xl font-semibold text-brand-primary">
            {formatPrice(photographer.startingPrice)}
          </p>
          <p className="text-sm text-brand-muted">{photographer.availability}</p>
        </div>

        <Link
          href={bookingHref}
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          Request booking
        </Link>

        <p className="text-sm leading-6 text-brand-muted">
          Share a few details to start your real booking request with this
          photographer.
        </p>
      </CardContent>
    </Card>
  );
};