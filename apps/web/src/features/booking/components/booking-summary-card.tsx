"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Card, CardContent } from "../../../components/ui/card";
import type { PhotographerDetail } from "../../photographer/types/photographer-detail.types";
import {
    budgetOptions,
    durationOptions,
    sessionTypeOptions,
} from "../data/booking-options";
import type { BookingRequestFormValues } from "../schemas/booking-request.schema";

interface SummaryRowProps {
    label: string;
    value: string;
    hasValue?: boolean;
}

const SummaryRow = ({ label, value, hasValue }: SummaryRowProps) => {
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
) => {
    return options.find((option) => option.value === value)?.label;
};

interface BookingSummaryCardProps {
    photographer: PhotographerDetail;
}

export const BookingSummaryCard = ({
    photographer,
}: BookingSummaryCardProps) => {
    const { control } = useFormContext<BookingRequestFormValues>();

    const formValues = useWatch({ control });

    const sessionLabel = useMemo(() => {
        return formValues.sessionType
            ? resolveLabel(formValues.sessionType, sessionTypeOptions)
            : "";
    }, [formValues.sessionType]);

    const durationLabel = useMemo(() => {
        return formValues.duration
            ? resolveLabel(formValues.duration, durationOptions)
            : "";
    }, [formValues.duration]);

    const budgetLabel = useMemo(() => {
        return formValues.budget
            ? resolveLabel(formValues.budget, budgetOptions)
            : "";
    }, [formValues.budget]);

    return (
        <Card>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Selected photographer
                    </p>
                    <div>
                        <p className="text-lg font-medium text-foreground">
                            {photographer.name}
                        </p>
                        <p className="text-sm text-muted">
                            {photographer.specialty} · {photographer.location}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                        Starting at
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                        ${photographer.startingPrice}
                    </p>
                    <p className="text-xs text-muted">
                        {photographer.availability}
                    </p>
                </div>

                <div className="space-y-3">
                    <SummaryRow
                        label="Session type"
                        value={sessionLabel ?? "Select a session type"}
                        hasValue={Boolean(sessionLabel)}
                    />
                    <SummaryRow
                        label="Date"
                        value={formValues.sessionDate || "Select a date"}
                        hasValue={Boolean(formValues.sessionDate)}
                    />
                    <SummaryRow
                        label="Time"
                        value={formValues.sessionTime || "Select a time"}
                        hasValue={Boolean(formValues.sessionTime)}
                    />
                    <SummaryRow
                        label="Duration"
                        value={durationLabel ?? "Select duration"}
                        hasValue={Boolean(durationLabel)}
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

                <p className="text-xs text-muted">
                    Details update in real time as you edit the form.
                </p>
            </CardContent>
        </Card>
    );
};
