import Link from "next/link";

import { buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import
  {
    budgetOptions,
    durationOptions,
    sessionTypeOptions,
  } from "../data/booking-options";
import type { BookingRequestRecord } from "../types/booking.types";

interface BookingSuccessProps
{
  booking: BookingRequestRecord;
  onReset: () => void;
}

const resolveLabel = (
  value: string,
  options: { value: string; label: string }[],
): string =>
{
  return options.find((option) => option.value === value)?.label ?? value;
};

const formatCreatedAt = (value: string): string =>
{
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

export const BookingSuccess = ({
  booking,
  onReset,
}: BookingSuccessProps) =>
{
  return (
    <Card className="border-brand-border bg-brand-surface">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="inline-flex rounded-full border border-brand-border bg-brand-background px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-muted">
          Request sent
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-primary">
            Booking request received
          </h2>
          <p className="max-w-2xl text-base text-brand-muted">
            {booking.photographerName} will review your request and
            respond with availability.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-background/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-muted">
            Reference
          </p>
          <p className="mt-2 text-lg font-semibold text-brand-primary">
            #{booking.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-2 text-sm text-brand-muted">
            Status:{" "}
            <span className="font-medium capitalize text-brand-primary">
              {booking.status}
            </span>
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Submitted {formatCreatedAt(booking.createdAt)}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand-muted">
            Summary
          </p>

          <div className="grid gap-3 rounded-2xl border border-brand-border p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                Session type
              </p>
              <p className="mt-2 text-sm text-brand-primary">
                {resolveLabel(
                  booking.sessionType,
                  sessionTypeOptions,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                Date & time
              </p>
              <p className="mt-2 text-sm text-brand-primary">
                {booking.sessionDate} · {booking.sessionTime}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                Duration
              </p>
              <p className="mt-2 text-sm text-brand-primary">
                {resolveLabel(
                  booking.duration,
                  durationOptions,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                Budget
              </p>
              <p className="mt-2 text-sm text-brand-primary">
                {resolveLabel(booking.budget, budgetOptions)}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                Location
              </p>
              <p className="mt-2 text-sm text-brand-primary">
                {booking.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/my-bookings"
            className={buttonVariants({
              variant: "secondary",
              size: "md",
            })}
          >
            View my bookings
          </Link>

          <Link
            href={`/photographers/${booking.photographerSlug}`}
            className={buttonVariants({
              variant: "secondary",
              size: "md",
            })}
          >
            Back to photographer
          </Link>

          <button
            type="button"
            onClick={onReset}
            className={buttonVariants({
              variant: "primary",
              size: "md",
            })}
          >
            Send another request
          </button>
        </div>
      </CardContent>
    </Card>
  );
};