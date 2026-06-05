import Link from "next/link";

import { buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import
  {
    budgetOptions,
    contactOptions,
    sessionTypeOptions,
    styleOptions,
  } from "../data/booking-options";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";

interface BookingBriefSuccessProps
{
  values: BookingBriefFormValues;
  onReset: () => void;
}

const resolveLabel = (
  value: string | undefined,
  options: { value: string; label: string }[],
) =>
{
  if (!value) {
    return "";
  }

  return options.find((option) => option.value === value)?.label ?? value;
};

export const BookingBriefSuccess = ({
  values,
  onReset,
}: BookingBriefSuccessProps) =>
{
  const sessionLabel = resolveLabel(values.sessionType, sessionTypeOptions);
  const styleLabel = resolveLabel(values.style, styleOptions);
  const budgetLabel = resolveLabel(values.budget, budgetOptions);
  const contactLabel = resolveLabel(values.contactPreference, contactOptions);

  return (
    <Card className="rounded-[1.75rem]">
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Booking request sent
          </p>

          <h2 className="font-serif text-3xl text-foreground">
            Your booking brief is ready.
          </h2>

          <p className="text-sm leading-6 text-muted">
            Next, Fotovia can use this brief to help you compare
            photographers who match the requested style and location.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-4 text-sm">
          <p className="font-semibold text-foreground">Brief summary</p>

          <div className="mt-3 space-y-2 text-muted">
            <p>Type: {sessionLabel}</p>
            <p>Style: {styleLabel}</p>
            <p>
              Date: {values.preferredDate}
              {values.preferredTime
                ? ` · ${values.preferredTime}`
                : " · Flexible time"}
            </p>
            <p>Location: {values.location}</p>
            <p>Budget: {budgetLabel}</p>
            <p>Contact: {contactLabel}</p>
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
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
            })}
          >
            Edit brief
          </button>
        </div>
      </CardContent>
    </Card>
  );
};