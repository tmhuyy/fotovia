"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import
{
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ConfirmActionDialog } from "../../../components/common/confirm-action-dialog";
import { bookingService } from "../../../services/booking.service";
import type {
    BookingApplicationRecord,
    CreateBookingApplicationPayload,
    OpenBookingRequestRecord,
} from "../types/booking.types";
import { ApplyToPhotoshootModal } from "./apply-to-photoshoot-modal";
import
{
    getApplicationDeliverableLabels,
    getApplicationServiceLabels,
} from "../utils/application-deliverables";

interface OpenBookingApplicationsSectionProps
{
    booking: OpenBookingRequestRecord;
    bookingId: string;
}

const formatPrice = (value: number): string =>
{
    return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
};

const formatAppliedDate = (value?: string | null): string =>
{
    if (!value) {
        return "Applied just now";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Applied just now";
    }

    return `Applied ${new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
    }).format(parsedDate)}`;
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

const getApplicationServiceChips = (
    application: BookingApplicationRecord,
): string[] =>
{
    const source = `${application.message} ${application.includedDeliverables}`.toLowerCase();
    const chips: string[] = [];

    if (
        source.includes("make") ||
        source.includes("hair") ||
        source.includes("tóc") ||
        source.includes("trang điểm")
    ) {
        chips.push("Make-up + hair styling");
    }

    if (source.includes("studio")) {
        chips.push("Studio rental");
    }

    if (chips.length === 0 && application.availableOnRequestedDate) {
        chips.push("Available on requested date");
    }

    return chips;
};

const ApplicationAvatar = ({
    application,
    className = "h-12 w-12",
}: {
    application: BookingApplicationRecord;
    className?: string;
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
        <div
            className={[
                "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-semibold text-foreground",
                className,
            ].join(" ")}
        >
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

const ProfileIdentity = ({
    application,
    avatarClassName,
}: {
    application: BookingApplicationRecord;
    avatarClassName?: string;
}) =>
{
    const content = (
        <div className="group flex min-w-0 items-center gap-4">
            <ApplicationAvatar
                application={application}
                className={avatarClassName}
            />

            <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-foreground transition group-hover:text-accent">
                    {application.photographerName}
                </h3>

                <p className="mt-1 text-sm text-muted">
                    {getStatusLabel(application)}
                </p>
            </div>
        </div>
    );

    if (!application.photographerSlug) {
        return content;
    }

    return (
        <Link
            href={`/photographers/${application.photographerSlug}`}
            className="block min-w-0"
            onClick={(event) => event.stopPropagation()}
        >
            {content}
        </Link>
    );
};

const ApplicationMeta = ({
    application,
}: {
    application: BookingApplicationRecord;
}) =>
{
    const deliverableLabels = getApplicationDeliverableLabels(
        application.includedDeliverables,
    );

    return (
        <div className="mt-4 space-y-1.5 text-sm leading-6 text-foreground">
            <p>
                Shooting duration:{" "}
                <span className="font-semibold">
                    {application.estimatedDuration || "Not specified"}
                </span>
            </p>

            {deliverableLabels
                .filter(
                    (label) =>
                        label.toLowerCase() ===
                        "all original photos provided.",
                )
                .map((label) => (
                    <p key={label}>{label}</p>
                ))}

            <p>
                Availability:{" "}
                <span className="font-semibold">
                    {application.availableOnRequestedDate
                        ? "Available on requested date"
                        : "Not confirmed"}
                </span>
            </p>
        </div>
    );
};

const ApplicationChips = ({
    application,
}: {
    application: BookingApplicationRecord;
}) =>
{
    const chips = getApplicationServiceLabels(application.includedDeliverables);

    if (chips.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
                <span
                    key={chip}
                    className="rounded-full bg-accent/15 px-3 py-1.5 text-sm font-medium text-foreground"
                >
                    {chip}
                </span>
            ))}
        </div>
    );
};

interface ApplicationProposalCardProps
{
    application: BookingApplicationRecord;
    mode: "review" | "submitted" | "readonly";
    isChoosing?: boolean;
    isWithdrawing?: boolean;
    canManage?: boolean;
    onReview?: () => void;
    onChoose?: () => void;
    onEdit?: () => void;
    onWithdraw?: () => void;
}

