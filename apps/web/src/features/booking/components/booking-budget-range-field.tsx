"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Input } from "../../../components/ui/input";
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

export const BookingBudgetRangeField = () =>
{
    const {
        register,
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

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>
                    Budget Range <span className="text-red-500">*</span>
                </Label>

                {/* <div className="flex items-start gap-3 rounded-2xl bg-background px-4 py-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/20 text-2xl">
                        🍋
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Trợ lý Popo
                        </p>

                        <p className="text-sm leading-6 text-muted">
                            Buổi chụp này sẽ có giá là bao nhiêu nhỉ?
                        </p>
                    </div>
                </div> */}

                {/* <p className="text-xs text-muted">
                    Tối thiểu {formatVndAmount(BUDGET_MIN_VND)} VND. Mỗi bước tăng{" "}
                    {formatVndAmount(BUDGET_STEP_VND)} VND.
                </p> */}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="budgetFrom">
                        From (VND) <span className="text-red-500">*</span>
                    </Label>

                    <Input
                        id="budgetFrom"
                        type="number"
                        inputMode="numeric"
                        min={BUDGET_MIN_VND}
                        step={BUDGET_STEP_VND}
                        {...register("budgetFrom", {
                            valueAsNumber: true,
                        })}
                    />

                    <FieldError
                        message={resolveErrorMessage(errors.budgetFrom?.message)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="budgetTo">
                        To (VND) <span className="text-red-500">*</span>
                    </Label>

                    <Input
                        id="budgetTo"
                        type="number"
                        inputMode="numeric"
                        min={normalizedBudgetFrom}
                        step={BUDGET_STEP_VND}
                        {...register("budgetTo", {
                            valueAsNumber: true,
                        })}
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