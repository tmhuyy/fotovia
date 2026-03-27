import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";
import { buttonVariants } from "../../../components/ui/button";
import type { PhotographerDetail } from "../types/photographer-detail.types";

interface PhotographerDetailCtaProps {
  photographer: PhotographerDetail;
}

export const PhotographerDetailCta = ({
  photographer,
}: PhotographerDetailCtaProps) => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Starting at
          </p>
          <p className="text-3xl font-semibold text-foreground">
            ${photographer.startingPrice}
          </p>
          <p className="text-sm text-muted">{photographer.availability}</p>
        </div>
        <Link
          href={`/photographers/${encodeURIComponent(photographer.slug)}/book`}
          className={buttonVariants({ size: "md" })}
        >
          Request booking
        </Link>
        <p className="text-xs text-muted">
          Share a few details to start your booking request.
        </p>
      </CardContent>
    </Card>
  );
};
