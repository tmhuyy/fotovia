"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import type { PhotographerDetail } from "../../photographer/types/photographer-detail.types";
import {
  bookingRequestSchema,
  type BookingRequestFormValues,
} from "../schemas/booking-request.schema";
import { BookingRequestForm } from "./booking-request-form";
import { BookingSummaryCard } from "./booking-summary-card";
import { BookingSuccess } from "./booking-success";
import { BookingNotFound } from "./booking-not-found";

interface BookingRequestPageProps {
  photographer: PhotographerDetail | null;
}

export const BookingRequestPage = ({
  photographer,
}: BookingRequestPageProps) => {
  const [submittedValues, setSubmittedValues] = useState<
    BookingRequestFormValues | null
  >(null);

  const defaultValues = useMemo<BookingRequestFormValues>(() => {
    return {
      sessionType: "",
      duration: "",
      sessionDate: "",
      sessionTime: "",
      location: photographer?.location ?? "",
      budget: "flexible",
      contactPreference: "email",
      concept: "",
      inspiration: "",
      notes: "",
    };
  }, [photographer]);

  const form = useForm<BookingRequestFormValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = async (values: BookingRequestFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmittedValues(values);
  };

  const handleReset = () => {
    setSubmittedValues(null);
    form.reset(defaultValues);
  };

  if (!photographer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Section className="pt-10">
            <Container>
              <BookingNotFound />
            </Container>
          </Section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Section className="pt-10">
          <Container className="space-y-8">
            <Link
              href={`/photographers/${encodeURIComponent(photographer.slug)}`}
              className="text-xs uppercase tracking-[0.3em] text-muted"
            >
              Back to profile
            </Link>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Booking request
              </p>
              <h1 className="font-display text-3xl text-foreground md:text-4xl">
                Request a session with {photographer.name}.
              </h1>
              <p className="text-sm text-muted md:text-base">
                Share the essentials so the photographer can confirm availability and refine the package.
              </p>
            </div>

            {submittedValues ? (
              <BookingSuccess
                photographer={photographer}
                values={submittedValues}
                onReset={handleReset}
              />
            ) : (
              <FormProvider {...form}>
                <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                  <BookingRequestForm onSubmit={handleSubmit} />
                  <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <BookingSummaryCard photographer={photographer} />
                  </div>
                </div>
              </FormProvider>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
};
