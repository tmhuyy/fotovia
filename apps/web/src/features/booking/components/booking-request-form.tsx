"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import {
  budgetOptions,
  contactOptions,
  durationOptions,
  sessionTypeOptions,
} from "../data/booking-options";
import type { BookingRequestFormValues } from "../schemas/booking-request.schema";
import {
  BookingSelectField,
  BookingTextField,
  BookingTextareaField,
} from "./booking-form-fields";

interface BookingRequestFormProps {
  onSubmit: (values: BookingRequestFormValues) => Promise<void> | void;
}

export const BookingRequestForm = ({ onSubmit }: BookingRequestFormProps) => {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<BookingRequestFormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Booking request
          </p>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Share your session details
            </h2>
            <p className="text-sm text-muted">
              We will send these details to the photographer so they can confirm availability.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <BookingSelectField
              name="sessionType"
              label="Session type"
              options={sessionTypeOptions}
              placeholder="Select a session type"
            />
            <BookingSelectField
              name="duration"
              label="Session length"
              options={durationOptions}
              placeholder="Select duration"
            />
            <BookingTextField
              name="sessionDate"
              label="Preferred date"
              type="date"
            />
            <BookingTextField
              name="sessionTime"
              label="Preferred time"
              type="time"
            />
            <BookingTextField
              name="location"
              label="Location"
              placeholder="City, studio, or venue"
            />
            <BookingSelectField
              name="budget"
              label="Budget range"
              options={budgetOptions}
              placeholder="Select budget"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <BookingSelectField
              name="contactPreference"
              label="Contact preference"
              options={contactOptions}
            />
            <BookingTextField
              name="inspiration"
              label="Inspiration link (optional)"
              placeholder="Moodboard or reference link"
              type="url"
            />
          </div>

          <BookingTextareaField
            name="concept"
            label="Session concept"
            placeholder="Describe the mood, styling, and deliverables you're hoping for."
            helper="Aim for a short, specific overview."
          />

          <BookingTextareaField
            name="notes"
            label="Additional notes"
            placeholder="Share any additional details or constraints."
          />

          <div className="rounded-2xl border border-border bg-background px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              What happens next
            </p>
            <p className="mt-2 text-sm text-muted">
              The photographer will review your request and reply with availability and package details.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">
              Requests are stored locally until booking APIs are live.
            </p>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send booking request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
