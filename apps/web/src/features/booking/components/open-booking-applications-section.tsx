"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import
    {
        useMutation,
        useQuery,
        useQueryClient,
    } from "@tanstack/react-query";
import { toast } from "sonner";

import { bookingService } from "../../../services/booking.service";
import type {
    BookingApplicationRecord,
    CreateBookingApplicationPayload,
    OpenBookingRequestRecord,
} from "../types/booking.types";
import { ApplyToPhotoshootModal } from "./apply-to-photoshoot-modal";

interface OpenBookingApplicationsSectionProps
{
    booking: OpenBookingRequestRecord;
    bookingId: string;
}

const formatPrice = (value: number): string =>
{
    return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
};

const getApplicationCount = (booking: OpenBookingRequestRecord): number =>
{
    return (
        booking.photographerApplicationsCount ??
        booking.applicationsCount ??
        booking.applicationCount ??
        0
    );
};

const getStatusLabel = (application: BookingApplicationRecord): string =>
{
    switch (application.status) {
        case "shortlisted":
            return "Shortlisted";
        case "selected":
            return "Selected";
        case "rejected":
            return "Rejected";
        case "withdrawn":
            return "Withdrawn";
        case "expired":
            return "Expired";
        case "submitted":
        default:
            return "Submitted";
    }
};

const ApplicationAvatar = ({
    application,
}: {
    application: BookingApplicationRecord;
}) =>
{
    const initials = application.photographerName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-semibold text-foreground">
            {application.photographerAvatarUrl ? (
                <img
                    src={application.photographerAvatarUrl}
                    alt={application.photographerName}
                    className="h-full w-full object-cover"
                />
            ) : (
                initials || "PH"
            )}
        </div>
    );
};

