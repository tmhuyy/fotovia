"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import { budgetOptions, sessionTypeOptions } from "../data/booking-options";
import {
  bookingBriefSchema,
  type BookingBriefFormValues,
} from "../schemas/booking-brief.schema";
import { BookingBriefForm } from "./booking-brief-form";
import { BookingBriefSummaryCard } from "./booking-brief-summary-card";
import { BookingBriefSuccess } from "./booking-brief-success";

interface BookingBriefPrefill {
  sessionType?: string;
  location?: string;
  date?: string;
  budget?: string;
}

interface BookingBriefPageProps {
  prefill?: BookingBriefPrefill;
}

export const BookingBriefPage = ({ prefill }: BookingBriefPageProps) => {
  const searchParams = useSearchParams();
  const [submittedValues, setSubmittedValues] = useState<
    BookingBriefFormValues | null
  >(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resolvedPrefill = useMemo<BookingBriefPrefill>(() => {
    const getValue = (key: keyof BookingBriefPrefill) => {
      const fromQuery = searchParams?.get(key);
      if (fromQuery && fromQuery.trim() !== "") {
        return fromQuery;
      }
      return prefill?.[key];
    };

    return {
      sessionType: getValue("sessionType"),
      location: getValue("location"),
      date: getValue("date"),
      budget: getValue("budget"),
    };
  }, [prefill, searchParams]);

  const defaultValues = useMemo<BookingBriefFormValues>(() => {
    return {
      sessionType: resolvedPrefill.sessionType ?? "",
      preferredDate: resolvedPrefill.date ?? "",
      preferredTime: "",
      location: resolvedPrefill.location ?? "",
      budget: resolvedPrefill.budget ?? "",
      style: "",
      description: "",
      contactPreference: "email",
      inspiration: "",
      notes: "",
    };
  }, [resolvedPrefill]);

  const prefilledItems = useMemo(() => {
    const items: string[] = [];

    if (resolvedPrefill.sessionType) {
      const label =
        sessionTypeOptions.find(
          (option) => option.value === resolvedPrefill.sessionType
        )?.label ?? resolvedPrefill.sessionType;
      items.push(`Session type: ${label}`);
    }

    if (resolvedPrefill.location) {
      items.push(`Location: ${resolvedPrefill.location}`);
    }

    if (resolvedPrefill.date) {
      items.push(`Preferred date: ${resolvedPrefill.date}`);
    }

    if (resolvedPrefill.budget) {
      const label =
        budgetOptions.find((option) => option.value === resolvedPrefill.budget)
          ?.label ?? resolvedPrefill.budget;
      items.push(`Budget: ${label}`);
    }

    return items;
  }, [resolvedPrefill]);

  const form = useForm<BookingBriefFormValues>({
    resolver: zodResolver(bookingBriefSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = async (values: BookingBriefFormValues) => {
    setSubmitError(null);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmittedValues(values);
  };

  const handleInvalid = (errors: FieldErrors<BookingBriefFormValues>) => {
    setSubmitError("Please complete the highlighted fields to continue.");
    const firstErrorKey = Object.keys(errors)[0] as
      | keyof BookingBriefFormValues
      | undefined;
    if (firstErrorKey) {
      form.setFocus(firstErrorKey);
    }
  };

  const handleReset = () => {
    setSubmittedValues(null);
    setSubmitError(null);
    form.reset(defaultValues);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Section className="pt-10">
          <Container className="space-y-8">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.3em] text-muted"
            >
              Back to homepage
            </Link>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Guided booking · Step 2 of 2
              </p>
              <h1 className="font-display text-3xl text-foreground md:text-4xl">
                Continue your booking brief.
              </h1>
              <p className="text-sm text-muted md:text-base">
                We kept your quick brief from Step 1. Add a few more details so Fotovia can recommend the best matches.
              </p>
              <p className="text-xs text-muted">
                Already chosen a photographer? Start a direct request from their profile.
              </p>
            </div>

            {submittedValues ? (
              <BookingBriefSuccess values={submittedValues} onReset={handleReset} />
            ) : (
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
                  className="grid gap-8 lg:grid-cols-[2fr_1fr]"
                >
                  <div className="space-y-6">
                    {prefilledItems.length ? (
                      <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted">
                          Prefilled from Step 1
                        </p>
                        <ul className="mt-2 space-y-1">
                          {prefilledItems.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <BookingBriefForm />
                  </div>
                  <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <BookingBriefSummaryCard errorMessage={submitError} />
                  </div>
                </form>
              </FormProvider>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
};
