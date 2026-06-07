import type { ReactNode } from "react";

interface BookingEmptyStateProps
{
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
}

export const BookingEmptyState = ({
    eyebrow,
    title,
    description,
    actions,
}: BookingEmptyStateProps) =>
{
    return (
        <div className="rounded-[1.75rem] border border-dashed border-brand-border bg-brand-surface p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                {eyebrow}
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-brand-primary">
                {title}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
                {description}
            </p>

            {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
    );
};