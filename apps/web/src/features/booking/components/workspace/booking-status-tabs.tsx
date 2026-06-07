import type { BookingStatus } from "../../types/booking.types";

export type BookingWorkspaceFilter = "all" | BookingStatus;

interface BookingStatusTabsProps
{
    activeFilter: BookingWorkspaceFilter;
    counts: Record<BookingWorkspaceFilter, number>;
    onFilterChange: (filter: BookingWorkspaceFilter) => void;
    allLabel?: string;
}

const filterOptions: { value: BookingWorkspaceFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "declined", label: "Declined" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
];

export const BookingStatusTabs = ({
    activeFilter,
    counts,
    onFilterChange,
    allLabel = "All",
}: BookingStatusTabsProps) =>
{
    return (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {filterOptions.map((option) =>
            {
                const isActive = option.value === activeFilter;
                const label = option.value === "all" ? allLabel : option.label;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onFilterChange(option.value)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${isActive
                                ? "border-brand-primary bg-brand-primary text-white"
                                : "border-brand-border bg-brand-background text-brand-muted hover:text-brand-primary"
                            }`}
                    >
                        <span>{label}</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${isActive
                                    ? "bg-white/15 text-white"
                                    : "bg-brand-surface text-brand-primary"
                                }`}
                        >
                            {counts[option.value]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};