const ApplicationSummary = ({
    application,
}: {
    application: BookingApplicationRecord;
}) =>
{
    return (
        <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start gap-4">
                <ApplicationAvatar application={application} />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-foreground">
                                {application.photographerName}
                            </h3>

                            <p className="mt-1 text-sm text-muted">
                                {getStatusLabel(application)}
                            </p>
                        </div>

                        <p className="text-base font-semibold text-accent">
                            {formatPrice(application.proposedPrice)}
                        </p>
                    </div>

                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-foreground">
                        {application.message}
                    </p>

                    <div className="mt-4 rounded-2xl bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                            Included deliverables
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
                            {application.includedDeliverables}
                        </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                        {application.estimatedDuration ? (
                            <span className="rounded-full border border-border bg-background px-3 py-1.5">
                                Duration: {application.estimatedDuration}
                            </span>
                        ) : null}

                        <span className="rounded-full border border-border bg-background px-3 py-1.5">
                            {application.availableOnRequestedDate
                                ? "Available on requested date"
                                : "Availability not confirmed"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const OpenBookingApplicationsSection = ({
    booking,
    bookingId,
}: OpenBookingApplicationsSectionProps) =>
{
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const applicationCount = getApplicationCount(booking);
    const canViewApplications = Boolean(booking.canViewApplications);
    const hasApplied = Boolean(booking.hasApplied);

    const clientApplicationsQuery = useQuery({
        queryKey: ["client-booking-applications", bookingId],
        queryFn: () => bookingService.getMyClientBookingApplications(bookingId),
        enabled: canViewApplications && applicationCount > 0,
        retry: false,
    });

    const myApplicationQuery = useQuery({
        queryKey: ["my-open-booking-application", bookingId],
        queryFn: () => bookingService.getMyOpenBookingApplication(bookingId),
        enabled: hasApplied,
        retry: false,
    });

    const updateApplicationMutation = useMutation({
        mutationFn: (payload: CreateBookingApplicationPayload) =>
            bookingService.updateMyOpenBookingApplication(bookingId, payload),
        onSuccess: async () =>
        {
            toast.success("Application updated", {
                description: "Your proposal was updated successfully.",
            });

            setIsEditModalOpen(false);

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["my-open-booking-application", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["opening-booking-requests"],
                }),
            ]);
        },
        onError: () =>
        {
            toast.error("We couldn’t update your application", {
                description: "Please check your proposal and try again.",
            });
        },
    });

    const withdrawMutation = useMutation({
        mutationFn: () => bookingService.withdrawMyOpenBookingApplication(bookingId),
        onSuccess: async () =>
        {
            toast.success("Application withdrawn", {
                description:
                    "Your proposal was removed from this open photoshoot request.",
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["my-open-booking-application", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["opening-booking-requests"],
                }),
            ]);
        },
        onError: () =>
        {
            toast.error("We couldn’t withdraw your application", {
                description: "Please try again in a moment.",
            });
        },
    });

    const selectMutation = useMutation({
        mutationFn: (applicationId: string) =>
            bookingService.selectClientBookingApplication(
                bookingId,
                applicationId,
            ),
        onSuccess: async () =>
        {
            toast.success("Photographer selected", {
                description:
                    "This photoshoot is now assigned to the selected photographer.",
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["client-booking-applications", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["opening-booking-requests"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["client-bookings"],
                }),
            ]);

            router.push(`/my-bookings?bookingId=${bookingId}&selected=1`);
        },
        onError: () =>
        {
            toast.error("We couldn’t select this photographer", {
                description: "Please refresh the page and try again.",
            });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (applicationId: string) =>
            bookingService.rejectClientBookingApplication(
                bookingId,
                applicationId,
            ),
        onSuccess: async () =>
        {
            toast.success("Application rejected");

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["client-booking-applications", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["opening-booking-requests"],
                }),
            ]);
        },
        onError: () =>
        {
            toast.error("We couldn’t reject this application", {
                description: "Please try again in a moment.",
            });
        },
    });

    const myApplication = myApplicationQuery.data;
    const activeApplications = (clientApplicationsQuery.data ?? []).filter(
        (application) =>
            application.status !== "withdrawn" &&
            application.status !== "expired" &&
            application.status !== "rejected",
    );

    return (
        <section className="border-t border-border pt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                    Photographer applications{" "}
                    <span className="ml-1 rounded-full bg-accent/15 px-2 py-0.5 text-sm text-accent">
                        {applicationCount}
                    </span>
                </h2>
            </div>

            {applicationCount === 0 && !hasApplied ? (
                <div className="mt-5 rounded-2xl bg-background px-5 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">
                        No photographers have applied for this photoshoot yet.
                    </p>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                        Once photographers start applying, the customer can
                        review their proposals here.
                    </p>
                </div>
            ) : null}

            {hasApplied ? (
                <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Your application is submitted.
                                </p>

                                <p className="mt-1 text-sm leading-6 text-muted">
                                    The client can now review your proposal. You
                                    can still edit or withdraw it while it is not
                                    selected.
                                </p>
                            </div>

                            <span className="w-fit rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">
                                {booking.myApplicationStatus ?? "submitted"}
                            </span>
                        </div>
                    </div>

                    {myApplicationQuery.isLoading ? (
                        <div className="h-40 animate-pulse rounded-2xl bg-background" />
                    ) : myApplication ? (
                        <>
                            <ApplicationSummary application={myApplication} />

                            {myApplication.status === "submitted" ||
                                myApplication.status === "shortlisted" ? (
                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
                                    >
                                        Edit application
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                        {
                                            const confirmed = window.confirm(
                                                "Withdraw this application?",
                                            );

                                            if (confirmed) {
                                                withdrawMutation.mutate();
                                            }
                                        }}
                                        disabled={withdrawMutation.isPending}
                                        className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-surface px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {withdrawMutation.isPending
                                            ? "Withdrawing..."
                                            : "Withdraw"}
                                    </button>
                                </div>
                            ) : null}
                        </>
                    ) : null}

                    <ApplyToPhotoshootModal
                        isOpen={isEditModalOpen}
                        isSubmitting={updateApplicationMutation.isPending}
                        onClose={() => setIsEditModalOpen(false)}
                        onSubmit={(payload) =>
                            updateApplicationMutation.mutate(payload)
                        }
                        initialApplication={myApplication}
                        title="Edit application"
                        submitLabel="Save changes"
                        submittingLabel="Saving..."
                    />
                </div>
            ) : null}

            {canViewApplications && applicationCount > 0 ? (
                <div className="mt-5 space-y-4">
                    {clientApplicationsQuery.isLoading ? (
                        <>
                            <div className="h-44 animate-pulse rounded-2xl bg-background" />
                            <div className="h-44 animate-pulse rounded-2xl bg-background" />
                        </>
                    ) : activeApplications.length > 0 ? (
                        activeApplications.map((application) => (
                            <div key={application.id} className="space-y-3">
                                <ApplicationSummary application={application} />

                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    {application.photographerSlug ? (
                                        <Link
                                            href={`/photographers/${application.photographerSlug}`}
                                            className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
                                        >
                                            View profile
                                        </Link>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            rejectMutation.mutate(application.id)
                                        }
                                        disabled={
                                            rejectMutation.isPending ||
                                            selectMutation.isPending
                                        }
                                        className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-muted transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Reject
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                        {
                                            const confirmed = window.confirm(
                                                `Choose ${application.photographerName} as the main photographer for this photoshoot?`,
                                            );

                                            if (confirmed) {
                                                selectMutation.mutate(
                                                    application.id,
                                                );
                                            }
                                        }}
                                        disabled={
                                            rejectMutation.isPending ||
                                            selectMutation.isPending
                                        }
                                        className="inline-flex items-center justify-center rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {selectMutation.isPending
                                            ? "Choosing..."
                                            : "Choose photographer"}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl bg-background px-5 py-8 text-center text-sm leading-6 text-muted">
                            No active applications are available right now.
                        </div>
                    )}
                </div>
            ) : null}

            {!canViewApplications && applicationCount > 0 && !hasApplied ? (
                <div className="mt-5 rounded-2xl bg-background px-5 py-5 text-center text-sm leading-6 text-muted">
                    Only the customer can view the full list of photographer
                    applications for this photoshoot.
                </div>
            ) : null}
        </section>
    );
};