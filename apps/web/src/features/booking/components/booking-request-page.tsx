"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Section } from "../../../components/common/section";
import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Card, CardContent } from "../../../components/ui/card";
import { bookingService } from "../../../services/booking.service";
import type { PhotographerDetail } from "../../photographer/types/photographer-detail.types";
import
{
  bookingRequestSchema,
  type BookingRequestFormValues,
} from "../schemas/booking-request.schema";
import type { BookingRequestRecord } from "../types/booking.types";
import { BookingNotFound } from "./booking-not-found";
import { BookingRequestForm } from "./booking-request-form";
import { BookingSuccess } from "./booking-success";
import { BookingSummaryCard } from "./booking-summary-card";

interface BookingRequestPageProps
{
  photographer: PhotographerDetail | null;
  isLoading?: boolean;
  prefill?: Partial<
    Pick<
      BookingRequestFormValues,
      "sessionType" | "sessionDate" | "location" | "budget"
    >
  >;
}

const BookingRequestPageSkeleton = () =>
{
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-background">
        <Section className="pt-10 pb-16 sm:pt-14">
          <Container className="space-y-8">
            <div className="space-y-3">
              <div className="h-4 w-28 animate-pulse rounded-full bg-brand-border" />
              <div className="h-10 w-full max-w-xl animate-pulse rounded-2xl bg-brand-border" />
              <div className="h-5 w-full max-w-2xl animate-pulse rounded-xl bg-brand-border" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="border-brand-border bg-brand-surface">
                <CardContent className="space-y-4 p-6 sm:p-8">
                  <div className="h-6 w-40 animate-pulse rounded-xl bg-brand-border" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-24 animate-pulse rounded-2xl bg-brand-background" />
                    <div className="h-24 animate-pulse rounded-2xl bg-brand-background" />
                    <div className="h-24 animate-pulse rounded-2xl bg-brand-background" />
                    <div className="h-24 animate-pulse rounded-2xl bg-brand-background" />
                  </div>
                  <div className="h-32 animate-pulse rounded-2xl bg-brand-background" />
                  <div className="h-12 w-48 animate-pulse rounded-full bg-brand-border" />
                </CardContent>
              </Card>

              <Card className="border-brand-border bg-brand-surface">
                <CardContent className="space-y-4 p-6">
                  <div className="h-6 w-32 animate-pulse rounded-xl bg-brand-border" />
                  <div className="h-16 animate-pulse rounded-2xl bg-brand-background" />
                  <div className="h-16 animate-pulse rounded-2xl bg-brand-background" />
                  <div className="h-16 animate-pulse rounded-2xl bg-brand-background" />
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
};

const getSubmitErrorMessage = (error: unknown): string =>
{
  if (isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string | string[] }
      | undefined;

    if (typeof payload?.message === "string" && payload.message.trim()) {
      return payload.message;
    }

    if (Array.isArray(payload?.message) && payload.message.length > 0) {
      return payload.message[0] ?? "We could not send your booking request.";
    }
  }

  return "We could not send your booking request. Please try again.";
};

export const BookingRequestPage = ({
  photographer,
  isLoading = false,
  prefill,
}: BookingRequestPageProps) =>
{
  const [submittedBooking, setSubmittedBooking] =
    useState<BookingRequestRecord | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<BookingRequestFormValues>(() =>
  {
    return {
      sessionType: prefill?.sessionType?.trim() ?? "",
      duration: "",
      sessionDate: prefill?.sessionDate?.trim() ?? "",
      sessionTime: "",
      location:
        prefill?.location?.trim() || photographer?.location?.trim() || "",
      budget: prefill?.budget?.trim() || "flexible",
      contactPreference: "email",
      concept: "",
      inspiration: "",
      notes: "",
    };
  }, [photographer, prefill]);

  const form = useForm<BookingRequestFormValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues,
  });

  useEffect(() =>
  {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = async (values: BookingRequestFormValues) =>
  {
    if (!photographer) {
      return;
    }

    setSubmitError(null);

    try {
      const createdBooking = await bookingService.createBooking({
        photographerProfileId: photographer.id,
        photographerSlug: photographer.slug,
        photographerName: photographer.name,
        sessionType: values.sessionType,
        sessionDate: values.sessionDate,
        sessionTime: values.sessionTime,
        duration: values.duration,
        location: values.location,
        budget: values.budget,
        contactPreference: values.contactPreference,
        concept: values.concept,
        inspiration: values.inspiration?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      });

      setSubmittedBooking(createdBooking);
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
    }
  };

  const handleReset = () =>
  {
    setSubmittedBooking(null);
    setSubmitError(null);
    form.reset(defaultValues);
  };

  if (isLoading) {
    return <BookingRequestPageSkeleton />;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-brand-background">
        <Section className="pt-10 pb-16 sm:pt-14">
          <Container className="space-y-8">
            <div className="space-y-4">
              <Link
                href={
                  photographer
                    ? `/photographers/${photographer.slug}`
                    : "/photographers"
                }
                className="inline-flex text-sm font-medium text-brand-muted transition hover:text-brand-primary"
              >
                Back to profile
              </Link>

              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-muted">
                  Booking request
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-brand-primary sm:text-4xl">
                  {photographer
                    ? `Request a session with ${photographer.name}.`
                    : "Request a session."}
                </h1>

                <p className="max-w-2xl text-base text-brand-muted">
                  Share the essentials so the photographer can confirm
                  availability and refine the package.
                </p>
              </div>
            </div>

            {photographer ? (
              submittedBooking ? (
                <BookingSuccess
                  booking={submittedBooking}
                  onReset={handleReset}
                />
              ) : (
                <FormProvider {...form}>
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <BookingRequestForm
                      onSubmit={handleSubmit}
                      submitError={submitError}
                    />
                    <BookingSummaryCard photographer={photographer} />
                  </div>
                </FormProvider>
              )
            ) : (
              <BookingNotFound />
            )}
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
};