"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
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
    BookingInboxFilter,
    BookingRequestRecord,
    PhotographerBookingActionStatus,
} from "../types/booking.types";
import { PhotographerBookingDetailCard } from "./photographer-booking-detail-card";
import { PhotographerBookingsList } from "./photographer-bookings-list";

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

const BookingInboxSkeleton = () =>
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
                    <div className="h-12 w-44 animate-pulse rounded-full bg-brand-border" />
                </CardContent>
            </Card>
        </div>
    );
};

const BookingCounts = ({
    counts,
}: {
    counts: Record<BookingInboxFilter, number>;
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

const EmptyBookingInbox = () =>
{
    return (
        <Card className="border-brand-border bg-brand-surface">
            <CardContent className="space-y-4 p-6 sm:p-8">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                    Booking inbox
                </p>
                <h2 className="text-2xl font-semibold text-brand-primary">
                    No incoming requests yet.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-brand-muted">
                    Once clients start requesting sessions from your public photographer
                    profile, those requests will appear here for review.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/photographer/dashboard"
                        className={buttonVariants({ variant: "secondary", size: "md" })}
                    >
                        Back to dashboard
                    </Link>
                    <Link
                        href="/photographers"
                        className={buttonVariants({ variant: "primary", size: "md" })}
                    >
                        View public marketplace
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

const WorkspaceRestrictedState = () =>
{
    return (
        <Card className="border-brand-border bg-brand-surface">
            <CardContent className="space-y-4 p-6 sm:p-8">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                    Workspace access
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-brand-primary">
                    This inbox is reserved for photographer accounts.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-brand-muted">
                    Your account is signed in, but this route is meant for the
                    photographer-side booking workflow. You can still manage your profile
                    or return to the main marketplace flow.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/profile"
                        className={buttonVariants({ variant: "secondary", size: "md" })}
                    >
                        Go to profile
                    </Link>
                    <Link
                        href="/"
                        className={buttonVariants({ variant: "primary", size: "md" })}
                    >
                        Back to homepage
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export const PhotographerBookingsPage = () =>
{
    const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();
    const queryClient = useQueryClient();

    const isPhotographer = user?.role === "photographer";
    const bookingInboxQueryKey = [
        "photographer-bookings",
        user?.id ?? user?.email ?? "anonymous",
    ];

    const [activeFilter, setActiveFilter] = useState<BookingInboxFilter>("all");
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
        null,
    );

    const bookingsQuery = useQuery({
        queryKey: bookingInboxQueryKey,
        queryFn: () => bookingService.getMyPhotographerBookings(),
        enabled:
            hasHydrated && !isHydrating && isAuthenticated && Boolean(isPhotographer),
        retry: false,
    });

    const bookings = useMemo<BookingRequestRecord[]>(() =>
    {
        return bookingsQuery.data ?? [];
    }, [bookingsQuery.data]);

    const counts = useMemo<Record<BookingInboxFilter, number>>(() =>
    {
        return {
            all: bookings.length,
            pending: bookings.filter((item) => item.status === "pending").length,
            confirmed: bookings.filter((item) => item.status === "confirmed").length,
            declined: bookings.filter((item) => item.status === "declined").length,
            completed: bookings.filter((item) => item.status === "completed").length,
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
            if (current && filteredBookings.some((booking) => booking.id === current)) {
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

    const updateStatusMutation = useMutation({
        mutationFn: ({
            bookingId,
            status,
        }: {
            bookingId: string;
            status: PhotographerBookingActionStatus;
        }) => bookingService.updateMyPhotographerBookingStatus(bookingId, status),
        onSuccess: (updatedBooking) =>
        {
            queryClient.setQueryData<BookingRequestRecord[]>(
                bookingInboxQueryKey,
                (current) =>
                    current?.map((booking) =>
                        booking.id === updatedBooking.id ? updatedBooking : booking,
                    ) ?? [updatedBooking],
            );
        },
        onSettled: async () =>
        {
            await queryClient.invalidateQueries({
                queryKey: bookingInboxQueryKey,
            });
        },
    });

    const listErrorMessage = bookingsQuery.error
        ? getErrorMessage(
            bookingsQuery.error,
            "We couldn’t load incoming booking requests right now.",
        )
        : null;

    const actionErrorMessage = updateStatusMutation.error
        ? getErrorMessage(
            updateStatusMutation.error,
            "We couldn’t update that booking request status right now.",
        )
        : null;

    const handleStatusChange = (status: PhotographerBookingActionStatus) =>
    {
        if (!selectedBooking) {
            return;
        }

        updateStatusMutation.mutate({
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
                            <BookingInboxSkeleton />
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
                                href="/photographer/dashboard"
                                className="inline-flex text-sm font-medium text-brand-muted transition hover:text-brand-primary"
                            >
                                Back to workspace
                            </Link>

                            <div className="space-y-3">
                                <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-muted">
                                    Photographer workspace
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight text-brand-primary sm:text-4xl">
                                    Review and respond to incoming booking requests.
                                </h1>
                                <p className="max-w-2xl text-base text-brand-muted">
                                    This inbox completes the second half of the current booking
                                    workflow: clients can send real requests, and photographers can
                                    now review and make the first response decision from the
                                    workspace.
                                </p>
                            </div>
                        </div>

                        {!isPhotographer ? (
                            <WorkspaceRestrictedState />
                        ) : bookingsQuery.isLoading ? (
                            <BookingInboxSkeleton />
                        ) : listErrorMessage ? (
                            <Card className="border-brand-border bg-brand-surface">
                                <CardContent className="space-y-4 p-6 sm:p-8">
                                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                                        Booking inbox
                                    </p>
                                    <h2 className="text-2xl font-semibold text-brand-primary">
                                        We couldn’t load your inbox right now.
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
                            <EmptyBookingInbox />
                        ) : (
                            <>
                                <BookingCounts counts={counts} />

                                <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                                    <PhotographerBookingsList
                                        bookings={filteredBookings}
                                        selectedBookingId={selectedBookingId}
                                        activeFilter={activeFilter}
                                        counts={counts}
                                        onSelect={setSelectedBookingId}
                                        onFilterChange={setActiveFilter}
                                    />

                                    <PhotographerBookingDetailCard
                                        booking={selectedBooking}
                                        isUpdating={updateStatusMutation.isPending}
                                        actionError={actionErrorMessage}
                                        onStatusChange={handleStatusChange}
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