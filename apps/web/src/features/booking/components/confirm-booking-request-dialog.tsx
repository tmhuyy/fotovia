"use client";

import { useEffect } from "react";

import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";
import { formatBudgetRange } from "../utils/booking-budget";
import { getAdditionalServiceLabelsFromValues } from "../data/additional-services";
import { contactOptions, shootTypeOptions } from "../data/booking-options";

interface ConfirmBookingRequestDialogProps
{
    isOpen: boolean;
    values: BookingBriefFormValues | null;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const getShootTypeDisplayLabel = (value?: string | null): string =>
{
    if (!value?.trim()) {
        return "Select shoot type";
    }

    const matchedOption = shootTypeOptions.find(
        (option) => option.value === value.trim(),
    );

    if (matchedOption) {
        return matchedOption.label;
    }

    return value
        .trim()
        .split(/[\s-_]+/)
        .filter(Boolean)
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(" ");
};

const getContactDisplayLabel = (value?: string | null): string =>
{
    if (!value?.trim()) {
        return "Email";
    }

    const matchedOption = contactOptions.find(
        (option) => option.value === value.trim(),
    );

    return matchedOption?.label ?? value.trim();
};

const DetailRow = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <div className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
        <dt className="text-sm text-muted">{label}</dt>
        <dd className="break-words text-sm font-semibold text-foreground">
            {value}
        </dd>
    </div>
);

export const ConfirmBookingRequestDialog = ({
    isOpen,
    values,
    isSubmitting,
    onClose,
    onConfirm,
}: ConfirmBookingRequestDialogProps) =>
{
    useEffect(() =>
    {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () =>
        {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen || !values) {
        return null;
    }

    const serviceLabels = getAdditionalServiceLabelsFromValues(
        values.additionalServices,
    );

    return (
        <div className="fixed inset-0 z-[85] overflow-y-auto bg-foreground/45 px-4 py-4 backdrop-blur-sm">
            <button
                type="button"
                className="fixed inset-0"
                aria-label="Close confirmation dialog"
                onClick={() =>
                {
                    if (!isSubmitting) {
                        onClose();
                    }
                }}
            />

            <div className="relative z-10 flex min-h-full items-center justify-center">
                <div className="my-4 w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-6 shadow-2xl sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                                Booking confirmation
                            </p>

                            <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] text-foreground">
                                Confirm your photoshoot request
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-xl text-foreground transition hover:border-accent disabled:opacity-60"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mt-6 rounded-[1.5rem] border border-border bg-background p-5">
                        <h3 className="text-xl font-semibold text-foreground">
                            {values.title}
                        </h3>

                        <dl className="mt-5 space-y-4">
                            <DetailRow
                                label="Shoot type"
                                value={getShootTypeDisplayLabel(
                                    values.shootType,
                                )}
                            />

                            <DetailRow
                                label="Date"
                                value={values.preferredDate}
                            />

                            <DetailRow
                                label="Time"
                                value={values.preferredTime || "Flexible"}
                            />

                            <DetailRow
                                label="Location"
                                value={values.location}
                            />

                            <DetailRow
                                label="Budget"
                                value={formatBudgetRange(
                                    values.budgetFrom,
                                    values.budgetTo,
                                )}
                            />

                            <DetailRow
                                label="Contact"
                                value={getContactDisplayLabel(
                                    values.contactPreference,
                                )}
                            />

                            <DetailRow
                                label="Services"
                                value={
                                    serviceLabels.length > 0
                                        ? serviceLabels.join(", ")
                                        : "No extra services"
                                }
                            />

                            <DetailRow label="Brief" value={values.concept} />

                            {values.inspiration ? (
                                <DetailRow
                                    label="Inspiration"
                                    value={values.inspiration}
                                />
                            ) : null}
                        </dl>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-2xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-accent disabled:opacity-60"
                        >
                            Edit brief
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Creating..." : "Find photographer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};