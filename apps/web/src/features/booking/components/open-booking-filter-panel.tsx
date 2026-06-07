"use client";

import type {
    OpenBookingAdditionalServicesFilter,
    OpenBookingSort,
} from "../types/booking.types";
import { shootTypeOptions } from "../data/booking-options";
import { VIETNAM_LOCATION_OPTIONS } from "../../../shared/data/vietnam-locations";

export interface OpenBookingFilterState
{
    shootTypes: string[];
    location: string;
    dateFrom: string;
    dateTo: string;
    budgetFrom: string;
    budgetTo: string;
    services: OpenBookingAdditionalServicesFilter;
    sort: OpenBookingSort;
}

interface OpenBookingFilterPanelProps
{
    value: OpenBookingFilterState;
    onChange: (value: OpenBookingFilterState) => void;
    onApply: () => void;
    onReset: () => void;
    onClose?: () => void;
    className?: string;
}

const SERVICE_OPTIONS: Array<{
    label: string;
    value: OpenBookingAdditionalServicesFilter;
}> = [
        { label: "All requests", value: "all" },
        { label: "Need additional services", value: "with" },
        { label: "No additional services", value: "without" },
    ];

const SORT_OPTIONS: Array<{ label: string; value: OpenBookingSort }> = [
    { label: "Earliest shoot date", value: "earliest" },
    { label: "Newest request", value: "newest" },
    { label: "Most applications", value: "most_applications" },
    { label: "Lowest budget", value: "budget_low" },
    { label: "Highest budget", value: "budget_high" },
];

export const OPEN_BOOKING_DEFAULT_FILTERS: OpenBookingFilterState = {
    shootTypes: [],
    location: "",
    dateFrom: "",
    dateTo: "",
    budgetFrom: "",
    budgetTo: "",
    services: "all",
    sort: "earliest",
};

export const SORT_LABELS = SORT_OPTIONS.reduce<Record<string, string>>(
    (acc, option) =>
    {
        acc[option.value] = option.label;
        return acc;
    },
    {},
);

export const OpenBookingFilterPanel = ({
    value,
    onChange,
    onApply,
    onReset,
    onClose,
    className = "",
}: OpenBookingFilterPanelProps) =>
{
    const toggleShootType = (shootType: string) =>
    {
        const nextShootTypes = value.shootTypes.includes(shootType)
            ? value.shootTypes.filter((item) => item !== shootType)
            : [...value.shootTypes, shootType];

        onChange({
            ...value,
            shootTypes: nextShootTypes,
        });
    };

    return (
        <aside className={className}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-accent">▽</span>
                    <h2 className="text-lg font-semibold text-accent">
                        Filter
                    </h2>
                </div>

                {onClose ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-xl text-foreground"
                    >
                        ×
                    </button>
                ) : null}
            </div>

            <div className="mt-6 space-y-6">
                <section>
                    <p className="mb-3 text-sm font-semibold text-foreground">
                        Shoot type
                    </p>

                    <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                        {shootTypeOptions.map((option) => (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-2 text-sm text-muted"
                            >
                                <input
                                    type="checkbox"
                                    checked={value.shootTypes.includes(
                                        option.value,
                                    )}
                                    onChange={() =>
                                        toggleShootType(option.value)
                                    }
                                    className="h-4 w-4 rounded border-border accent-accent"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </section>

                <section>
                    <label className="text-sm font-semibold text-foreground">
                        Shooting location
                    </label>

                    <select
                        value={value.location}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                location: event.target.value,
                            })
                        }
                        className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                    >
                        <option value="">All locations</option>
                        {VIETNAM_LOCATION_OPTIONS.map((location) => (
                            <option
                                key={location.value}
                                value={location.value}
                            >
                                {location.label}
                            </option>
                        ))}
                    </select>
                </section>

                <section>
                    <p className="mb-3 text-sm font-semibold text-foreground">
                        Shooting date
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="text-xs text-muted">
                            From
                            <input
                                type="date"
                                value={value.dateFrom}
                                onChange={(event) =>
                                    onChange({
                                        ...value,
                                        dateFrom: event.target.value,
                                    })
                                }
                                className="mt-1 h-12 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent"
                            />
                        </label>

                        <label className="text-xs text-muted">
                            To
                            <input
                                type="date"
                                value={value.dateTo}
                                onChange={(event) =>
                                    onChange({
                                        ...value,
                                        dateTo: event.target.value,
                                    })
                                }
                                className="mt-1 h-12 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent"
                            />
                        </label>
                    </div>
                </section>

                <section>
                    <p className="mb-3 text-sm font-semibold text-foreground">
                        Budget
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="500.000"
                            value={value.budgetFrom}
                            onChange={(event) =>
                                onChange({
                                    ...value,
                                    budgetFrom: event.target.value,
                                })
                            }
                            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                        />

                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="2.000.000"
                            value={value.budgetTo}
                            onChange={(event) =>
                                onChange({
                                    ...value,
                                    budgetTo: event.target.value,
                                })
                            }
                            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                        />
                    </div>
                </section>

                <section>
                    <p className="mb-3 text-sm font-semibold text-foreground">
                        Additional services
                    </p>

                    <div className="space-y-2">
                        {SERVICE_OPTIONS.map((option) => (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-2 text-sm text-muted"
                            >
                                <input
                                    type="radio"
                                    checked={value.services === option.value}
                                    onChange={() =>
                                        onChange({
                                            ...value,
                                            services: option.value,
                                        })
                                    }
                                    className="h-4 w-4 accent-accent"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </section>

                <section>
                    <label className="text-sm font-semibold text-foreground">
                        Sort
                    </label>

                    <select
                        value={value.sort}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                sort: event.target.value as OpenBookingSort,
                            })
                        }
                        className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </section>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onReset}
                    className="h-12 rounded-2xl border border-border bg-surface text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
                >
                    Remove filter
                </button>

                <button
                    type="button"
                    onClick={onApply}
                    className="h-12 rounded-2xl bg-accent text-sm font-semibold text-white transition hover:opacity-90"
                >
                    Filter
                </button>
            </div>
        </aside>
    );
};