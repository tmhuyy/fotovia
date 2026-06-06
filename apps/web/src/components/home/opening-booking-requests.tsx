"use client";

import Link from "next/link";
import
{
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import
{
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import type { BookingRequestRecord } from "../../features/booking/types/booking.types";
import { formatShootTypeLabel } from "../../features/booking/utils/booking-display";
import { bookingService } from "../../services/booking.service";
import { useAuthStore } from "../../store/auth.store";
import { Container } from "../layout/container";
import { BookingOwnerActionsMenu } from "../../features/booking/components/booking-owner-actions-menu";

type PublicBookingRequestRecord = BookingRequestRecord & {
    clientName?: string | null;
    clientFullName?: string | null;
    clientProfileName?: string | null;
    fullName?: string | null;
    applicationsCount?: number | null;
    applicationCount?: number | null;
    photographerApplicationsCount?: number | null;
    isOwner?: boolean | null;
    canManage?: boolean | null;
};

const MAX_VISIBLE_REQUESTS = 4;

interface IconProps
{
    className?: string;
}

const UserIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    </svg>
);

const CameraIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
        <path d="M12 15.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
    </svg>
);

const CalendarIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <path d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />
    </svg>
);

const LocationIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M12 21s7-5.1 7-11.2A7 7 0 0 0 5 9.8C5 15.9 12 21 12 21Z" />
        <path d="M12 12.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" />
    </svg>
);



const createBookingHref = (booking?: PublicBookingRequestRecord): string =>
{
    if (!booking) {
        return "/bookings/new";
    }

    const params = new URLSearchParams();
    const style = booking.shootType || booking.sessionType;

    if (style) {
        params.set("style", style);
    }

    if (booking.sessionDate) {
        params.set("date", booking.sessionDate);
    }

    if (booking.location) {
        params.set("location", booking.location);
    }

    const queryString = params.toString();

    return queryString ? `/bookings/new?${queryString}` : "/bookings/new";
};

const createOpeningDetailHref = (bookingId: string): string =>
{
    return `/bookings/${bookingId}`;
};

const getDisplayTitle = (booking: PublicBookingRequestRecord): string =>
{
    if (booking.title?.trim()) {
        return booking.title.trim();
    }

    return `${formatShootTypeLabel(booking.shootType || booking.sessionType)} photoshoot`;
};

const isBookingOwnedByCurrentUser = (
    booking: PublicBookingRequestRecord,
    currentUser?: { id?: string; email?: string } | null,
): boolean =>
{
    if (booking.isOwner === true) {
        return true;
    }

    const currentUserId = currentUser?.id?.trim();
    const currentUserEmail = currentUser?.email?.trim().toLowerCase();
    const bookingClientEmail = booking.clientEmail?.trim().toLowerCase();

    if (currentUserId && booking.clientUserId === currentUserId) {
        return true;
    }

    if (currentUserEmail && bookingClientEmail) {
        return currentUserEmail === bookingClientEmail;
    }

    return false;
};

const getClientLabel = (
    booking: PublicBookingRequestRecord,
    currentUser?: { id?: string; email?: string; fullName?: string } | null,
): string =>
{
    const directName =
        booking.clientName ||
        booking.clientFullName ||
        booking.clientProfileName ||
        booking.fullName;

    if (directName?.trim()) {
        return directName.trim();
    }

    if (
        isBookingOwnedByCurrentUser(booking, currentUser) &&
        currentUser?.fullName?.trim()
    ) {
        return currentUser.fullName.trim();
    }

    return "Client";
};

