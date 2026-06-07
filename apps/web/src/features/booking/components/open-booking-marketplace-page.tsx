"use client";

import Link from "next/link";
import
{
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import
{
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { bookingService } from "../../../services/booking.service";
import { Container } from "../../../components/layout/container";
import { useAuthStore } from "../../../store/auth.store";
import
{
    formatBookingTime,
    formatShootTypeLabel,
} from "../utils/booking-display";
import type {
    CancelBookingPayload,
    OpenBookingMarketplaceQuery,
    OpenBookingRequestRecord,
    OpenBookingSort,
    UpdateOpenBookingPayload,
} from "../types/booking.types";
import { BookingPagination } from "./dashboard/booking-pagination";
import { BookingOwnerActionsMenu } from "./booking-owner-actions-menu";
import { EditOpenBookingDialog } from "./edit-open-booking-dialog";
import
{
    OPEN_BOOKING_DEFAULT_FILTERS,
    OpenBookingFilterPanel,
    SORT_LABELS,
    SORT_OPTIONS_FOR_OPEN_BOOKING,
    type OpenBookingFilterState,
} from "./open-booking-filter-panel";

interface IconProps
{
    className?: string;
}

interface SearchParamReader
{
    get: (name: string) => string | null;
}

type CurrentUserLike = {
    id?: string;
    email?: string;
    fullName?: string;
} | null;

type PublicOpenBookingRecord = OpenBookingRequestRecord & {
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

const FilterIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
    >
        <path d="M4 5h16l-6.5 7.4v4.2L10.5 19v-6.6L4 5Z" />
    </svg>
);

const SortIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
    >
        <path d="M4 7h11" />
        <path d="M4 12h8" />
        <path d="M4 17h5" />
    </svg>
);

const ChevronDownIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);

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

const getBookingTitle = (booking: PublicOpenBookingRecord): string =>
{
    if (booking.title?.trim()) {
        return booking.title.trim();
    }

    return `${formatShootTypeLabel(
        booking.shootType || booking.sessionType,
    )} photoshoot`;
};

