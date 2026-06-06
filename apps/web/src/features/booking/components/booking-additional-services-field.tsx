"use client";

import { useFormContext, useWatch } from "react-hook-form";

import
    {
        additionalServiceOptions,
        type AdditionalServiceValue,
    } from "../data/additional-services";

interface BookingAdditionalServicesFieldProps
{
    title?: string;
    helper?: string;
}

export const BookingAdditionalServicesField = ({
    title = "Additional services",
    helper = "Select any support services you want the photographer to prepare or include in the quote.",
}: BookingAdditionalServicesFieldProps) =>
{
    const { register, control } = useFormContext<{
        additionalServices: AdditionalServiceValue[];
    }>();

    const selectedValues =
        useWatch({
            control,
            name: "additionalServices",
        }) ?? [];

    return (
        <section className="space-y-3">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>

                <p className="max-w-2xl text-sm leading-6 text-muted">{helper}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {additionalServiceOptions.map((option) =>
                {
                    const isSelected = selectedValues.includes(option.value);

                    return (
                        <label
                            key={option.value}
                            className={[
                                "group flex cursor-pointer gap-3 rounded-2xl border px-4 py-4 transition",
                                isSelected
                                    ? "border-accent bg-accent/10 shadow-sm"
                                    : "border-border bg-background hover:border-accent/50",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            <input
                                type="checkbox"
                                value={option.value}
                                className="sr-only"
                                {...register("additionalServices")}
                            />

                            <span
                                className={[
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition",
                                    isSelected
                                        ? "border-accent bg-accent text-background"
                                        : "border-muted/50 bg-surface text-transparent group-hover:border-accent",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                aria-hidden="true"
                            >
                                ✓
                            </span>

                            <span className="space-y-1">
                                <span className="block text-sm font-semibold text-foreground">
                                    {option.label}
                                </span>

                                <span className="block text-sm leading-6 text-muted">
                                    {option.description}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
        </section>
    );
};