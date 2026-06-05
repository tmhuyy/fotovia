"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import { buttonVariants } from "../../../components/ui/button";
import { useAuthStore } from "../../../store/auth.store";
import
  {
    budgetOptions,
    sessionTypeOptions,
    styleOptions,
  } from "../data/booking-options";
import
  {
    bookingBriefSchema,
    type BookingBriefFormValues,
  } from "../schemas/booking-brief.schema";
import { BookingBriefForm } from "./booking-brief-form";
import { BookingBriefSummaryCard } from "./booking-brief-summary-card";
import { BookingBriefSuccess } from "./booking-brief-success";

const BOOKING_BRIEF_DRAFT_STORAGE_KEY = "fotovia.bookingBriefDraft";

interface BookingBriefPrefill
{
  sessionType?: string;
  style?: string;
  location?: string;
  date?: string;
  budget?: string;
}

interface BookingBriefPageProps
{
  prefill?: BookingBriefPrefill;
}

interface BookingBriefDraft
{
  values: BookingBriefFormValues;
  intent: "send-booking-request";
  returnTo: string;
  savedAt: string;
}

const isBookingBriefFormValues = (
  value: unknown,
): value is BookingBriefFormValues =>
{
  return (
    typeof value === "object" &&
    value !== null &&
    "sessionType" in value &&
    "preferredDate" in value &&
    "preferredTime" in value &&
    "location" in value &&
    "budget" in value &&
    "style" in value &&
    "description" in value &&
    "contactPreference" in value
  );
};

const isBookingBriefDraft = (value: unknown): value is BookingBriefDraft =>
{
  return (
    typeof value === "object" &&
    value !== null &&
    "values" in value &&
    "intent" in value &&
    "returnTo" in value
  );
};

const saveBookingDraft = (
  values: BookingBriefFormValues,
  returnTo: string,
) =>
{
  if (typeof window === "undefined") {
    return;
  }

  const draft: BookingBriefDraft = {
    values,
    intent: "send-booking-request",
    returnTo,
    savedAt: new Date().toISOString(),
  };

  window.sessionStorage.setItem(
    BOOKING_BRIEF_DRAFT_STORAGE_KEY,
    JSON.stringify(draft),
  );
};

const readBookingDraft = (): BookingBriefDraft | null =>
{
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(
    BOOKING_BRIEF_DRAFT_STORAGE_KEY,
  );

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    if (isBookingBriefDraft(parsedValue)) {
      return parsedValue;
    }

    if (isBookingBriefFormValues(parsedValue)) {
      return {
        values: parsedValue,
        intent: "send-booking-request",
        returnTo: "/bookings/new",
        savedAt: new Date().toISOString(),
      };
    }

    window.sessionStorage.removeItem(BOOKING_BRIEF_DRAFT_STORAGE_KEY);
    return null;
  } catch {
    window.sessionStorage.removeItem(BOOKING_BRIEF_DRAFT_STORAGE_KEY);
    return null;
  }
};

const clearBookingDraft = () =>
{
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(BOOKING_BRIEF_DRAFT_STORAGE_KEY);
};

const BookingAuthPrompt = ({
  isOpen,
  onClose,
  signInHref,
  signUpHref,
}: {
  isOpen: boolean;
  onClose: () => void;
  signInHref: string;
  signUpHref: string;
}) =>
{
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              Almost done
            </p>

            <h2 className="font-serif text-3xl leading-tight text-foreground">
              Sign in to send your booking request.
            </h2>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg text-foreground transition hover:bg-background"
            onClick={onClose}
            aria-label="Close sign in prompt"
          >
            ×
          </button>
        </div>

        <p className="mt-4 text-sm leading-7 text-muted">
          Your booking brief is saved in this browser. After signing in,
          Fotovia will bring you back here and continue the request.
        </p>

        <div className="mt-6 space-y-3">
          <Link
            href={signInHref}
            className={buttonVariants({
              size: "lg",
              className: "w-full rounded-full",
            })}
          >
            Sign in to continue
          </Link>

          <Link
            href={signUpHref}
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className: "w-full rounded-full",
            })}
          >
            Create account
          </Link>

          <button
            type="button"
            className="w-full rounded-full px-4 py-3 text-sm font-semibold text-muted transition hover:text-foreground"
            onClick={onClose}
          >
            Keep editing brief
          </button>
        </div>
      </div>
    </div>
  );
};

