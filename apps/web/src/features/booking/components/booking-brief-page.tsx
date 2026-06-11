"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import
{
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import { buttonVariants } from "../../../components/ui/button";
import { bookingService } from "../../../services/booking.service";
import { useAuthStore } from "../../../store/auth.store";
import type {
  CreateBookingPayload,
  CreateOpenBookingPayload,
} from "../types/booking.types";
import
{
  bookingBriefSchema,
  type BookingBriefFormValues,
} from "../schemas/booking-brief.schema";
import
{
  BUDGET_MIN_VND,
  parseBudgetRangeValue,
  serializeBudgetRange,
} from "../utils/booking-budget";
import { BookingBriefForm } from "./booking-brief-form";
import { BookingBriefSummaryCard } from "./booking-brief-summary-card";
import
{
  parseAdditionalServiceValues,
  serializeAdditionalServices,
} from "../data/additional-services";
import { ConfirmBookingRequestDialog } from "./confirm-booking-request-dialog";
import { useQueryClient } from "@tanstack/react-query";
import type { PhotographerDetail } from "../../photographer/types/photographer-detail.types";

const BOOKING_BRIEF_DRAFT_STORAGE_KEY = "fotovia.bookingBriefDraft";

interface BookingBriefPrefill
{
  sessionType?: string;
  shootType?: string;
  style?: string;
  location?: string;
  date?: string;
  budget?: string;
}

interface BookingBriefPageProps
{
  prefill?: BookingBriefPrefill;
  selectedPhotographer?: PhotographerDetail | null;
  isSelectedPhotographerLoading?: boolean;
  selectedPhotographerError?: boolean;
}

interface BookingBriefDraft
{
  values: BookingBriefFormValues;
  intent: "send-booking-request";
  returnTo: string;
  savedAt: string;
}

const getStringValue = (
  record: Record<string, unknown>,
  key: string,
): string =>
{
  const value = record[key];

  return typeof value === "string" ? value : "";
};

const getStringArrayValue = (
  record: Record<string, unknown>,
  key: string,
): string[] =>
{
  const value = record[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
};

const getNumberValue = (
  record: Record<string, unknown>,
  key: string,
): number | undefined =>
{
  const value = record[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return undefined;
};

const normalizeBookingBriefValues = (
  value: unknown,
): BookingBriefFormValues | null =>
{
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  const shootType =
    getStringValue(record, "shootType") ||
    getStringValue(record, "style") ||
    getStringValue(record, "sessionType");

  const concept =
    getStringValue(record, "concept") ||
    getStringValue(record, "description");

  const parsedBudget = parseBudgetRangeValue(getStringValue(record, "budget"));
  const budgetFrom =
    getNumberValue(record, "budgetFrom") ??
    parsedBudget?.from ??
    BUDGET_MIN_VND;
  const budgetTo =
    getNumberValue(record, "budgetTo") ??
    parsedBudget?.to ??
    budgetFrom;

  const directAdditionalServices = getStringArrayValue(
    record,
    "additionalServices",
  );

  const additionalServices =
    directAdditionalServices.length > 0
      ? parseAdditionalServiceValues(directAdditionalServices.join("\n"))
      : parseAdditionalServiceValues(getStringValue(record, "notes"));

  return {
    title: getStringValue(record, "title"),
    shootType,
    preferredDate: getStringValue(record, "preferredDate"),
    preferredTime: getStringValue(record, "preferredTime"),
    location: getStringValue(record, "location"),
    budgetFrom,
    budgetTo,
    concept,
    contactPreference: getStringValue(record, "contactPreference") || "email",
    inspiration: getStringValue(record, "inspiration"),
    additionalServices,
  };
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
      const normalizedValues = normalizeBookingBriefValues(
        parsedValue.values,
      );

      if (!normalizedValues) {
        window.sessionStorage.removeItem(
          BOOKING_BRIEF_DRAFT_STORAGE_KEY,
        );
        return null;
      }

      return {
        ...parsedValue,
        values: normalizedValues,
      };
    }

    const normalizedValues = normalizeBookingBriefValues(parsedValue);

    if (normalizedValues) {
      return {
        values: normalizedValues,
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

const buildOpenBookingPayload = (
  values: BookingBriefFormValues,
): CreateOpenBookingPayload =>
{
  const shootType = values.shootType.trim();

  return {
    title: values.title.trim(),
    shootType,
    sessionType: shootType,
    sessionDate: values.preferredDate.trim(),
    sessionTime: values.preferredTime?.trim() || "flexible",
    duration: "flexible",
    location: values.location.trim(),
    budget: serializeBudgetRange(values.budgetFrom, values.budgetTo),
    contactPreference: values.contactPreference.trim(),
    concept: values.concept.trim(),
    inspiration: values.inspiration?.trim() || undefined,
    notes: serializeAdditionalServices(values.additionalServices),
  };
};

const buildSelectedPhotographerBookingPayload = (
  values: BookingBriefFormValues,
  photographer: PhotographerDetail,
): CreateBookingPayload =>
{
  const shootType = values.shootType.trim();

  return {
    photographerProfileId: photographer.id,
    photographerSlug: photographer.slug,
    photographerName: photographer.name,
    title: values.title.trim(),
    shootType,
    sessionType: shootType,
    sessionDate: values.preferredDate.trim(),
    sessionTime: values.preferredTime?.trim() || "flexible",
    duration: "flexible",
    location: values.location.trim(),
    budget: serializeBudgetRange(values.budgetFrom, values.budgetTo),
    contactPreference: values.contactPreference.trim(),
    concept: values.concept.trim(),
    inspiration: values.inspiration?.trim() || undefined,
    notes: serializeAdditionalServices(values.additionalServices),
  };
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

    if (error.response?.status === 401) {
      return "Your session expired. Please sign in again to send this request.";
    }
  }

  return "We could not send your booking request. Please try again.";
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

export const BookingBriefPage = ({
  prefill,
  selectedPhotographer = null,
  isSelectedPhotographerLoading = false,
  selectedPhotographerError = false,
}: BookingBriefPageProps) =>
{
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const {
    isAuthenticated,
    hasHydrated,
    isHydrating,
    user
  } = useAuthStore();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  const [pendingBriefValues, setPendingBriefValues] =
    useState<BookingBriefFormValues | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const processedDraftKeyRef = useRef<string | null>(null);

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
      shootType: getValue("shootType"),
      style: getValue("style"),
      location: getValue("location"),
      date: getValue("date"),
      budget: getValue("budget"),
    };
  }, [prefill, searchParams]);

  const defaultValues = useMemo<BookingBriefFormValues>(() =>
  {
    const prefilledShootType =
      resolvedPrefill.shootType ??
      resolvedPrefill.style ??
      resolvedPrefill.sessionType ??
      "";

    const prefilledBudget = parseBudgetRangeValue(resolvedPrefill.budget);

    return {
      title: "",
      shootType: prefilledShootType,
      preferredDate: resolvedPrefill.date ?? "",
      preferredTime: "",
      location:
        resolvedPrefill.location ??
        selectedPhotographer?.location?.trim() ??
        "",
      budgetFrom: prefilledBudget?.from ?? BUDGET_MIN_VND,
      budgetTo:
        prefilledBudget?.to ??
        prefilledBudget?.from ??
        BUDGET_MIN_VND,
      concept: "",
      contactPreference: "email",
      inspiration: "",
      additionalServices: [],
    };
  }, [resolvedPrefill, selectedPhotographer?.location]);

  const form = useForm<BookingBriefFormValues>({
    resolver: zodResolver(bookingBriefSchema),
    defaultValues,
  });

  const submitBookingBrief = useCallback(
    async (values: BookingBriefFormValues) =>
    {
      setSubmitError(null);
      setIsCreatingBooking(true);

      try {
        const createdBooking = selectedPhotographer
          ? await bookingService.createBooking(
            buildSelectedPhotographerBookingPayload(values, selectedPhotographer),
          )
          : await bookingService.createOpenBooking(buildOpenBookingPayload(values));

        clearBookingDraft();
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["open-booking-marketplace"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["opening-booking-requests"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["client-bookings"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["photographer-bookings"],
          }),
          queryClient.invalidateQueries({
            queryKey: ["public-photographer-detail", selectedPhotographer?.slug],
          }),
        ]);

        const createdBookingId = createdBooking.id?.trim();

        if (createdBookingId) {
          if (selectedPhotographer) {
            router.push(
              `/bookings/${encodeURIComponent(createdBookingId)}?created=1&direct=1`,
            );
            return;
          }

          router.push(
            `/my-bookings?bookingId=${encodeURIComponent(
              createdBookingId,
            )}&created=1`,
          );
          return;
        }

        router.push(selectedPhotographer ? "/my-bookings?direct=1" : "/my-bookings?created=1");
      } catch (error) {
        setSubmitError(getSubmitErrorMessage(error));
        setIsCreatingBooking(false);
      }
    },
    [queryClient, router, selectedPhotographer],
  );

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

    const draftKey = storedDraft.savedAt;

    if (processedDraftKeyRef.current === draftKey) {
      return;
    }

    processedDraftKeyRef.current = draftKey;

    const restoredValues: BookingBriefFormValues = {
      ...defaultValues,
      ...storedDraft.values,
    };

    form.reset(restoredValues);

    if (storedDraft.intent !== "send-booking-request") {
      return;
    }

    setPendingBriefValues(restoredValues);
  }, [
    defaultValues,
    form,
    hasHydrated,
    isAuthenticated,
    submitBookingBrief,
  ]);

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

    if (user?.role === "photographer") {
      setSubmitError(
        "Photographer accounts cannot create client booking requests. Please browse open requests instead.",
      );
      router.push("/bookings/open");
      return;
    }

    if (selectedPhotographerError) {
      setSubmitError(
        "We could not load the selected photographer. Please go back and choose another photographer.",
      );
      return;
    }

    if (isSelectedPhotographerLoading) {
      setSubmitError("Please wait while we load the selected photographer.");
      return;
    }

    setPendingBriefValues(values);
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

  if (hasHydrated && !isHydrating && isAuthenticated && user?.role === "photographer") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main>
          <Section className="py-14 sm:py-20">
            <Container>
              <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-surface p-8 text-center shadow-[0_18px_50px_rgba(23,23,23,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                  Photographer workspace
                </p>

                <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground">
                  Browse open requests instead.
                </h1>

                <p className="mt-4 text-sm leading-7 text-muted">
                  Photographer accounts cannot create client booking requests.
                  You can apply to open photoshoot requests or manage your
                  portfolio from your workspace.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/bookings/open"
                    className={buttonVariants({
                      size: "lg",
                      className: "rounded-full",
                    })}
                  >
                    View open requests
                  </Link>

                  <Link
                    href="/photographer/portfolio"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "lg",
                      className: "rounded-full",
                    })}
                  >
                    Open my portfolio
                  </Link>
                </div>
              </div>
            </Container>
          </Section>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />

      <main>
        <Section className="py-6 sm:py-8 md:py-10">
          <Container className="space-y-6 overflow-x-hidden">
            <div>
              <h1 className="font-display text-3xl text-foreground md:text-4xl">
                Complete your booking brief.
              </h1>
            </div>

            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(
                  handleSubmit,
                  handleInvalid,
                )}
                className="grid w-full max-w-full min-w-0 gap-6 overflow-x-hidden lg:grid-cols-[minmax(0,1fr)_360px]"
              >
                <div className="min-w-0 space-y-6">
                  <BookingBriefForm />
                </div>

                <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
                  <BookingBriefSummaryCard
                    selectedPhotographer={selectedPhotographer}
                    isSelectedPhotographerLoading={isSelectedPhotographerLoading}
                    errorMessage={submitError}
                    submitLabel="Confirm request"
                    submittingLabel="Preparing..."
                  />
                </div>
              </form>
            </FormProvider>
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
      <ConfirmBookingRequestDialog
        isOpen={Boolean(pendingBriefValues)}
        values={pendingBriefValues}
        isSubmitting={isCreatingBooking}
        confirmLabel={selectedPhotographer ? "Send request" : "Find photographer"}
        submittingLabel={selectedPhotographer ? "Sending..." : "Creating..."}
        onClose={() => setPendingBriefValues(null)}
        onConfirm={() =>
        {
          if (pendingBriefValues) {
            void submitBookingBrief(pendingBriefValues);
          }
        }}
      />
    </div>
  );
};