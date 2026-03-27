import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
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
        <Button type="button" className="w-full" disabled>
          Request booking
        </Button>
        <p className="text-xs text-muted">
          Booking requests open in the next phase.
        </p>
      </CardContent>
    </Card>
  );
};
