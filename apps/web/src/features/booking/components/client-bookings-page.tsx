"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import
{
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { Section } from "../../../components/common/section";
import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { bookingService } from "../../../services/booking.service";
import { useAuthStore } from "../../../store/auth.store";
import type {
    BookingRequestRecord,
    ClientBookingActionStatus,
    ClientBookingFilter,
} from "../types/booking.types";
import { ClientBookingDetailCard } from "./client-booking-detail-card";
import { ClientBookingsList } from "./client-bookings-list";

const getErrorMessage = (error: unknown, fallback: string): string =>
{
    if (isAxiosError(error)) {
        const payload = error.response?.data as
            | { message?: string | string[]; statusCode?: number }
            | undefined;

        if (typeof payload?.message === "string" && payload.message.trim()) {
            return payload.message;
        }

        if (Array.isArray(payload?.message) && payload.message.length > 0) {
            return payload.message[0] ?? fallback;
        }

        if (error.response?.status === 403) {
            return "Your current login session was rejected by the booking service. Please sign out, sign in again, and retry.";
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
};

const BookingHistorySkeleton = () =>
{
    return (
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <Card className="border-brand-border bg-brand-surface">
                <CardContent className="space-y-4 p-6">
                    <div className="h-6 w-36 animate-pulse rounded-xl bg-brand-border" />
                    <div className="h-10 w-full animate-pulse rounded-2xl bg-brand-background" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-28 animate-pulse rounded-2xl bg-brand-background"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-brand-border bg-brand-surface">
                <CardContent className="space-y-4 p-6 sm:p-8">
                    <div className="h-6 w-40 animate-pulse rounded-xl bg-brand-border" />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="h-24 animate-pulse rounded-2xl bg-brand-background" />
                        <div className="h-24 animate-pulse rounded-2xl bg-brand-background" />
                        <div className="h-24 animate-pulse rounded-2xl bg-brand-background" />
                        <div className="h-24 animate-pulse rounded-2xl bg-brand-background" />
                    </div>
                    <div className="h-28 animate-pulse rounded-2xl bg-brand-background" />
                </CardContent>
            </Card>
        </div>
    );
};

const EmptyBookingHistory = () =>
{
    return (
        <Card className="border-brand-border bg-brand-surface">
            <CardContent className="space-y-4 p-6 sm:p-8">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                    Booking requests
                </p>
                <h2 className="text-2xl font-semibold text-brand-primary">
                    You have not sent any booking requests yet.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-brand-muted">
                    Start from the homepage search bar or open a photographer
                    portfolio to send your first request.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/"
                        className={buttonVariants({
                            variant: "primary",
                            size: "md",
                        })}
                    >
                        Create booking request
                    </Link>
                    <Link
                        href="/photographers"
                        className={buttonVariants({
                            variant: "secondary",
                            size: "md",
                        })}
                    >
                        Browse photographers
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export const ClientBookingsPage = () =>
{
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();
    const queryClient = useQueryClient();

    const queryBookingId = searchParams.get("bookingId");
    const isCreatedRedirect = searchParams.get("created") === "1";

    const bookingHistoryQueryKey = [
        "client-bookings",
        user?.id ?? user?.email ?? "anonymous",
    ];

    const [activeFilter, setActiveFilter] =
        useState<ClientBookingFilter>("all");
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
        null,
    );

    const bookingsQuery = useQuery({
        queryKey: bookingHistoryQueryKey,
        queryFn: () => bookingService.getMyClientBookings(),
        enabled: hasHydrated && !isHydrating && isAuthenticated,
        retry: false,
    });

    const bookings = useMemo<BookingRequestRecord[]>(() =>
    {
        return bookingsQuery.data ?? [];
    }, [bookingsQuery.data]);

    const counts = useMemo<Record<ClientBookingFilter, number>>(() =>
    {
        return {
            all: bookings.length,
            pending: bookings.filter((item) => item.status === "pending")
                .length,
            confirmed: bookings.filter((item) => item.status === "confirmed")
                .length,
            declined: bookings.filter((item) => item.status === "declined")
                .length,
            cancelled: bookings.filter((item) => item.status === "cancelled")
                .length,
            completed: bookings.filter((item) => item.status === "completed")
                .length,
        };
    }, [bookings]);

    const filteredBookings = useMemo(() =>
    {
        if (activeFilter === "all") {
            return bookings;
        }

        return bookings.filter((booking) => booking.status === activeFilter);
    }, [activeFilter, bookings]);

    useEffect(() =>
    {
        if (!queryBookingId || bookings.length === 0) {
            return;
        }

        const matchedBooking = bookings.find(
            (booking) => booking.id === queryBookingId,
        );

        if (!matchedBooking) {
            return;
        }

        setActiveFilter("all");
        setSelectedBookingId(matchedBooking.id);
    }, [bookings, queryBookingId]);

    useEffect(() =>
    {
        if (filteredBookings.length === 0) {
            setSelectedBookingId(null);
            return;
        }

        setSelectedBookingId((current) =>
        {
            if (
                current &&
                filteredBookings.some((booking) => booking.id === current)
            ) {
                return current;
            }

            return filteredBookings[0]?.id ?? null;
        });
    }, [filteredBookings]);

    const selectedBooking = useMemo<BookingRequestRecord | null>(() =>
    {
        if (!selectedBookingId) {
            return filteredBookings[0] ?? null;
        }

        return (
            filteredBookings.find((booking) => booking.id === selectedBookingId) ??
            filteredBookings[0] ??
            null
        );
    }, [filteredBookings, selectedBookingId]);

    const timelineQuery = useQuery({
        queryKey: [
            "client-booking-timeline",
            user?.id ?? user?.email ?? "anonymous",
            selectedBooking?.id ?? "none",
        ],
        queryFn: () =>
            bookingService.getMyClientBookingTimeline(selectedBooking!.id),
        enabled:
            hasHydrated &&
            !isHydrating &&
            isAuthenticated &&
            Boolean(selectedBooking?.id),
        retry: false,
    });

    const cancelBookingMutation = useMutation({
        mutationFn: ({
            bookingId,
            status,
        }: {
            bookingId: string;
            status: ClientBookingActionStatus;
        }) => bookingService.cancelMyClientBooking(bookingId, status),
        onSuccess: (updatedBooking) =>
        {
            queryClient.setQueryData<BookingRequestRecord[]>(
                bookingHistoryQueryKey,
                (current) =>
                    current?.map((booking) =>
                        booking.id === updatedBooking.id ? updatedBooking : booking,
                    ) ?? [updatedBooking],
            );
        },
        onSettled: async () =>
        {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: bookingHistoryQueryKey,
                }),
                queryClient.invalidateQueries({
                    queryKey: [
                        "client-booking-timeline",
                        user?.id ?? user?.email ?? "anonymous",
                        selectedBooking?.id ?? "none",
                    ],
                }),
            ]);
        },
    });

    const listErrorMessage = bookingsQuery.error
        ? getErrorMessage(
            bookingsQuery.error,
            "We couldn’t load your booking requests right now.",
        )
        : null;

    const actionErrorMessage = cancelBookingMutation.error
        ? getErrorMessage(
            cancelBookingMutation.error,
            "We couldn’t cancel that booking request right now.",
        )
        : null;

    const timelineErrorMessage = timelineQuery.error
        ? getErrorMessage(
            timelineQuery.error,
            "We couldn’t load the booking timeline right now.",
        )
        : null;

    const handleCancel = (status: ClientBookingActionStatus) =>
    {
        if (!selectedBooking) {
            return;
        }

        cancelBookingMutation.mutate({
            bookingId: selectedBooking.id,
            status,
        });
    };

    if (!hasHydrated || isHydrating) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-brand-background">
                    <Section className="pt-10 pb-16 sm:pt-14">
                        <Container>
                            <BookingHistorySkeleton />
                        </Container>
                    </Section>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-brand-background">
                <Section className="pt-8 pb-16 sm:pt-10">
                    <Container className="space-y-8">
                        <div className="space-y-3">
                            <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-muted">
                                My bookings
                            </p>
                            <h1 className="font-display text-4xl text-brand-primary md:text-5xl">
                                Booking requests.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-brand-muted">
                                Review the requests you sent and track photographer
                                responses in one place.
                            </p>
                        </div>

                        {isCreatedRedirect ? (
                            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                                Your booking request was sent successfully.
                            </div>
                        ) : null}

                        {bookingsQuery.isLoading ? (
                            <BookingHistorySkeleton />
                        ) : listErrorMessage ? (
                            <Card className="border-brand-border bg-brand-surface">
                                <CardContent className="space-y-4 p-6 sm:p-8">
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                                        Booking requests
                                    </p>
                                    <h2 className="text-2xl font-semibold text-brand-primary">
                                        We couldn’t load your booking requests
                                        right now.
                                    </h2>
                                    <p className="text-sm leading-7 text-brand-muted">
                                        {listErrorMessage}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => bookingsQuery.refetch()}
                                        className="inline-flex rounded-full border border-brand-border bg-brand-background px-4 py-2 text-sm font-medium text-brand-primary transition hover:bg-brand-surface"
                                    >
                                        Try again
                                    </button>
                                </CardContent>
                            </Card>
                        ) : bookings.length === 0 ? (
                            <EmptyBookingHistory />
                        ) : (
                            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                                <ClientBookingsList
                                    bookings={filteredBookings}
                                    selectedBookingId={selectedBookingId}
                                    activeFilter={activeFilter}
                                    counts={counts}
                                    onSelect={setSelectedBookingId}
                                    onFilterChange={setActiveFilter}
                                />

                                <ClientBookingDetailCard
                                    booking={selectedBooking}
                                    isUpdating={cancelBookingMutation.isPending}
                                    actionError={actionErrorMessage}
                                    onCancel={handleCancel}
                                    timelineEvents={timelineQuery.data ?? []}
                                    isTimelineLoading={timelineQuery.isLoading}
                                    timelineError={timelineErrorMessage}
                                />
                            </div>
                        )}
                    </Container>
                </Section>
            </main>

            <Footer />
        </>
    );
};