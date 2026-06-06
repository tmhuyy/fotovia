"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Button } from "../../../components/ui/button";
import { bookingService } from "../../../services/booking.service";
import { useAuthStore } from "../../../store/auth.store";
import type { OpenBookingRequestRecord } from "../types/booking.types";
import
    {
        formatBookingDate,
        formatBookingTime,
        formatBudgetLabel,
        formatShootTypeLabel,
    } from "../utils/booking-display";

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

const DocumentIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
    </svg>
);

const TagIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M20 13 13 20 4 11V4h7l9 9Z" />
        <path d="M7.5 7.5h.01" />
    </svg>
);

const ImageIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M5 5h14v14H5z" />
        <path d="m5 16 4-4 3 3 2-2 5 5" />
        <path d="M14.5 8.5h.01" />
    </svg>
);

const getBookingTitle = (booking: OpenBookingRequestRecord): string =>
{
    if (booking.title?.trim()) {
        return booking.title.trim();
    }

    return `${formatShootTypeLabel(booking.shootType || booking.sessionType)} photoshoot`;
};

const getClientName = (booking: OpenBookingRequestRecord): string =>
{
    return (
        booking.clientName ||
        booking.clientFullName ||
        booking.clientProfileName ||
        booking.fullName ||
        "Client"
    );
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

const formatDetailedDate = (value?: string | null): string =>
{
    const parsedDate = parseDate(value);

    if (!parsedDate) {
        return formatBookingDate(value);
    }

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(parsedDate);
};

const formatDeadline = (value?: string | null): string =>
{
    const parsedDate = parseDate(value);

    if (!parsedDate) {
        return "Deadline pending";
    }

    const deadlineDate = new Date(parsedDate);
    deadlineDate.setDate(deadlineDate.getDate() - 3);

    const label = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(deadlineDate);

    return `${label}, 23:59`;
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

const getServiceChips = (booking: OpenBookingRequestRecord): string[] =>
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

const isUrl = (value?: string | null): boolean =>
{
    if (!value?.trim()) {
        return false;
    }

    return /^https?:\/\//i.test(value.trim());
};

const InfoBlock = ({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: ReactNode;
}) => (
    <div className="grid gap-1.5">
        <div className="flex items-center gap-2 text-sm text-muted">
            <span className="text-accent">{icon}</span>
            <span>{label}</span>
        </div>

        <div className="text-base font-semibold leading-6 text-foreground">
            {value}
        </div>
    </div>
);

const DetailSkeleton = () =>
{
    return (
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(23,23,23,0.06)]">
            <div className="h-4 w-32 animate-pulse rounded-full bg-border" />
            <div className="mt-5 h-10 w-3/4 animate-pulse rounded-full bg-border" />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-20 animate-pulse rounded-2xl bg-background"
                    />
                ))}
            </div>
            <div className="mt-8 h-32 animate-pulse rounded-2xl bg-background" />
        </div>
    );
};

