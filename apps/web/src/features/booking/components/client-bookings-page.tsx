"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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

const BookingCounts = ({
    counts,
}: {
    counts: Record<ClientBookingFilter, number>;
}) =>
{
    const items = [
        { label: "All requests", value: counts.all },
        { label: "Pending", value: counts.pending },
        { label: "Confirmed", value: counts.confirmed },
        { label: "Declined", value: counts.declined },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="rounded-2xl border border-brand-border bg-brand-surface p-4"
                >
                    <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                        {item.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-brand-primary">
                        {item.value}
                    </p>
                </div>
            ))}
        </div>
    );
};

const EmptyBookingHistory = () =>
{
    return (
        <Card className="border-brand-border bg-brand-surface">
            <CardContent className="space-y-4 p-6 sm:p-8">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                    Booking history
                </p>
                <h2 className="text-2xl font-semibold text-brand-primary">
                    You have not sent any booking requests yet.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-brand-muted">
                    Once you start a booking request from a photographer profile,
                    it will appear here so you can review the brief and track the
                    latest response status.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/photographers"
                        className={buttonVariants({
                            variant: "primary",
                            size: "md",
                        })}
                    >
                        Explore photographers
                    </Link>
                    <Link
                        href="/"
                        className={buttonVariants({
                            variant: "secondary",
                            size: "md",
                        })}
                    >
                        Back to homepage
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export const ClientBookingsPage = () =>
{
    const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

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

    const listErrorMessage = bookingsQuery.error
        ? getErrorMessage(
            bookingsQuery.error,
            "We couldn’t load your booking history right now.",
        )
        : null;

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
                <Section className="pt-10 pb-16 sm:pt-14">
                    <Container className="space-y-8">
                        <div className="space-y-4">
                            <Link
                                href="/"
                                className="inline-flex text-sm font-medium text-brand-muted transition hover:text-brand-primary"
                            >
                                Back to homepage
                            </Link>

                            <div className="space-y-3">
                                <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-muted">
                                    Client dashboard
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight text-brand-primary sm:text-4xl">
                                    Track your booking requests and photographer
                                    responses.
                                </h1>
                                <p className="max-w-2xl text-base text-brand-muted">
                                    This page closes the client-side visibility
                                    gap after request submission. You can now
                                    review past requests and see whether each
                                    one is still pending, confirmed, or
                                    declined.
                                </p>
                            </div>
                        </div>

                        {bookingsQuery.isLoading ? (
                            <BookingHistorySkeleton />
                        ) : listErrorMessage ? (
                            <Card className="border-brand-border bg-brand-surface">
                                <CardContent className="space-y-4 p-6 sm:p-8">
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                                        Booking history
                                    </p>
                                    <h2 className="text-2xl font-semibold text-brand-primary">
                                        We couldn’t load your booking history
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
                            <>
                                <BookingCounts counts={counts} />

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
                                    />
                                </div>
                            </>
                        )}
                    </Container>
                </Section>
            </main>

            <Footer />
        </>
    );
};