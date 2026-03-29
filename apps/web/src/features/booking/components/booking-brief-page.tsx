"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
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
  const [submittedValues, setSubmittedValues] = useState<
    BookingBriefFormValues | null
  >(null);

  const defaultValues = useMemo<BookingBriefFormValues>(() => {
    return {
      sessionType: prefill?.sessionType ?? "",
      preferredDate: prefill?.date ?? "",
      preferredTime: "",
      location: prefill?.location ?? "",
      budget: prefill?.budget ?? "",
      style: "",
      description: "",
      contactPreference: "email",
      inspiration: "",
      notes: "",
    };
  }, [prefill]);

  const form = useForm<BookingBriefFormValues>({
    resolver: zodResolver(bookingBriefSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = async (values: BookingBriefFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmittedValues(values);
  };

  const handleReset = () => {
    setSubmittedValues(null);
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
                Guided booking brief
              </p>
              <h1 className="font-display text-3xl text-foreground md:text-4xl">
                Tell us what you need and we will match you.
              </h1>
              <p className="text-sm text-muted md:text-base">
                Share the essentials so Fotovia can recommend photographers who align with your style, timing, and budget.
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
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="grid gap-8 lg:grid-cols-[2fr_1fr]"
                >
                  <BookingBriefForm />
                  <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <BookingBriefSummaryCard />
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