const ApplicationProposalCard = ({
    application,
    mode,
    isChoosing = false,
    isWithdrawing = false,
    canManage = false,
    onReview,
    onChoose,
    onEdit,
    onWithdraw,
}: ApplicationProposalCardProps) =>
{
    const isInteractive = mode === "review" && Boolean(onReview);
    const priceLabel = formatPrice(application.proposedPrice);

    return (
        <article
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={isInteractive ? onReview : undefined}
            onKeyDown={
                isInteractive
                    ? (event) =>
                    {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onReview?.();
                        }
                    }
                    : undefined
            }
            className={[
                "rounded-[1.75rem] border border-border bg-background/70 p-5 transition sm:p-6",
                isInteractive
                    ? "cursor-pointer hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_18px_50px_rgba(23,23,23,0.08)] focus:outline-none focus:ring-2 focus:ring-accent/30"
                    : "",
            ].join(" ")}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <ProfileIdentity
                    application={application}
                    avatarClassName="h-16 w-16"
                />

                <span className="w-fit rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">
                    {getStatusLabel(application)}
                </span>
            </div>

            <ApplicationMeta application={application} />
            <ApplicationChips application={application} />

            <div className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm leading-6 text-foreground">
                {application.message}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xl font-semibold tracking-[0.02em] text-accent">
                        {priceLabel}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                        {formatAppliedDate(application.createdAt)}
                    </p>
                </div>

                {mode === "review" ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={(event) =>
                            {
                                event.stopPropagation();
                                onReview?.();
                            }}
                            className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
                        >
                            Review details
                        </button>

                        <button
                            type="button"
                            onClick={(event) =>
                            {
                                event.stopPropagation();
                                onChoose?.();
                            }}
                            disabled={isChoosing}
                            className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isChoosing ? "Choosing..." : "Choose"}
                        </button>
                    </div>
                ) : null}

                {mode === "submitted" && canManage ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
                        >
                            Edit application
                        </button>

                        <button
                            type="button"
                            onClick={onWithdraw}
                            disabled={isWithdrawing}
                            className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-rose-200 bg-surface px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                        </button>
                    </div>
                ) : null}
            </div>
        </article>
    );
};

const ApplicationFullDetails = ({
    application,
}: {
    application: BookingApplicationRecord;
}) =>
{
    return (
        <ApplicationProposalCard application={application} mode="readonly" />
    );
};

