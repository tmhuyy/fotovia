"use client";

import { useFormContext } from "react-hook-form";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import
  {
    budgetOptions,
    contactOptions,
    durationOptions,
    sessionTypeOptions,
  } from "../data/booking-options";
import type { BookingRequestFormValues } from "../schemas/booking-request.schema";
import
  {
    BookingSelectField,
    BookingTextField,
    BookingTextareaField,
  } from "./booking-form-fields";

interface BookingRequestFormProps
{
  onSubmit: (values: BookingRequestFormValues) => Promise<void> | void;
  submitError?: string | null;
}

export const BookingRequestForm = ({
  onSubmit,
  submitError,
}: BookingRequestFormProps) =>
{
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<BookingRequestFormValues>();

  return (
    <Card className="border-brand-border bg-brand-surface">
      <CardHeader className="space-y-4 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-muted">
            Booking request
          </p>
          <h2 className="text-2xl font-semibold text-brand-primary">
            Share your session details
          </h2>
          <p className="text-sm leading-6 text-brand-muted">
            This will create a real booking request and send the details to the
            selected photographer.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-background/70 p-4 text-sm text-brand-muted">
          <p className="font-medium text-brand-primary">What happens next</p>
          <p className="mt-2 leading-6">
            The photographer will review your request, confirm availability, and
            continue the conversation from there.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 sm:px-8 sm:pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <BookingSelectField
              name="sessionType"
              label="Session type"
              options={sessionTypeOptions}
              placeholder="Choose the kind of shoot"
            />

            <BookingSelectField
              name="duration"
              label="Session length"
              options={durationOptions}
              placeholder="Choose the duration"
            />

            <BookingTextField
              name="sessionDate"
              label="Preferred date"
              type="date"
              helper="Pick the date you want to book."
            />

            <BookingTextField
              name="sessionTime"
              label="Preferred time"
              type="time"
              helper="Choose the ideal start time."
            />

            <BookingTextField
              name="location"
              label="Location"
              placeholder="Where should the session happen?"
              autoComplete="address-level2"
              helper="Add the city, venue, or area."
            />

            <BookingSelectField
              name="budget"
              label="Budget"
              options={budgetOptions}
              placeholder="Choose your budget range"
            />

            <BookingSelectField
              name="contactPreference"
              label="Preferred contact method"
              options={contactOptions}
              placeholder="How should the photographer reply?"
            />
          </div>

          <BookingTextareaField
            name="concept"
            label="Shoot concept"
            placeholder="Describe the mood, purpose, deliverables, or ideas for the session."
            helper="A little context helps the photographer quote more accurately."
          />

          <BookingTextareaField
            name="inspiration"
            label="Inspiration"
            placeholder="Add inspiration notes or a reference link if you have one."
            helper="Optional"
          />

          <BookingTextareaField
            name="notes"
            label="Extra notes"
            placeholder="Anything else the photographer should know?"
            helper="Optional"
          />

          {submitError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send booking request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};