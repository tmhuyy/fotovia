import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";
import { buttonVariants } from "../../../components/ui/button";

export const BookingNotFound = () => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Booking
          </p>
          <h2 className="font-display text-2xl text-foreground">
            Photographer unavailable
          </h2>
          <p className="text-sm text-muted">
            We could not find this photographer to start a booking request.
          </p>
        </div>
        <Link href="/photographers" className={buttonVariants({ size: "sm" })}>
          Browse photographers
        </Link>
      </CardContent>
    </Card>
  );
};
