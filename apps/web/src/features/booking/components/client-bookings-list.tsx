import Link from "next/link";

import type {
    BookingRequestRecord,
    ClientBookingFilter,
} from "../types/booking.types";
import
    {
        formatBookingDate,
        formatBookingTime,
        formatBudgetLabel,
        formatShootTypeLabel,
        formatSubmittedAt,
        getBookingDisplayTitle,
        hasAssignedPhotographer,
    } from "../utils/booking-display";
import { BookingStatusPill } from "./booking-status-pill";

interface ClientBookingsListProps
{
    bookings: BookingRequestRecord[];
    activeFilter: ClientBookingFilter;
    counts: Record<ClientBookingFilter, number>;
    onFilterChange: (filter: ClientBookingFilter) => void;
}

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

const filterOptions: { value: ClientBookingFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "declined", label: "Declined" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
];

const getClientName = (booking: BookingRequestRecord): string =>
{
    return (
        booking.clientName ||
        booking.clientFullName ||
        booking.clientProfileName ||
        booking.fullName ||
        "Client"
    );
};

const getApplicationCount = (booking: BookingRequestRecord): number =>
{
    return (
        booking.photographerApplicationsCount ??
        booking.applicationsCount ??
        booking.applicationCount ??
        0
    );
};

const getServiceChips = (booking: BookingRequestRecord): string[] =>
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

export const ClientBookingsList = ({
    bookings,
    activeFilter,
    counts,
    onFilterChange,
}: ClientBookingsListProps) =>
{
    return (
        <div className="space-y-6">
            <div className=" ">
                

                <div className="mt-5 flex flex-wrap gap-2">
                    {filterOptions.map((option) =>
                    {
                        const isActive = option.value === activeFilter;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onFilterChange(option.value)}
                                className={[
                                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                                    isActive
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border bg-brand-background text-brand-primary hover:text-foreground",
                                ].join(" ")}
                            >
                                <span>{option.label}</span>
                                <span
                                    className={[
                                        "rounded-full px-2 py-0.5 text-xs",
                                        isActive
                                            ? "bg-background/15 text-background"
                                            : "bg-brand-background  text-foreground",
                                    ].join(" ")}
                                >
                                    {counts[option.value]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className=" p-8 text-center text-sm text-muted">
                    No matching results
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {bookings.map((booking) =>
                    {
                        const applicationCount = getApplicationCount(booking);
                        const serviceChips = getServiceChips(booking);
                        const hasPhotographer = hasAssignedPhotographer(booking);

                        return (
                            <Link
                                key={booking.id}
                                href={`/bookings/${booking.id}`}
                                className="group block rounded-[1.75rem] border border-border bg-surface px-5 py-5 shadow-[0_18px_50px_rgba(23,23,23,0.05)] transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_22px_60px_rgba(23,23,23,0.08)] sm:px-6 sm:py-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                                            {getBookingDisplayTitle(booking)}
                                        </h3>
                                        
                                    </div>

                                    <BookingStatusPill status={booking.status} />
                                </div>

                                <div className="mt-4 space-y-2.5">
                                    <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3 text-[0.95rem] leading-6 text-foreground">
                                        <span className="mt-1 text-muted">
                                            <UserIcon />
                                        </span>
                                        <div className="min-w-0">
                                            <span className="font-semibold">
                                                {getClientName(booking)}
                                            </span>
                                            <span className="mx-1.5 text-muted">
                                                ·
                                            </span>
                                            <span className="text-muted">
                                                {formatSubmittedAt(
                                                    booking.createdAt,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3 text-[0.95rem] leading-6 text-foreground">
                                        <span className="mt-1 text-muted">
                                            <CameraIcon />
                                        </span>
                                        <div>
                                            <span className="font-medium">
                                                {formatShootTypeLabel(
                                                    booking.shootType ||
                                                    booking.sessionType,
                                                )}
                                            </span>
                                            <span className="mx-1.5 text-muted">
                                                ·
                                            </span>
                                            <span>
                                                {formatBookingTime(
                                                    booking.sessionTime,
                                                )}
                                            </span>

                                            {applicationCount > 0 &&
                                                !hasPhotographer ? (
                                                <>
                                                    <span className="mx-1.5 text-muted">
                                                        ·
                                                    </span>
                                                    <span className="font-medium text-accent">
                                                        {applicationCount}{" "}
                                                        {applicationCount === 1
                                                            ? "application"
                                                            : "applications"}
                                                    </span>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3 text-[0.95rem] leading-6 text-foreground">
                                        <span className="mt-1 text-muted">
                                            <CalendarIcon />
                                        </span>
                                        <span>
                                            {formatBookingDate(
                                                booking.sessionDate,
                                            )}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3 text-[0.95rem] leading-6 text-foreground">
                                        <span className="mt-1 text-muted">
                                            <LocationIcon />
                                        </span>
                                        <span>
                                            {booking.location ||
                                                "Location not set"}
                                        </span>
                                    </div>
                                </div>

                                {serviceChips.length > 0 ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
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

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-[1.15rem] font-semibold leading-tight tracking-[0.02em] text-accent">
                                        {formatBudgetLabel(booking.budget)}
                                    </p>

                                    <span className="text-sm font-semibold text-muted transition group-hover:text-accent">
                                        View details →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};