import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";
import { buttonVariants } from "../../../components/ui/button";
import type { PhotographerDetail } from "../../photographer/types/photographer-detail.types";
import {
  budgetOptions,
  durationOptions,
  sessionTypeOptions,
} from "../data/booking-options";
import type { BookingRequestFormValues } from "../schemas/booking-request.schema";

interface BookingSuccessProps {
  photographer: PhotographerDetail;
  values: BookingRequestFormValues;
  onReset: () => void;
}

const resolveLabel = (value: string, options: { value: string; label: string }[]) => {
  return options.find((option) => option.value === value)?.label ?? value;
};

export const BookingSuccess = ({
  photographer,
  values,
  onReset,
}: BookingSuccessProps) => {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Request sent
          </p>
          <h2 className="font-display text-2xl text-foreground">
            Booking request received
          </h2>
          <p className="text-sm text-muted">
            {photographer.name} will review your request and respond with availability.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
          <p className="font-medium text-foreground">Summary</p>
          <div className="mt-3 space-y-2 text-muted">
            <p>Session type: {resolveLabel(values.sessionType, sessionTypeOptions)}</p>
            <p>Date: {values.sessionDate} · {values.sessionTime}</p>
            <p>Duration: {resolveLabel(values.duration, durationOptions)}</p>
            <p>Budget: {resolveLabel(values.budget, budgetOptions)}</p>
            <p>Location: {values.location}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/photographers/${encodeURIComponent(photographer.slug)}`}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Back to profile
          </Link>
          <Link
            href="/photographers"
            className={buttonVariants({ size: "sm" })}
          >
            Explore more photographers
          </Link>
          <button
            type="button"
            onClick={onReset}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Send another request
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