export const BookingBriefPage = ({ prefill }: BookingBriefPageProps) =>
{
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    isAuthenticated,
    hasHydrated,
    isHydrating,
  } = useAuthStore();

  const [submittedValues, setSubmittedValues] = useState<
    BookingBriefFormValues | null
  >(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  const currentRoute = useMemo(() =>
  {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  const signInHref = `/sign-in?next=${encodeURIComponent(currentRoute)}`;
  const signUpHref = `/sign-up?next=${encodeURIComponent(currentRoute)}`;

  const resolvedPrefill = useMemo<BookingBriefPrefill>(() =>
  {
    const getValue = (key: keyof BookingBriefPrefill) =>
    {
      const fromQuery = searchParams.get(key);

      if (fromQuery && fromQuery.trim() !== "") {
        return fromQuery;
      }

      return prefill?.[key];
    };

    return {
      sessionType: getValue("sessionType"),
      style: getValue("style"),
      location: getValue("location"),
      date: getValue("date"),
      budget: getValue("budget"),
    };
  }, [prefill, searchParams]);

  const defaultValues = useMemo<BookingBriefFormValues>(() =>
  {
    return {
      sessionType: resolvedPrefill.sessionType ?? "",
      preferredDate: resolvedPrefill.date ?? "",
      preferredTime: "",
      location: resolvedPrefill.location ?? "",
      budget: resolvedPrefill.budget ?? "",
      style: resolvedPrefill.style ?? "",
      description: "",
      contactPreference: "email",
      inspiration: "",
      notes: "",
    };
  }, [resolvedPrefill]);

  const prefilledItems = useMemo(() =>
  {
    const items: string[] = [];

    if (resolvedPrefill.sessionType) {
      const label =
        sessionTypeOptions.find(
          (option) => option.value === resolvedPrefill.sessionType,
        )?.label ?? resolvedPrefill.sessionType;

      items.push(`Session type: ${label}`);
    }

    if (resolvedPrefill.style) {
      const label =
        styleOptions.find(
          (option) => option.value === resolvedPrefill.style,
        )?.label ?? resolvedPrefill.style;

      items.push(`Style: ${label}`);
    }

    if (resolvedPrefill.location) {
      items.push(`Location: ${resolvedPrefill.location}`);
    }

    if (resolvedPrefill.date) {
      items.push(`Preferred date: ${resolvedPrefill.date}`);
    }

    if (resolvedPrefill.budget) {
      const label =
        budgetOptions.find(
          (option) => option.value === resolvedPrefill.budget,
        )?.label ?? resolvedPrefill.budget;

      items.push(`Budget: ${label}`);
    }

    return items;
  }, [resolvedPrefill]);

  const form = useForm<BookingBriefFormValues>({
    resolver: zodResolver(bookingBriefSchema),
    defaultValues,
  });

  useEffect(() =>
  {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  useEffect(() =>
  {
    if (!hasHydrated || !isAuthenticated) {
      return;
    }

    const storedDraft = readBookingDraft();

    if (!storedDraft) {
      return;
    }

    const restoredValues: BookingBriefFormValues = {
      ...defaultValues,
      ...storedDraft.values,
    };

    form.reset(restoredValues);
    clearBookingDraft();

    if (storedDraft.intent !== "send-booking-request") {
      return;
    }

    const timeoutId = window.setTimeout(() =>
    {
      setSubmittedValues(restoredValues);
    }, 450);

    return () =>
    {
      window.clearTimeout(timeoutId);
    };
  }, [defaultValues, form, hasHydrated, isAuthenticated]);

  const handleSubmit = async (values: BookingBriefFormValues) =>
  {
    setSubmitError(null);

    if (!hasHydrated || isHydrating) {
      setSubmitError("Please wait a moment while your session is loading.");
      return;
    }

    if (!isAuthenticated) {
      saveBookingDraft(values, currentRoute);
      setIsAuthPromptOpen(true);
      return;
    }

    clearBookingDraft();

    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmittedValues(values);
  };

  const handleInvalid = (errors: FieldErrors<BookingBriefFormValues>) =>
  {
    setSubmitError("Please complete the highlighted fields to continue.");

    const firstErrorKey = Object.keys(errors)[0] as
      | keyof BookingBriefFormValues
      | undefined;

    if (firstErrorKey) {
      form.setFocus(firstErrorKey);
    }
  };

  const handleReset = () =>
  {
    setSubmittedValues(null);
    setSubmitError(null);
    setIsAuthPromptOpen(false);
    clearBookingDraft();
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
                Guided booking
              </p>

              <h1 className="font-display text-3xl text-foreground md:text-4xl">
                Complete your booking brief.
              </h1>

              <p className="max-w-2xl text-sm text-muted md:text-base">
                Add the details first. Fotovia will only ask you to sign in
                when you send the request.
              </p>

              <p className="text-xs text-muted">
                Already chosen a photographer? Start a direct request from
                their profile.
              </p>
            </div>

            {submittedValues ? (
              <BookingBriefSuccess
                values={submittedValues}
                onReset={handleReset}
              />
            ) : (
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(
                    handleSubmit,
                    handleInvalid,
                  )}
                  className="grid gap-8 lg:grid-cols-[2fr_1fr]"
                >
                  <div className="space-y-6">
                    {/* {prefilledItems.length ? (
                      <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted">
                          Prefilled from homepage
                        </p>

                        <ul className="mt-2 space-y-1">
                          {prefilledItems.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null} */}

                    <BookingBriefForm />
                  </div>

                  <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <BookingBriefSummaryCard
                      errorMessage={submitError}
                      submitLabel="Send booking request"
                      submittingLabel="Sending..."
                    />
                  </div>
                </form>
              </FormProvider>
            )}
          </Container>
        </Section>
      </main>

      <Footer />

      <BookingAuthPrompt
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        signInHref={signInHref}
        signUpHref={signUpHref}
      />
    </div>
  );
};