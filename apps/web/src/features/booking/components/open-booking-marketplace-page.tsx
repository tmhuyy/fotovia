"use client";

import Link from "next/link";
import
    {
        usePathname,
        useRouter,
        useSearchParams,
    } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { bookingService } from "../../../services/booking.service";
import { Container } from "../../../components/layout/container";
import
    {
        formatBookingTime,
        formatBudgetLabel,
        formatShootTypeLabel,
    } from "../utils/booking-display";
import type {
    OpenBookingMarketplaceQuery,
    OpenBookingRequestRecord,
    OpenBookingSort,
} from "../types/booking.types";
import { BookingPagination } from "./dashboard/booking-pagination";
import
    {
        OPEN_BOOKING_DEFAULT_FILTERS,
        OpenBookingFilterPanel,
        type OpenBookingFilterState,
        SORT_LABELS,
    } from "./open-booking-filter-panel";

interface IconProps
{
    className?: string;
}

interface SearchParamReader
{
    get: (name: string) => string | null;
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

const getBookingTitle = (booking: OpenBookingRequestRecord): string =>
{
    if (booking.title?.trim()) {
        return booking.title.trim();
    }

    return `${formatShootTypeLabel(
        booking.shootType || booking.sessionType,
    )} photoshoot`;
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

const getApplicationCount = (booking: OpenBookingRequestRecord): number =>
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

const getServiceChips = (booking: OpenBookingRequestRecord): string[] =>
{
    const source = `${booking.notes ?? ""}`.toLowerCase();
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

const parseFiltersFromSearch = (
    searchParams: SearchParamReader,
): OpenBookingFilterState =>
{
    const rawShootTypes = searchParams.get("shootTypes");
    const rawSort = searchParams.get("sort");
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
        sort:
            rawSort === "newest" ||
                rawSort === "most_applications" ||
                rawSort === "budget_low" ||
                rawSort === "budget_high"
                ? (rawSort as OpenBookingSort)
                : "earliest",
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

const OpenBookingCard = ({ booking }: { booking: OpenBookingRequestRecord }) =>
{
    const applicationCount = getApplicationCount(booking);
    const serviceChips = getServiceChips(booking);

    return (
        <article className="relative border-b border-border px-1 py-6 transition hover:bg-surface/70 sm:rounded-[1.75rem] sm:border sm:bg-surface sm:px-6 sm:shadow-[0_18px_50px_rgba(23,23,23,0.04)] sm:hover:-translate-y-0.5 sm:hover:border-accent/50">
            <Link
                href={`/bookings/${booking.id}`}
                className="absolute inset-0 z-0 rounded-[1.75rem]"
                aria-label={`View ${getBookingTitle(booking)}`}
            />

            <div className="pointer-events-none relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
                <div className="min-w-0 space-y-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <h3 className="min-w-0 truncate text-xl font-semibold tracking-[-0.02em] text-foreground">
                            {getBookingTitle(booking)}
                        </h3>

                        <span className="shrink-0 text-sm text-muted">
                            #{booking.id.slice(0, 8)}
                        </span>
                    </div>

                    <InfoRow icon={<UserIcon />}>
                        <span className="font-semibold">
                            {getClientName(booking)}
                        </span>
                        <span className="mx-1.5 text-muted">·</span>
                        <span className="text-muted">
                            {formatSubmittedDate(booking.createdAt)}
                        </span>
                    </InfoRow>

                    <InfoRow icon={<CameraIcon />}>
                        <span className="font-medium">
                            {formatShootTypeLabel(
                                booking.shootType || booking.sessionType,
                            )}
                        </span>
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

                    <InfoRow icon={<CalendarIcon />}>
                        <span>{formatPhotoshootDate(booking.sessionDate)}</span>
                    </InfoRow>

                    <InfoRow icon={<LocationIcon />}>
                        <span className="break-words">
                            {booking.location || "No location added"}
                        </span>
                    </InfoRow>

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

                    <p className="text-lg font-semibold tracking-[0.02em] text-accent">
                        {formatBudgetLabel(booking.budget)}
                    </p>
                </div>

                <div className="flex flex-col gap-3 lg:items-end lg:text-right">
                    <span className="w-fit rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5 text-sm font-semibold text-foreground">
                        Looking for photographer
                    </span>

                    <p className="text-sm leading-6 text-muted">
                        Open request · review details before applying.
                    </p>
                </div>
            </div>
        </article>
    );
};

export const OpenBookingMarketplacePage = () =>
{
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isFilterOpen, setIsFilterOpen] = useState(false);

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

        if (filters.sort !== "earliest") {
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
    });

    const data = marketplaceQuery.data;

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
                    <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>

                            <h1 className="mt-3 font-display text-4xl leading-tight tracking-[-0.04em] text-foreground sm:text-5xl">
                                Booking List
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(true)}
                                className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent lg:hidden"
                            >
                                Filter
                            </button>

                            <select
                                value={appliedFilters.sort}
                                onChange={(event) =>
                                    pushFiltersToUrl(
                                        {
                                            ...appliedFilters,
                                            sort: event.target
                                                .value as OpenBookingSort,
                                        },
                                        1,
                                    )
                                }
                                className="h-12 rounded-2xl border border-border bg-surface px-4 text-sm font-semibold text-foreground outline-none transition focus:border-accent"
                            >
                                {Object.entries(SORT_LABELS).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
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
                                <div className="space-y-4">
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
                                    <div className="space-y-3">
                                        {data.items.map((booking) => (
                                            <OpenBookingCard
                                                key={booking.id}
                                                booking={booking}
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
        </main>
    );
};