const parseDate = (value?: string | null): Date | null =>
{
    if (!value?.trim()) {
        return null;
    }

    const parsedDate = new Date(value.includes("T") ? value : `${value}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate;
};

const formatSubmittedDate = (value?: string | null): string =>
{
    const parsedDate = parseDate(value);

    if (!parsedDate) {
        return "recently";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
    }).format(parsedDate);
};

const formatPhotoshootDate = (value?: string | null): string =>
{
    const parsedDate = parseDate(value);

    if (!parsedDate) {
        return "Select date";
    }

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(parsedDate);
};

const formatFotoviaBudget = (value?: string | null): string =>
{
    if (!value?.trim()) {
        return "Select budget";
    }

    const parts = value
        .split("-")
        .map((part) => Number(part.replace(/[^\d]/g, "")))
        .filter((part) => Number.isFinite(part) && part > 0);

    const fromValue = parts[0];

    if (typeof fromValue !== "number") {
        return value;
    }

    const toValue = parts[1] ?? fromValue;

    const formatter = new Intl.NumberFormat("vi-VN");
    const from = formatter.format(fromValue);
    const to = formatter.format(toValue);

    return `${from} VND - ${to} VND`;
};

const getServiceChips = (booking: PublicBookingRequestRecord): string[] =>
{
    const source = `${booking.notes ?? ""} ${booking.inspiration ?? ""}`.toLowerCase();
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

    return chips;
};

const getApplicationCount = (booking: PublicBookingRequestRecord): number =>
{
    return (
        booking.photographerApplicationsCount ??
        booking.applicationsCount ??
        booking.applicationCount ??
        0
    );
};

const InfoRow = ({
    icon,
    children,
}: {
    icon: ReactNode;
    children: ReactNode;
}) => (
    <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3 text-[0.95rem] leading-6 text-foreground">
        <span className="mt-1 text-muted">{icon}</span>
        <div className="min-w-0">{children}</div>
    </div>
);

const OpeningBookingRequestsSkeleton = () =>
{
    return (
        <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="h-52 animate-pulse rounded-[1.75rem] border border-border bg-surface"
                />
            ))}
        </div>
    );
};

const OpeningBookingRequestCard = ({
    booking,
    currentUser,
    isCancelling,
    onCancel,
}: {
    booking: PublicBookingRequestRecord;
    currentUser?: { id?: string; email?: string; fullName?: string } | null;
    isCancelling: boolean;
    onCancel: (bookingId: string) => void;
}) =>
{
    const shootType = formatShootTypeLabel(booking.shootType || booking.sessionType);
    const serviceChips = getServiceChips(booking);
    const applicationCount = getApplicationCount(booking);
    const isOwnedBooking = isBookingOwnedByCurrentUser(booking, currentUser);

    return (
        <article className="relative rounded-[1.75rem] border border-border bg-surface px-5 py-5 shadow-[0_18px_50px_rgba(23,23,23,0.06)] transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_22px_60px_rgba(23,23,23,0.08)] sm:px-6 sm:py-6">
            <Link
                href={createOpeningDetailHref(booking.id)}
                className="absolute inset-0 z-0 rounded-[1.75rem]"
                aria-label={`View ${getDisplayTitle(booking)}`}
            />

            <div className="relative z-10 pointer-events-none space-y-4">
                <div className="flex min-w-0 items-start justify-between gap-4 mb-0">
                    <h3 className="min-w-0 flex-1 truncate text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                        {getDisplayTitle(booking)}
                    </h3>

                    {isOwnedBooking ? (
                        <BookingOwnerActionsMenu
                            bookingId={booking.id}
                            isCancelling={isCancelling}
                            onCancel={() => onCancel(booking.id)}
                        />
                    ) : (
                        <span className="h-9 w-12 shrink-0" aria-hidden="true" />
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-0">
                    <InfoRow icon={<UserIcon />}>
                        <span className="font-semibold">
                            {getClientLabel(booking, currentUser)}
                        </span>
                        <span className="mx-1.5 text-muted">·</span>
                        <span className="text-muted">
                            {formatSubmittedDate(booking.createdAt)}
                        </span>
                    </InfoRow>

                    <span className="w-fit rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5 text-sm font-semibold text-foreground">
                        Looking for photographer
                    </span>
                </div>

                <InfoRow icon={<CameraIcon />}>
                    <span className="font-medium">{shootType}</span>
                    <span className="mx-1.5 text-muted">·</span>
                    <span>Flexible time</span>

                    {applicationCount > 0 ? (
                        <>
                            <span className="mx-1.5 text-muted">·</span>
                            <span className="font-medium text-accent">
                                {applicationCount}{" "}
                                {applicationCount === 1 ? "application" : "applications"}
                            </span>
                        </>
                    ) : null}
                </InfoRow>

                <div className="space-y-2.5">

                    <InfoRow icon={<CalendarIcon />}>
                        <span>{formatPhotoshootDate(booking.sessionDate)}</span>
                    </InfoRow>

                    <InfoRow icon={<LocationIcon />}>
                        <span className="break-words">{booking.location}</span>
                    </InfoRow>
                </div>

                {serviceChips.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {serviceChips.map((chip) => (
                            <span
                                key={chip}
                                className="rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted"
                            >
                                {chip}
                            </span>
                        ))}
                    </div>
                ) : null}

                <p className="text-[1.15rem] font-semibold leading-tight tracking-[0.02em] text-accent">
                    {formatFotoviaBudget(booking.budget)}
                </p>
            </div>
        </article>
    );
};

interface OpeningBookingRequestsProps
{
    variant?: "home" | "page";
    limit?: number;
    maxVisibleRequests?: number;
    showBookNowCta?: boolean;
    title?: string;
    subtitle?: string;
}

export const OpeningBookingRequests = ({
    variant = "home",
    limit = 6,
    maxVisibleRequests = MAX_VISIBLE_REQUESTS,
    showBookNowCta = true,
    title,
    subtitle,
}: OpeningBookingRequestsProps) =>
{
    const queryClient = useQueryClient();
    const { user, isAuthenticated, hasHydrated, isHydrating } = useAuthStore();

    const isPhotographer =
        hasHydrated &&
        !isHydrating &&
        isAuthenticated &&
        user?.role === "photographer";

    const sectionTitle =
        title ?? "Open Photoshoot Requests"


    const sectionSubtitle =
        subtitle ??
        (isPhotographer
            ? "Review available client briefs and apply to the photoshoots that fit your portfolio."
            : undefined);

    const openBookingsQuery = useQuery({
        queryKey: ["opening-booking-requests", variant, limit],
        queryFn: () =>
            bookingService.getOpenBookingFeed({ limit }) as Promise<
                PublicBookingRequestRecord[]
            >,
        retry: false,
    });

    const cancelBookingMutation = useMutation({
        mutationFn: (bookingId: string) =>
            bookingService.cancelMyClientBooking(bookingId),
        onSuccess: async () =>
        {
            toast.success("Booking cancelled", {
                description:
                    "Your photoshoot request was removed from the upcoming list.",
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["opening-booking-requests"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["client-bookings"],
                }),
            ]);
        },
        onError: () =>
        {
            toast.error("We couldn’t cancel this booking", {
                description: "Please try again in a moment.",
            });
        },
    });

    const bookings = useMemo(() =>
    {
        return (openBookingsQuery.data ?? []).slice(0, maxVisibleRequests);
    }, [maxVisibleRequests, openBookingsQuery.data]);

    const shouldShowBookNowCta = showBookNowCta && !isPhotographer;
    const shouldShowViewAllCta = variant === "home";

    return (
        <section
            className={
                variant === "page"
                    ? "pb-8 pt-0"
                    : "pb-14 pt-8 sm:pb-16 sm:pt-10"
            }
        >
            <Container size="wide">
                <div className="space-y-8">
                    <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center sm:items-center">

                        <h2 className="font-display text-4xl leading-tight tracking-[-0.03em] text-foreground sm:text-5xl">
                            {sectionTitle}
                        </h2>

                    </div>

                    {openBookingsQuery.isLoading ? (
                        <OpeningBookingRequestsSkeleton />
                    ) : openBookingsQuery.isError ? (
                        <div className="rounded-[1.75rem] border border-border bg-surface p-6 text-center text-sm text-muted">
                            We could not load upcoming photoshoots right now.
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="rounded-[1.75rem] border border-border bg-surface p-8 text-center shadow-[0_18px_50px_rgba(23,23,23,0.06)]">
                            <h3 className="font-display text-3xl text-foreground">
                                No open photoshoots yet.
                            </h3>

                            <p className="mt-2 text-sm text-muted">
                                Once a client sends an open booking brief, it
                                will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {bookings.map((booking) => (
                                <OpeningBookingRequestCard
                                    key={booking.id}
                                    booking={booking}
                                    currentUser={user}
                                    isCancelling={
                                        cancelBookingMutation.isPending &&
                                        cancelBookingMutation.variables === booking.id
                                    }
                                    onCancel={(bookingId) =>
                                        cancelBookingMutation.mutate(bookingId)
                                    }
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        {shouldShowViewAllCta ? (
                            <Link
                                href="/bookings/open"
                                className="inline-flex min-w-[13rem] items-center justify-center rounded-2xl border border-border bg-surface px-8 py-4 text-base font-semibold tracking-[0.02em] text-foreground transition hover:border-accent hover:text-accent"
                            >
                                View all requests
                            </Link>
                        ) : null}

                        {shouldShowBookNowCta ? (
                            <Link
                                href={createBookingHref(bookings[0])}
                                className="inline-flex min-w-[13rem] items-center justify-center rounded-2xl bg-foreground px-8 py-4 text-base font-semibold tracking-[0.02em] text-background transition hover:opacity-90"
                            >
                                Book now
                            </Link>
                        ) : null}
                    </div>
                </div>
            </Container>
        </section>
    );
};