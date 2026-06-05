"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import
{
    contactOptions,
    shootTypeOptions,
} from "../data/booking-options";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";
import { formatBudgetRange } from "../utils/booking-budget";

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

            <span
                className={[
                    "max-w-[12rem] truncate text-right",
                    hasValue ? "text-foreground" : "text-muted",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {value}
            </span>
        </div>
    );
};

const resolveLabel = (
    value: string | undefined,
    options: { value: string; label: string }[],
) =>
{
    if (!value) {
        return "";
    }

    return options.find((option) => option.value === value)?.label ?? value;
};

const hasTextValue = (value?: string) =>
{
    return Boolean(value && value.trim() !== "");
};

const hasNumberValue = (value?: number) =>
{
    return typeof value === "number" && Number.isFinite(value);
};

export const BookingBriefSummaryCard = ({
    errorMessage,
    submitLabel = "Send booking request",
    submittingLabel = "Sending...",
}: BookingBriefSummaryCardProps) =>
{
    const { control, formState } = useFormContext<BookingBriefFormValues>();
    const formValues = useWatch({ control });

    const shootTypeLabel = useMemo(
        () => resolveLabel(formValues.shootType, shootTypeOptions),
        [formValues.shootType],
    );

    const contactLabel = useMemo(
        () => resolveLabel(formValues.contactPreference, contactOptions),
        [formValues.contactPreference],
    );

    const hasBudget =
        hasNumberValue(formValues.budgetFrom) &&
        hasNumberValue(formValues.budgetTo);

    const budgetLabel = hasBudget
        ? formatBudgetRange(formValues.budgetFrom, formValues.budgetTo)
        : "Select budget";

    const requiredFields = [
        hasTextValue(formValues.title),
        hasTextValue(formValues.shootType),
        hasTextValue(formValues.preferredDate),
        hasTextValue(formValues.location),
        hasBudget,
        hasTextValue(formValues.concept),
    ];

    const completedCount = requiredFields.filter(Boolean).length;

    return (
        <Card className="rounded-[1.75rem]">
            <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Booking summary
                    </p>

                    <h2 className="font-serif text-2xl text-foreground">
                        Review before sending.
                    </h2>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Brief readiness
                    </p>

                    <p className="text-lg font-semibold text-foreground">
                        {completedCount} / {requiredFields.length} essentials
                    </p>
                </div>

                <div className="space-y-3">
                    <SummaryRow
                        label="Title"
                        value={formValues.title || "Add title"}
                        hasValue={hasTextValue(formValues.title)}
                    />

                    <SummaryRow
                        label="Shoot type"
                        value={shootTypeLabel || "Select shoot type"}
                        hasValue={Boolean(shootTypeLabel)}
                    />

                    <SummaryRow
                        label="Date"
                        value={formValues.preferredDate || "Select date"}
                        hasValue={hasTextValue(formValues.preferredDate)}
                    />

                    <SummaryRow
                        label="Time"
                        value={formValues.preferredTime || "Flexible"}
                        hasValue={hasTextValue(formValues.preferredTime)}
                    />

                    <SummaryRow
                        label="Location"
                        value={formValues.location || "Select location"}
                        hasValue={hasTextValue(formValues.location)}
                    />

                    <SummaryRow
                        label="Budget"
                        value={budgetLabel}
                        hasValue={hasBudget}
                    />

                    <SummaryRow
                        label="Contact"
                        value={contactLabel || "Select contact"}
                        hasValue={Boolean(contactLabel)}
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
            </CardContent>
        </Card>
    );
};