const ApplicationReviewDialog = ({
    application,
    isRejecting,
    isChoosing,
    onClose,
    onReject,
    onChoose,
}: {
    application: BookingApplicationRecord | null;
    isRejecting: boolean;
    isChoosing: boolean;
    onClose: () => void;
    onReject: (application: BookingApplicationRecord) => void;
    onChoose: (application: BookingApplicationRecord) => void;
}) =>
{
    useEffect(() =>
    {
        if (!application) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape" && !isRejecting && !isChoosing) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [application, isChoosing, isRejecting, onClose]);

    if (!application) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[75] overflow-y-auto bg-foreground/40 px-4 py-4 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close application review"
                className="fixed inset-0 cursor-default"
                onClick={() =>
                {
                    if (!isRejecting && !isChoosing) {
                        onClose();
                    }
                }}
            />

            <div className="relative z-10 flex min-h-full items-end justify-center sm:items-center">
                <div className="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-border bg-surface shadow-2xl">
                    <div className="shrink-0 border-b border-border px-5 py-5 sm:px-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-display text-3xl tracking-[-0.03em] text-foreground">
                                    Review proposal
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Check the photographer’s message, proposed
                                    price, and included deliverables before
                                    making a decision.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isRejecting || isChoosing}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-xl text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Close application review"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                        <ApplicationFullDetails application={application} />
                    </div>

                    <div className="shrink-0 border-t border-border bg-surface px-5 py-4 sm:px-7">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => onReject(application)}
                                disabled={isRejecting || isChoosing}
                                className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-rose-200 bg-surface px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isRejecting ? "Rejecting..." : "Reject"}
                            </button>

                            <button
                                type="button"
                                onClick={() => onChoose(application)}
                                disabled={isRejecting || isChoosing}
                                className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isChoosing
                                    ? "Choosing..."
                                    : "Choose photographer"}
                            </button>
                        </div>
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
    const [isWithdrawConfirmOpen, setIsWithdrawConfirmOpen] = useState(false);
    const [reviewingApplication, setReviewingApplication] =
        useState<BookingApplicationRecord | null>(null);
    const [selectingApplication, setSelectingApplication] =
        useState<BookingApplicationRecord | null>(null);
    const [rejectingApplication, setRejectingApplication] =
        useState<BookingApplicationRecord | null>(null);

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
        mutationFn: () =>
            bookingService.withdrawMyOpenBookingApplication(bookingId),
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

            setReviewingApplication(null);
            setSelectingApplication(null);

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

            router.push(`/bookings/${bookingId}`);
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

            setReviewingApplication(null);
            setRejectingApplication(null);

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

    const canManageMyApplication =
        myApplication?.status === "submitted" ||
        myApplication?.status === "shortlisted";

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
                    {myApplicationQuery.isLoading ? (
                        <div className="h-56 animate-pulse rounded-[1.75rem] bg-background" />
                    ) : myApplication ? (
                        <ApplicationProposalCard
                            application={myApplication}
                            mode="submitted"
                            canManage={canManageMyApplication}
                            isWithdrawing={withdrawMutation.isPending}
                            onEdit={() => setIsEditModalOpen(true)}
                            onWithdraw={() => setIsWithdrawConfirmOpen(true)}
                        />
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
                            <div className="h-56 animate-pulse rounded-[1.75rem] bg-background" />
                            <div className="h-56 animate-pulse rounded-[1.75rem] bg-background" />
                        </>
                    ) : activeApplications.length > 0 ? (
                        activeApplications.map((application) => (
                            <ApplicationProposalCard
                                key={application.id}
                                application={application}
                                mode="review"
                                isChoosing={
                                    selectMutation.isPending &&
                                    selectingApplication?.id === application.id
                                }
                                onReview={() =>
                                    setReviewingApplication(application)
                                }
                                onChoose={() =>
                                    setSelectingApplication(application)
                                }
                            />
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

            <ApplicationReviewDialog
                application={reviewingApplication}
                isRejecting={rejectMutation.isPending}
                isChoosing={selectMutation.isPending}
                onClose={() => setReviewingApplication(null)}
                onReject={(application) => setRejectingApplication(application)}
                onChoose={(application) => setSelectingApplication(application)}
            />

            <ConfirmActionDialog
                isOpen={isWithdrawConfirmOpen}
                title="Withdraw application?"
                description="Your proposal will be removed from this open photoshoot request. You can apply again later if the request is still open."
                confirmLabel="Withdraw application"
                tone="danger"
                isPending={withdrawMutation.isPending}
                onCancel={() => setIsWithdrawConfirmOpen(false)}
                onConfirm={() =>
                {
                    withdrawMutation.mutate();
                    setIsWithdrawConfirmOpen(false);
                }}
            />

            <ConfirmActionDialog
                isOpen={Boolean(rejectingApplication)}
                title="Reject application?"
                description={
                    rejectingApplication
                        ? `Reject ${rejectingApplication.photographerName}'s proposal for this photoshoot? This will remove it from your active application list.`
                        : ""
                }
                confirmLabel="Reject application"
                tone="danger"
                isPending={rejectMutation.isPending}
                onCancel={() => setRejectingApplication(null)}
                onConfirm={() =>
                {
                    if (rejectingApplication) {
                        rejectMutation.mutate(rejectingApplication.id);
                    }
                }}
            />

            <ConfirmActionDialog
                isOpen={Boolean(selectingApplication)}
                title="Choose photographer?"
                description={
                    selectingApplication
                        ? `You are about to assign ${selectingApplication.photographerName} as the main photographer for this photoshoot. After this action, the request will be confirmed and removed from the open booking list.`
                        : ""
                }
                confirmLabel="Choose photographer"
                isPending={selectMutation.isPending}
                onCancel={() => setSelectingApplication(null)}
                onConfirm={() =>
                {
                    if (selectingApplication) {
                        selectMutation.mutate(selectingApplication.id);
                    }
                }}
            />
        </section>
    );
};