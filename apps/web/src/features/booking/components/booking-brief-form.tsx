"use client";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import {
  budgetOptions,
  contactOptions,
  sessionTypeOptions,
  styleOptions,
} from "../data/booking-options";
import {
  BookingBriefSelectField,
  BookingBriefTextField,
  BookingBriefTextareaField,
} from "./booking-brief-form-fields";

export const BookingBriefForm = () => {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Brief details
        </p>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Add the details that refine your match.
          </h2>
          <p className="text-sm text-muted">
            Build on your quick brief with style and preference notes.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <BookingBriefSelectField
            name="sessionType"
            label="Session type"
            options={sessionTypeOptions}
            placeholder="Select a session type"
          />
          <BookingBriefSelectField
            name="style"
            label="Style preference"
            options={styleOptions}
            placeholder="Select a style"
          />
          <BookingBriefTextField
            name="preferredDate"
            label="Preferred date"
            type="date"
          />
          <BookingBriefTextField
            name="preferredTime"
            label="Preferred time"
            type="time"
          />
          <BookingBriefTextField
            name="location"
            label="Location"
            placeholder="City, venue, or studio"
          />
          <BookingBriefSelectField
            name="budget"
            label="Budget range"
            options={budgetOptions}
            placeholder="Select budget"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <BookingBriefSelectField
            name="contactPreference"
            label="Contact preference"
            options={contactOptions}
            placeholder="Select preference"
          />
          <BookingBriefTextField
            name="inspiration"
            label="Inspiration link (optional)"
            placeholder="Moodboard or reference link"
            type="url"
          />
        </div>

        <BookingBriefTextareaField
          name="description"
          label="Shoot description"
          placeholder="Share the mood, deliverables, and any key details about the shoot."
          helper="Aim for a concise brief so we can match you accurately."
        />

        <BookingBriefTextareaField
          name="notes"
          label="Additional notes"
          placeholder="Anything else we should know?"
        />
      </CardContent>
    </Card>
  );
};
