"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent } from "../../../components/ui/card";
import type { PhotographerDetail } from "../../photographer/types/photographer-detail.types";
import
    {
        budgetOptions,
        durationOptions,
        sessionTypeOptions,
    } from "../data/booking-options";
import type { BookingRequestFormValues } from "../schemas/booking-request.schema";

interface SummaryRowProps
{
    label: string;
    value: string;
    hasValue?: boolean;
}

const SummaryRow = ({ label, value, hasValue = true }: SummaryRowProps) =>
{
    return (
        <div className="flex items-start justify-between gap-4 border-t border-brand-border pt-4 first:border-t-0 first:pt-0">
            <span className="text-sm text-brand-muted">{label}</span>
            <span
                className={`max-w-[60%] text-right text-sm ${hasValue ? "text-brand-primary" : "text-brand-muted"
                    }`}
            >
                {value}
            </span>
        </div>
    );
};

const resolveLabel = (
    value: string,
    options: { value: string; label: string }[],
): string =>
{
    return options.find((option) => option.value === value)?.label ?? value;
};

const formatPrice = (value: number | null): string =>
{
    if (value === null) {
        return "Pricing on request";
    }

    return `$${Math.round(value)}`;
};

export const BookingSummaryCard = ({
    photographer,
}: {
    photographer: PhotographerDetail;
}) =>
{
    const { control } = useFormContext<BookingRequestFormValues>();

    const formValues = useWatch<BookingRequestFormValues>({
        control,
    });

    const sessionLabel = useMemo(() =>
    {
        return formValues?.sessionType
            ? resolveLabel(formValues.sessionType, sessionTypeOptions)
            : "";
    }, [formValues?.sessionType]);

    const durationLabel = useMemo(() =>
    {
        return formValues?.duration
            ? resolveLabel(formValues.duration, durationOptions)
            : "";
    }, [formValues?.duration]);

    const budgetLabel = useMemo(() =>
    {
        return formValues?.budget
            ? resolveLabel(formValues.budget, budgetOptions)
            : "";
    }, [formValues?.budget]);

    return (
        <Card className="h-fit border-brand-border bg-brand-surface">
            <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-muted">
                        Selected photographer
                    </p>

                    <div>
                        <h3 className="text-xl font-semibold text-brand-primary">
                            {photographer.name}
                        </h3>
                        <p className="mt-1 text-sm text-brand-muted">
                            {photographer.specialty} · {photographer.location}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-brand-border bg-brand-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-brand-muted">
                        Starting at
                    </p>
                    <p className="mt-2 text-lg font-semibold text-brand-primary">
                        {formatPrice(photographer.startingPrice)}
                    </p>
                    <p className="mt-2 text-sm text-brand-muted">
                        {photographer.availability}
                    </p>
                </div>

                <div className="space-y-4">
                    <SummaryRow
                        label="Session type"
                        value={sessionLabel || "Not set yet"}
                        hasValue={Boolean(sessionLabel)}
                    />
                    <SummaryRow
                        label="Date"
                        value={formValues?.sessionDate || "Not set yet"}
                        hasValue={Boolean(formValues?.sessionDate)}
                    />
                    <SummaryRow
                        label="Time"
                        value={formValues?.sessionTime || "Not set yet"}
                        hasValue={Boolean(formValues?.sessionTime)}
                    />
                    <SummaryRow
                        label="Duration"
                        value={durationLabel || "Not set yet"}
                        hasValue={Boolean(durationLabel)}
                    />
                    <SummaryRow
                        label="Budget"
                        value={budgetLabel || "Not set yet"}
                        hasValue={Boolean(budgetLabel)}
                    />
                    <SummaryRow
                        label="Location"
                        value={formValues?.location || "Not set yet"}
                        hasValue={Boolean(formValues?.location)}
                    />
                </div>

                <p className="text-sm leading-6 text-brand-muted">
                    Details update in real time as you edit the form.
                </p>
            </CardContent>
        </Card>
    );
};