export const OpenBookingDetailPage = () =>
{
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    const bookingId = useMemo(() =>
    {
        const rawValue = params.bookingId;

        if (Array.isArray(rawValue)) {
            return rawValue[0] ?? "";
        }

        return rawValue ?? "";
    }, [params.bookingId]);

    const bookingQuery = useQuery({
        queryKey: ["open-booking-detail", bookingId],
        queryFn: () => bookingService.getOpenBookingDetail(bookingId),
        enabled: bookingId.length > 0,
        retry: false,
    });

    const booking = bookingQuery.data;
    const signInHref = `/sign-in?next=${encodeURIComponent(pathname)}`;

    const primaryCta = useMemo(() =>
    {
        if (!isAuthenticated) {
            return {
                label: "Sign in to apply",
                href: signInHref,
                disabled: false,
            };
        }

        if (user?.role === "photographer") {
            return {
                label: "Application flow coming soon",
                href: "#",
                disabled: true,
            };
        }

        return {
            label: "Start a similar booking",
            href: booking
                ? `/bookings/new?style=${encodeURIComponent(
                    booking.shootType || booking.sessionType,
                )}&date=${encodeURIComponent(
                    booking.sessionDate,
                )}&location=${encodeURIComponent(booking.location)}`
                : "/bookings/new",
            disabled: false,
        };
    }, [booking, isAuthenticated, signInHref, user?.role]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="py-10 sm:py-14">
                <Container size="wide">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-8 inline-flex items-center text-sm font-medium text-muted transition hover:text-foreground"
                    >
                        ← Back
                    </button>

                    {bookingQuery.isLoading ? (
                        <DetailSkeleton />
                    ) : bookingQuery.isError || !booking ? (
                        <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-surface p-8 text-center shadow-[0_18px_50px_rgba(23,23,23,0.06)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
                                Opening request
                            </p>

                            <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground">
                                This photoshoot is no longer available.
                            </h1>

                            <p className="mt-4 text-base leading-7 text-muted">
                                The client may have already chosen a photographer, or the request was removed.
                            </p>

                            <div className="mt-7">
                                <Button onClick={() => router.push("/")}>
                                    Go back home
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <section className="mx-auto max-w-4xl">
                            <div className="rounded-[2rem] border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(23,23,23,0.06)] sm:p-8">
                                <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h1 className="max-w-3xl font-display text-4xl leading-tight tracking-[-0.03em] text-foreground sm:text-5xl">
                                            {getBookingTitle(booking)}
                                        </h1>
                                    </div>

                                    <span className="w-fit rounded-full border border-accent/30 bg-accent/15 px-4 py-2 text-sm font-semibold text-foreground">
                                        Looking for photographer
                                    </span>
                                </div>

                                <div className="grid gap-6 py-7 md:grid-cols-2">
                                    <InfoBlock
                                        icon={<UserIcon />}
                                        label="Customer"
                                        value={getClientName(booking)}
                                    />

                                    <InfoBlock
                                        icon={<CalendarIcon />}
                                        label="Shooting date"
                                        value={formatDetailedDate(booking.sessionDate)}
                                    />

                                    <InfoBlock
                                        icon={<LocationIcon />}
                                        label="Location"
                                        value={booking.location}
                                    />

                                    <InfoBlock
                                        icon={<CameraIcon />}
                                        label="Shooting type"
                                        value={`${formatShootTypeLabel(
                                            booking.shootType || booking.sessionType,
                                        )} · ${formatBookingTime(booking.sessionTime)}`}
                                    />
                                </div>

                                <div className="space-y-6 border-t border-border pt-7">
                                    <section>
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <DocumentIcon className="h-4 w-4 text-accent" />
                                            <span>Photoshoot description</span>
                                        </div>

                                        <p className="mt-2 rounded-2xl bg-background px-4 py-4 text-base leading-7 text-foreground">
                                            {booking.concept || "No description was added."}
                                        </p>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <TagIcon className="h-4 w-4 text-accent" />
                                            <span>Request</span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {getServiceChips(booking).length > 0 ? (
                                                getServiceChips(booking).map((chip) => (
                                                    <span
                                                        key={chip}
                                                        className="rounded-full border border-accent/30 bg-accent/15 px-3 py-1.5 text-sm font-medium text-foreground"
                                                    >
                                                        {chip}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted">
                                                    No extra service requested
                                                </span>
                                            )}
                                        </div>
                                    </section>


                                    <div className="rounded-2xl bg-background px-4 py-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-sm font-medium text-muted">
                                                Expected cost
                                            </span>

                                            <span className="text-lg font-semibold tracking-[0.02em] text-accent">
                                                {formatBudgetLabel(booking.budget)}
                                            </span>
                                        </div>
                                    </div>

                                    <section className="border-t border-border pt-6">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <h2 className="text-lg font-semibold text-foreground">
                                                Photographer applications{" "}
                                                <span className="ml-1 rounded-full bg-accent/15 px-2 py-0.5 text-sm text-accent">
                                                    {getApplicationCount(booking)}
                                                </span>
                                            </h2>

                                        </div>

                                        <p className="mt-5 rounded-2xl bg-background px-4 py-4 text-center text-sm leading-6 text-muted">
                                            Only customers can view the full list of applications for their photoshoot.
                                        </p>

                                        <div className="mt-5 flex justify-center">
                                            {primaryCta.disabled ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="inline-flex min-w-[15rem] cursor-not-allowed items-center justify-center rounded-2xl bg-foreground/40 px-8 py-4 text-base font-semibold text-background"
                                                >
                                                    {primaryCta.label}
                                                </button>
                                            ) : (
                                                <Link
                                                    href={primaryCta.href}
                                                    className="inline-flex min-w-[15rem] items-center justify-center rounded-2xl bg-foreground px-8 py-4 text-base font-semibold text-background transition hover:opacity-90"
                                                >
                                                    {primaryCta.label}
                                                </Link>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </section>
                    )}
                </Container>
            </main>

            <Footer />
        </div>
    );
};