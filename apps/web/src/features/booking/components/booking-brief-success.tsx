import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";
import { buttonVariants } from "../../../components/ui/button";
import {
  budgetOptions,
  sessionTypeOptions,
  styleOptions,
} from "../data/booking-options";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";

interface BookingBriefSuccessProps {
  values: BookingBriefFormValues;
  onReset: () => void;
}

const resolveLabel = (value: string, options: { value: string; label: string }[]) => {
  return options.find((option) => option.value === value)?.label ?? value;
};

export const BookingBriefSuccess = ({
  values,
  onReset,
}: BookingBriefSuccessProps) => {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Brief submitted
          </p>
          <h2 className="font-display text-2xl text-foreground">
            Your booking brief is ready.
          </h2>
          <p className="text-sm text-muted">
            Next, you will review photographers who match this brief. Recommendations will appear in the next phase.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
          <p className="font-medium text-foreground">Brief summary</p>
          <div className="mt-3 space-y-2 text-muted">
            <p>Session type: {resolveLabel(values.sessionType, sessionTypeOptions)}</p>
            <p>Style: {resolveLabel(values.style, styleOptions)}</p>
            <p>Date: {values.preferredDate} · {values.preferredTime}</p>
            <p>Location: {values.location}</p>
            <p>Budget: {resolveLabel(values.budget, budgetOptions)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/photographers"
            className={buttonVariants({ size: "sm" })}
          >
            View matching photographers
          </Link>
          <button
            type="button"
            onClick={onReset}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Edit brief
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
