import type { BookingStatus } from "../types/booking.types";

const statusStyles: Record<BookingStatus, string> = {
    pending:
        "border-brand-border bg-brand-background text-brand-primary",
    confirmed:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
    declined:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
    completed:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300",
};

export const BookingStatusPill = ({ status }: { status: BookingStatus }) =>
{
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
};