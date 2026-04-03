"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Section } from "../common/section";
import { SectionHeading } from "../common/section-heading";
import { Container } from "../layout/container";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Button, buttonVariants } from "../ui/button";
import { budgetOptions, sessionTypeOptions } from "../../features/booking/data/booking-options";

interface BookingEntryFormState {
  sessionType: string;
  location: string;
  date: string;
  budget: string;
}

export const BookingEntrySection = () => {
  const router = useRouter();
  const [formState, setFormState] = useState<BookingEntryFormState>({
    sessionType: "",
    location: "",
    date: "",
    budget: "",
  });

  const handleChange = (field: keyof BookingEntryFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (formState.sessionType) params.set("sessionType", formState.sessionType);
    if (formState.location) params.set("location", formState.location);
    if (formState.date) params.set("date", formState.date);
    if (formState.budget) params.set("budget", formState.budget);

    const query = params.toString();
    router.push(query ? `/bookings/new?${query}` : "/bookings/new");
  };

  return (
    <Section className="pt-0">
      <Container className="space-y-8">
        <SectionHeading
          eyebrow="Guided booking · Step 1"
          title="Start your booking brief in under a minute."
          description="Share the essentials now, then continue your full brief on the next step."
        />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="booking-session-type">What are you booking?</Label>
                    <Select
                      id="booking-session-type"
                      value={formState.sessionType}
                      onChange={(event) => handleChange("sessionType", event.target.value)}
                    >
                      <option value="" disabled>
                        Select a session type
                      </option>
                      {sessionTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-location">Location</Label>
                    <Input
                      id="booking-location"
                      placeholder="City, venue, or studio"
                      value={formState.location}
                      onChange={(event) => handleChange("location", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-date">Preferred date</Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={formState.date}
                      onChange={(event) => handleChange("date", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-budget">Budget</Label>
                    <Select
                      id="booking-budget"
                      value={formState.budget}
                      onChange={(event) => handleChange("budget", event.target.value)}
                    >
                      <option value="" disabled>
                        Select budget
                      </option>
                      {budgetOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted">
                    We will refine details and match you with the right photographers.
                  </p>
                  <Button type="submit" size="sm">
                    Continue your booking brief
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Guided path · Step 1
              </p>
              <h3 className="font-display text-2xl text-foreground">
                Let Fotovia curate the shortlist.
              </h3>
              <p className="text-sm text-muted">
                We will use your brief to surface photographers whose style and availability align with your moment.
              </p>
              <ul className="space-y-2 text-sm text-muted">
                <li>Step 1: Share the shoot type, timing, and location.</li>
                <li>Step 2: Expand the brief and refine preferences.</li>
                <li>Then: Review curated photographers before requesting.</li>
              </ul>
              <Link
                href="/photographers"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Prefer to browse first
              </Link>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
};
