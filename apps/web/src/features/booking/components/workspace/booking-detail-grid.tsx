import type { ReactNode } from "react";

interface BookingDetailItem
{
    label: string;
    value: ReactNode;
}

interface BookingDetailGridProps
{
    items: BookingDetailItem[];
}

export const BookingDetailItemCard = ({ label, value }: BookingDetailItem) =>
{
    return (
        <div className="rounded-2xl border border-brand-border bg-brand-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">
                {label}
            </p>
            <div className="mt-2 text-sm leading-6 text-brand-primary">
                {value}
            </div>
        </div>
    );
};

export const BookingDetailGrid = ({ items }: BookingDetailGridProps) =>
{
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
                <BookingDetailItemCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                />
            ))}
        </div>
    );
};