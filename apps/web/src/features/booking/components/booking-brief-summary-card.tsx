"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import
    {
        budgetOptions,
        sessionTypeOptions,
        styleOptions,
    } from "../data/booking-options";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";

interface BookingBriefSummaryCardProps
{
    errorMessage?: string | null;
    submitLabel?: string;
    submittingLabel?: string;
}

interface SummaryRowProps
{
    label: string;
    value: string;
    hasValue?: boolean;
}

const SummaryRow = ({ label, value, hasValue }: SummaryRowProps) =>
{
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted">{label}</span>
            <span className={hasValue ? "text-foreground" : "text-muted"}>
                {value}
            </span>
        </div>
    );
};

const resolveLabel = (
    value: string,
    options: { value: string; label: string }[],
) =>
{
    return options.find((option) => option.value === value)?.label;
};

export const BookingBriefSummaryCard = ({
    errorMessage,
    submitLabel = "Find matching photographers",
    submittingLabel = "Preparing...",
}: BookingBriefSummaryCardProps) =>
{
    const { control, formState } = useFormContext<BookingBriefFormValues>();
    const formValues = useWatch({ control });

    const sessionLabel = useMemo(() =>
    {
        return formValues.sessionType
            ? resolveLabel(formValues.sessionType, sessionTypeOptions)
            : "";
    }, [formValues.sessionType]);

    const styleLabel = useMemo(() =>
    {
        return formValues.style
            ? resolveLabel(formValues.style, styleOptions)
            : "";
    }, [formValues.style]);

    const budgetLabel = useMemo(() =>
    {
        return formValues.budget
            ? resolveLabel(formValues.budget, budgetOptions)
            : "";
    }, [formValues.budget]);

    const requiredFields = [
        formValues.sessionType,
        formValues.preferredDate,
        formValues.preferredTime,
        formValues.location,
        formValues.budget,
        formValues.style,
        formValues.description,
    ];

    const completedCount = requiredFields.filter(
        (value) => value && value.trim() !== "",
    ).length;

    return (
        <Card>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Brief summary
                    </p>

                    <p className="text-sm text-muted">
                        Fill the brief first. Sign-in is only required when you
                        confirm the request.
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Brief readiness
                    </p>

                    <p className="text-lg font-semibold text-foreground">
                        {completedCount} / {requiredFields.length} fields complete
                    </p>

                    <p className="text-xs text-muted">
                        Complete the essentials to get stronger matches.
                    </p>
                </div>

                <div className="space-y-3">
                    <SummaryRow
                        label="Session type"
                        value={sessionLabel ?? "Select a session type"}
                        hasValue={Boolean(sessionLabel)}
                    />

                    <SummaryRow
                        label="Style"
                        value={styleLabel ?? "Select a style"}
                        hasValue={Boolean(styleLabel)}
                    />

                    <SummaryRow
                        label="Date"
                        value={formValues.preferredDate || "Select a date"}
                        hasValue={Boolean(formValues.preferredDate)}
                    />

                    <SummaryRow
                        label="Time"
                        value={formValues.preferredTime || "Select a time"}
                        hasValue={Boolean(formValues.preferredTime)}
                    />

                    <SummaryRow
                        label="Location"
                        value={formValues.location || "Add a location"}
                        hasValue={Boolean(formValues.location)}
                    />

                    <SummaryRow
                        label="Budget"
                        value={budgetLabel ?? "Select budget"}
                        hasValue={Boolean(budgetLabel)}
                    />
                </div>

                {errorMessage ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                ) : null}

                <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    disabled={formState.isSubmitting}
                >
                    {formState.isSubmitting ? submittingLabel : submitLabel}
                </Button>

                <p className="text-xs text-muted">
                    You can review or edit the brief before choosing a final
                    photographer.
                </p>
            </CardContent>
        </Card>
    );
};