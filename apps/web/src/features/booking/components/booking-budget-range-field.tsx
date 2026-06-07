"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Label } from "../../../components/ui/label";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";
import
    {
        BUDGET_MIN_VND,
        BUDGET_STEP_VND,
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

interface BudgetInputProps
{
    id: "budgetFrom" | "budgetTo";
    label: string;
    value: number;
    error?: string;
    onChange: (value: number) => void;
    onBlur: () => void;
}

const BudgetInput = ({
    id,
    label,
    value,
    error,
    onChange,
    onBlur,
}: BudgetInputProps) =>
{
    const increase = () =>
    {
        onChange(normalizeBudgetToStep(Number(value) + BUDGET_STEP_VND));
    };

    const decrease = () =>
    {
        onChange(
            Math.max(
                BUDGET_MIN_VND,
                normalizeBudgetToStep(Number(value) - BUDGET_STEP_VND),
            ),
        );
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>
                {label} <span className="text-red-500">*</span>
            </Label>

            <div className="relative">
                <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={formatBudgetInput(Number(value))}
                    onChange={(event) => onChange(parseVndInput(event.target.value))}
                    onBlur={onBlur}
                    className="flex h-12 w-full rounded-2xl border border-border bg-background px-4 py-3 pr-11 text-base text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                />

                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface">
                    <button
                        type="button"
                        onClick={increase}
                        className="flex h-5 w-7 items-center justify-center text-[0.65rem] leading-none text-muted transition hover:bg-background hover:text-foreground"
                        aria-label={`Increase ${label}`}
                    >
                        ▲
                    </button>

                    <button
                        type="button"
                        onClick={decrease}
                        className="flex h-5 w-7 items-center justify-center border-t border-border text-[0.65rem] leading-none text-muted transition hover:bg-background hover:text-foreground"
                        aria-label={`Decrease ${label}`}
                    >
                        ▼
                    </button>
                </div>
            </div>

            <FieldError message={error} />
        </div>
    );
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
        value: number,
    ) =>
    {
        setValue(name, value, {
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
                <BudgetInput
                    id="budgetFrom"
                    label="From (VND)"
                    value={Number(budgetFrom)}
                    error={resolveErrorMessage(errors.budgetFrom?.message)}
                    onChange={(value) => handleBudgetChange("budgetFrom", value)}
                    onBlur={() => handleBudgetBlur("budgetFrom")}
                />

                <BudgetInput
                    id="budgetTo"
                    label="To (VND)"
                    value={Number(budgetTo)}
                    error={resolveErrorMessage(errors.budgetTo?.message)}
                    onChange={(value) => handleBudgetChange("budgetTo", value)}
                    onBlur={() => handleBudgetBlur("budgetTo")}
                />
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