"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    CancelBookingPayload,
    ClientBookingFilter,
    UpdateOpenBookingPayload,
} from "../types/booking.types";
import { ClientBookingsList } from "./client-bookings-list";
import { EditOpenBookingDialog } from "./edit-open-booking-dialog";

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
        <div className="space-y-5">
            <div className="h-44 animate-pulse rounded-[2rem] bg-brand-surface" />
            <div className="grid gap-5 lg:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-64 animate-pulse rounded-[1.75rem] bg-brand-surface"
                    />
                ))}
            </div>
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
                        href="/bookings/new"
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
    const queryClient = useQueryClient();
    const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

    const isCreatedRedirect = searchParams.get("created") === "1";

    const [activeFilter, setActiveFilter] =
        useState<ClientBookingFilter>("all");
    const [editingBooking, setEditingBooking] =
        useState<BookingRequestRecord | null>(null);

    const bookingHistoryQueryKey = [
        "client-bookings",
        user?.id ?? user?.email ?? "anonymous",
    ];

    const bookingsQuery = useQuery({
        queryKey: bookingHistoryQueryKey,
        queryFn: () => bookingService.getMyClientBookings(),
        enabled: hasHydrated && !isHydrating && isAuthenticated,
        retry: false,
    });

    const cancelBookingMutation = useMutation({
        mutationFn: ({
            bookingId,
            payload,
        }: {
            bookingId: string;
            payload: CancelBookingPayload;
        }) => bookingService.cancelMyClientBooking(bookingId, payload),
        onSuccess: async () =>
        {
            toast.success("Booking cancelled", {
                description:
                    "Your open photoshoot request was removed from the public booking list.",
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["client-bookings"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["opening-booking-requests"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-marketplace"],
                }),
            ]);
        },
        onError: (error) =>
        {
            toast.error("We couldn’t cancel this booking", {
                description: getErrorMessage(
                    error,
                    "Please try again in a moment.",
                ),
            });
        },
    });

    const updateBookingMutation = useMutation({
        mutationFn: ({
            bookingId,
            payload,
        }: {
            bookingId: string;
            payload: UpdateOpenBookingPayload;
        }) => bookingService.updateMyClientOpenBooking(bookingId, payload),
        onSuccess: async () =>
        {
            toast.success("Booking updated", {
                description: "Your photoshoot request has been updated.",
            });

            setEditingBooking(null);

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["client-bookings"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["opening-booking-requests"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-marketplace"],
                }),
            ]);
        },
        onError: (error) =>
        {
            toast.error("We couldn’t update this booking", {
                description: getErrorMessage(
                    error,
                    "Please check the booking details and try again.",
                ),
            });
        },
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

    const listErrorMessage = bookingsQuery.error
        ? getErrorMessage(
            bookingsQuery.error,
            "We couldn’t load your booking requests right now.",
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
                <Section className="pt-8 pb-16 sm:pt-10">
                    <Container className="space-y-8">
                        <div className="space-y-3">
                            <h1 className="font-display text-4xl text-brand-primary md:text-5xl">
                                My bookings
                            </h1>
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
                                        My bookings
                                    </p>

                                    <p className="text-sm leading-7 text-brand-muted">
                                        {listErrorMessage}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => bookingsQuery.refetch()}
                                        className="inline-flex cursor-pointer rounded-full border border-brand-border bg-brand-background px-4 py-2 text-sm font-medium text-brand-primary transition hover:bg-brand-surface"
                                    >
                                        Try again
                                    </button>
                                </CardContent>
                            </Card>
                        ) : bookings.length === 0 ? (
                            <EmptyBookingHistory />
                        ) : (
                            <ClientBookingsList
                                bookings={filteredBookings}
                                activeFilter={activeFilter}
                                counts={counts}
                                cancellingBookingId={
                                    cancelBookingMutation.isPending
                                        ? cancelBookingMutation.variables
                                            ?.bookingId ?? null
                                        : null
                                }
                                onCancel={(bookingId, payload) =>
                                    cancelBookingMutation.mutate({
                                        bookingId,
                                        payload,
                                    })
                                }
                                onEdit={(booking) => setEditingBooking(booking)}
                                onFilterChange={setActiveFilter}
                            />
                        )}
                    </Container>
                </Section>
            </main>

            <EditOpenBookingDialog
                isOpen={Boolean(editingBooking)}
                booking={editingBooking}
                isSubmitting={updateBookingMutation.isPending}
                onClose={() => setEditingBooking(null)}
                onSubmit={(payload) =>
                {
                    if (!editingBooking) {
                        return;
                    }

                    updateBookingMutation.mutate({
                        bookingId: editingBooking.id,
                        payload,
                    });
                }}
            />

            <Footer />
        </>
    );
};