const isBookingOwnedByCurrentUser = (
    booking: PublicOpenBookingRecord,
    currentUser: CurrentUserLike,
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

const getClientName = (
    booking: PublicOpenBookingRecord,
    currentUser: CurrentUserLike,
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

const getApplicationCount = (booking: PublicOpenBookingRecord): number =>
{
    return (
        booking.photographerApplicationsCount ??
        booking.applicationsCount ??
        booking.applicationCount ??
        0
    );
};

const parseDate = (value?: string | null): Date | null =>
{
    if (!value?.trim()) {
        return null;
    }

    const parsedDate = new Date(
        value.includes("T") ? value : `${value}T00:00:00`,
    );

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

const getServiceChips = (booking: PublicOpenBookingRecord): string[] =>
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

const parseMoneyFromSearch = (value: string | null): number | undefined =>
{
    if (!value?.trim()) {
        return undefined;
    }

    const parsed = Number(value.replace(/[^\d]/g, ""));

    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const formatMoneyInput = (value: string): string =>
{
    const digits = value.replace(/[^\d]/g, "");

    if (!digits) {
        return "";
    }

    return new Intl.NumberFormat("vi-VN").format(Number(digits));
};

const parseSort = (value: string | null): OpenBookingSort =>
{
    if (
        value === "earliest" ||
        value === "most_applications" ||
        value === "budget_low" ||
        value === "budget_high"
    ) {
        return value;
    }

    return "newest";
};

const parseFiltersFromSearch = (
    searchParams: SearchParamReader,
): OpenBookingFilterState =>
{
    const rawShootTypes = searchParams.get("shootTypes");
    const rawServices = searchParams.get("services");

    return {
        shootTypes: rawShootTypes
            ? rawShootTypes
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        location: searchParams.get("location") ?? "",
        dateFrom: searchParams.get("dateFrom") ?? "",
        dateTo: searchParams.get("dateTo") ?? "",
        budgetFrom: searchParams.get("budgetFrom")
            ? formatMoneyInput(searchParams.get("budgetFrom") ?? "")
            : "",
        budgetTo: searchParams.get("budgetTo")
            ? formatMoneyInput(searchParams.get("budgetTo") ?? "")
            : "",
        services:
            rawServices === "with" || rawServices === "without"
                ? rawServices
                : "all",
        sort: parseSort(searchParams.get("sort")),
    };
};

const buildQueryOptions = (
    filters: OpenBookingFilterState,
    page: number,
): OpenBookingMarketplaceQuery =>
{
    return {
        page,
        pageSize: 8,
        shootTypes: filters.shootTypes,
        location: filters.location || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        budgetFrom: parseMoneyFromSearch(filters.budgetFrom),
        budgetTo: parseMoneyFromSearch(filters.budgetTo),
        services: filters.services,
        sort: filters.sort,
    };
};

const OpenBookingCard = ({
    booking,
    currentUser,
    isCancelling,
    onCancel,
    onEdit,
}: {
    booking: PublicOpenBookingRecord;
    currentUser: CurrentUserLike;
    isCancelling: boolean;
    onCancel: (bookingId: string, payload: CancelBookingPayload) => void;
    onEdit: (booking: PublicOpenBookingRecord) => void;
}) =>
{
    const shootType = formatShootTypeLabel(
        booking.shootType || booking.sessionType,
    );
    const serviceChips = getServiceChips(booking);
    const applicationCount = getApplicationCount(booking);
    const isOwnedBooking = isBookingOwnedByCurrentUser(booking, currentUser);

    return (
        <article className="relative rounded-[1.75rem] border border-border bg-surface px-5 py-5 shadow-[0_18px_50px_rgba(23,23,23,0.06)] transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_22px_60px_rgba(23,23,23,0.08)] sm:px-6 sm:py-6">
            <Link
                href={`/bookings/${booking.id}`}
                className="absolute inset-0 z-0 rounded-[1.75rem]"
                aria-label={`View ${getBookingTitle(booking)}`}
            />

            <div className="pointer-events-none relative z-10 space-y-4">
                <div className="mb-0 flex min-w-0 items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-baseline gap-2">
                        <h3 className="min-w-0 truncate text-[1.35rem] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                            {getBookingTitle(booking)}
                        </h3>

                        {/* <span className="shrink-0 text-sm text-muted">
                            #{booking.id.slice(0, 7)}
                        </span> */}
                    </div>

                    {isOwnedBooking ? (
                        <BookingOwnerActionsMenu
                            bookingId={booking.id}
                            isCancelling={isCancelling}
                            canEdit={applicationCount === 0}
                            onCancel={(payload) => onCancel(booking.id, payload)}
                            onEdit={() => onEdit(booking)}
                        />
                    ) : (
                        <span className="h-9 w-12 shrink-0" aria-hidden="true" />
                    )}
                </div>

                <div className="mb-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <InfoRow icon={<UserIcon />}>
                        <span className="font-semibold">
                            {getClientName(booking, currentUser)}
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
                    <span>{formatBookingTime(booking.sessionTime)}</span>

                    {applicationCount > 0 ? (
                        <>
                            <span className="mx-1.5 text-muted">·</span>
                            <span className="font-medium text-accent">
                                {applicationCount}{" "}
                                {applicationCount === 1
                                    ? "application"
                                    : "applications"}
                            </span>
                        </>
                    ) : null}
                </InfoRow>

                <div className="space-y-2.5">
                    <InfoRow icon={<CalendarIcon />}>
                        <span>{formatPhotoshootDate(booking.sessionDate)}</span>
                    </InfoRow>

                    <InfoRow icon={<LocationIcon />}>
                        <span className="break-words">
                            {booking.location || "No location added"}
                        </span>
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

export const OpenBookingMarketplacePage = () =>
{
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const { user } = useAuthStore();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editingBooking, setEditingBooking] =
        useState<PublicOpenBookingRecord | null>(null);

    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);

    const appliedFilters = useMemo(() =>
    {
        return parseFiltersFromSearch(searchParams);
    }, [searchParams]);

    const [draftFilters, setDraftFilters] = useState(appliedFilters);

    useEffect(() =>
    {
        setDraftFilters(appliedFilters);
    }, [appliedFilters]);

    const pushFiltersToUrl = (
        filters: OpenBookingFilterState,
        nextPage = 1,
    ) =>
    {
        const params = new URLSearchParams();

        if (nextPage > 1) {
            params.set("page", String(nextPage));
        }

        if (filters.shootTypes.length > 0) {
            params.set("shootTypes", filters.shootTypes.join(","));
        }

        if (filters.location) {
            params.set("location", filters.location);
        }

        if (filters.dateFrom) {
            params.set("dateFrom", filters.dateFrom);
        }

        if (filters.dateTo) {
            params.set("dateTo", filters.dateTo);
        }

        const budgetFrom = parseMoneyFromSearch(filters.budgetFrom);
        const budgetTo = parseMoneyFromSearch(filters.budgetTo);

        if (budgetFrom) {
            params.set("budgetFrom", String(budgetFrom));
        }

        if (budgetTo) {
            params.set("budgetTo", String(budgetTo));
        }

        if (filters.services !== "all") {
            params.set("services", filters.services);
        }

        if (filters.sort !== "newest") {
            params.set("sort", filters.sort);
        }

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    };

    const marketplaceQuery = useQuery({
        queryKey: ["open-booking-marketplace", appliedFilters, page],
        queryFn: () =>
            bookingService.getOpenBookingMarketplace(
                buildQueryOptions(appliedFilters, page),
            ),
        retry: false,
        refetchOnMount: "always",
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
            toast.success("Booking updated");
            setEditingBooking(null);

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-marketplace"],
                }),
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
            toast.error("We couldn’t update this booking");
        },
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
                    "Your open photoshoot request was removed from the public list.",
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-marketplace"],
                }),
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

    const data = marketplaceQuery.data;

    const handleCancelBooking = (
        bookingId: string,
        payload: CancelBookingPayload,
    ) =>
    {
        cancelBookingMutation.mutate({ bookingId, payload });
    };

    const handleApplyFilters = () =>
    {
        pushFiltersToUrl(draftFilters, 1);
        setIsFilterOpen(false);
    };

    const handleResetFilters = () =>
    {
        setDraftFilters(OPEN_BOOKING_DEFAULT_FILTERS);
        pushFiltersToUrl(OPEN_BOOKING_DEFAULT_FILTERS, 1);
        setIsFilterOpen(false);
    };

    const handlePageChange = (nextPage: number) =>
    {
        pushFiltersToUrl(appliedFilters, nextPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSortChange = (sort: OpenBookingSort) =>
    {
        const nextFilters = {
            ...appliedFilters,
            sort,
        };

        setDraftFilters(nextFilters);
        pushFiltersToUrl(nextFilters, 1);
    };

    const hasActiveFilters =
        appliedFilters.shootTypes.length > 0 ||
        Boolean(appliedFilters.location) ||
        Boolean(appliedFilters.dateFrom) ||
        Boolean(appliedFilters.dateTo) ||
        Boolean(appliedFilters.budgetFrom) ||
        Boolean(appliedFilters.budgetTo) ||
        appliedFilters.services !== "all";

    return (
        <main className="pb-16 pt-10 sm:pb-20 sm:pt-14">
            <Container size="wide">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-9 flex items-center justify-between gap-4">
                        <div>
                            <h1 className="font-display text-4xl leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">
                                Booking List
                            </h1>
                        </div>

                        <div className="hidden items-center gap-3 lg:flex">
                            <label className="relative">
                                <SortIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                                <select
                                    value={appliedFilters.sort}
                                    onChange={(event) =>
                                        handleSortChange(event.target.value as OpenBookingSort)
                                    }
                                    className="h-12 min-w-[13rem] appearance-none rounded-2xl border border-border bg-surface py-0 pl-11 pr-10 text-sm font-semibold text-foreground outline-none transition focus:border-accent"
                                >
                                    {SORT_OPTIONS_FOR_OPEN_BOOKING.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            </label>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(true)}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-border bg-surface text-accent shadow-[0_12px_30px_rgba(23,23,23,0.06)] transition hover:border-accent"
                                aria-label="Open filters"
                            >
                                <FilterIcon className="h-5 w-5" />
                            </button>

                            <label className="relative inline-flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-border bg-surface text-accent shadow-[0_12px_30px_rgba(23,23,23,0.06)] transition hover:border-accent">
                                <SortIcon className="h-5 w-5" />
                                <select
                                    aria-label="Sort booking requests"
                                    value={appliedFilters.sort}
                                    onChange={(event) =>
                                        handleSortChange(event.target.value as OpenBookingSort)
                                    }
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                >
                                    {SORT_OPTIONS_FOR_OPEN_BOOKING.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
                        <OpenBookingFilterPanel
                            value={draftFilters}
                            onChange={(nextValue) =>
                                setDraftFilters({
                                    ...nextValue,
                                    budgetFrom: formatMoneyInput(
                                        nextValue.budgetFrom,
                                    ),
                                    budgetTo: formatMoneyInput(
                                        nextValue.budgetTo,
                                    ),
                                })
                            }
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            className="sticky top-24 hidden self-start rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(23,23,23,0.04)] lg:block"
                        />

                        <section>
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted">
                                    {marketplaceQuery.isLoading
                                        ? "Loading requests..."
                                        : `${data?.total ?? 0} open requests found`}
                                </p>

                                {hasActiveFilters ? (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="w-fit text-sm font-semibold text-accent transition hover:text-foreground"
                                    >
                                        Clear all filters
                                    </button>
                                ) : null}
                            </div>

                            {marketplaceQuery.isLoading ? (
                                <div className="grid gap-5 xl:grid-cols-2">
                                    {Array.from({ length: 4 }).map(
                                        (_, index) => (
                                            <div
                                                key={index}
                                                className="h-56 animate-pulse rounded-[1.75rem] border border-border bg-surface"
                                            />
                                        ),
                                    )}
                                </div>
                            ) : marketplaceQuery.isError ? (
                                <div className="rounded-[1.75rem] border border-border bg-surface p-8 text-center text-sm text-muted">
                                    We could not load open photoshoot requests
                                    right now.
                                </div>
                            ) : !data || data.items.length === 0 ? (
                                <div className="rounded-[1.75rem] border border-border bg-surface p-8 text-center shadow-[0_18px_50px_rgba(23,23,23,0.04)]">
                                    <h2 className="font-display text-3xl text-foreground">
                                        No matching requests
                                    </h2>

                                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
                                        Try removing some filters or checking
                                        another location/date range.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-5 xl:grid-cols-2">
                                        {data.items.map((booking) => (
                                            <OpenBookingCard
                                                key={booking.id}
                                                booking={booking}
                                                currentUser={user}
                                                isCancelling={
                                                    cancelBookingMutation.isPending &&
                                                    cancelBookingMutation.variables?.bookingId ===
                                                    booking.id
                                                }
                                                onCancel={(bookingId, payload) =>
                                                    cancelBookingMutation.mutate({
                                                        bookingId,
                                                        payload,
                                                    })
                                                }
                                                onEdit={(targetBooking) =>
                                                    setEditingBooking(
                                                        targetBooking,
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>

                                    <BookingPagination
                                        page={data.page}
                                        totalPages={data.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </Container>

            {isFilterOpen ? (
                <div className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm lg:hidden">
                    <button
                        type="button"
                        aria-label="Close filter"
                        className="absolute inset-0"
                        onClick={() => setIsFilterOpen(false)}
                    />

                    <div className="absolute inset-y-0 left-0 w-[min(88vw,24rem)] overflow-y-auto bg-surface p-5 shadow-2xl">
                        <OpenBookingFilterPanel
                            value={draftFilters}
                            onChange={(nextValue) =>
                                setDraftFilters({
                                    ...nextValue,
                                    budgetFrom: formatMoneyInput(
                                        nextValue.budgetFrom,
                                    ),
                                    budgetTo: formatMoneyInput(
                                        nextValue.budgetTo,
                                    ),
                                })
                            }
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            onClose={() => setIsFilterOpen(false)}
                        />
                    </div>
                </div>
            ) : null}

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
        </main>
    );
};