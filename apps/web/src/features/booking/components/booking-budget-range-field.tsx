"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Label } from "../../../components/ui/label";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";
import
    {
        BUDGET_MIN_VND,
        formatBudgetRange,
        formatVndAmount,
        normalizeBudgetToStep,
    } from "../utils/booking-budget";

const FieldError = ({ message }: { message?: string }) =>
{
    if (!message) {
        return null;
    }

    return <p className="text-xs font-medium text-red-600">{message}</p>;
};

const resolveErrorMessage = (message: unknown) =>
{
    return typeof message === "string" ? message : undefined;
};

const parseVndInput = (value: string): number =>
{
    const parsedValue = Number(value.replace(/[^\d]/g, ""));

    if (!Number.isFinite(parsedValue)) {
        return 0;
    }

    return parsedValue;
};

const formatBudgetInput = (value: number): string =>
{
    if (!Number.isFinite(value) || value <= 0) {
        return "";
    }

    return formatVndAmount(value);
};

export const BookingBudgetRangeField = () =>
{
    const {
        control,
        setValue,
        formState: { errors },
    } = useFormContext<BookingBriefFormValues>();

    const budgetFrom = useWatch({
        control,
        name: "budgetFrom",
    });

    const budgetTo = useWatch({
        control,
        name: "budgetTo",
    });

    const normalizedBudgetFrom = normalizeBudgetToStep(Number(budgetFrom));
    const normalizedBudgetTo = normalizeBudgetToStep(Number(budgetTo));

    useEffect(() =>
    {
        if (normalizedBudgetTo < normalizedBudgetFrom) {
            setValue("budgetTo", normalizedBudgetFrom, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [normalizedBudgetFrom, normalizedBudgetTo, setValue]);

    const handleBudgetChange = (
        name: "budgetFrom" | "budgetTo",
        value: string,
    ) =>
    {
        setValue(name, parseVndInput(value), {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleBudgetBlur = (name: "budgetFrom" | "budgetTo") =>
    {
        const currentValue = name === "budgetFrom" ? budgetFrom : budgetTo;

        setValue(name, normalizeBudgetToStep(Number(currentValue)), {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>
                    Budget Range <span className="text-red-500">*</span>
                </Label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="budgetFrom">
                        From (VND) <span className="text-red-500">*</span>
                    </Label>

                    <input
                        id="budgetFrom"
                        type="text"
                        inputMode="numeric"
                        value={formatBudgetInput(Number(budgetFrom))}
                        onChange={(event) =>
                            handleBudgetChange(
                                "budgetFrom",
                                event.target.value,
                            )
                        }
                        onBlur={() => handleBudgetBlur("budgetFrom")}
                        className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />

                    <FieldError
                        message={resolveErrorMessage(errors.budgetFrom?.message)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="budgetTo">
                        To (VND) <span className="text-red-500">*</span>
                    </Label>

                    <input
                        id="budgetTo"
                        type="text"
                        inputMode="numeric"
                        value={formatBudgetInput(Number(budgetTo))}
                        onChange={(event) =>
                            handleBudgetChange("budgetTo", event.target.value)
                        }
                        onBlur={() => handleBudgetBlur("budgetTo")}
                        className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />

                    <FieldError
                        message={resolveErrorMessage(errors.budgetTo?.message)}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                Budget preview:{" "}
                <span className="font-semibold text-foreground">
                    {formatBudgetRange(normalizedBudgetFrom, normalizedBudgetTo)}
                </span>
            </div>
        </div>
    );
};