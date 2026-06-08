"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import type {
    BookingApplicationRecord,
    CreateBookingApplicationPayload,
} from "../types/booking.types";
import
{
    BUDGET_MIN_VND,
    BUDGET_STEP_VND,
    formatVndAmount,
} from "../utils/booking-budget";

import
{
    APPLICATION_DELIVERABLE_OPTIONS,
    type ApplicationDeliverableId,
    parseApplicationDeliverableIds,
    serializeApplicationDeliverables,
} from "../utils/application-deliverables";

interface ApplyToPhotoshootModalProps
{
    isOpen: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateBookingApplicationPayload) => void;
    initialApplication?: BookingApplicationRecord | null;
    title?: string;
    submitLabel?: string;
    submittingLabel?: string;
}

interface FormattedPriceInputProps
{
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const APPLICATION_PRICE_STEP_VND = BUDGET_STEP_VND;

const parseVndInput = (value: string): number =>
{
    const numericValue = value.replace(/[^\d]/g, "");

    if (!numericValue) {
        return Number.NaN;
    }

    const parsedValue = Number(numericValue);

    return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
};

const formatPriceInputValue = (value: string | number | undefined): string =>
{
    if (typeof value === "number") {
        return formatVndAmount(value);
    }

    if (!value) {
        return "";
    }

    const parsedValue = parseVndInput(value);

    if (!Number.isFinite(parsedValue)) {
        return "";
    }

    return formatVndAmount(parsedValue);
};

const normalizePriceStep = (value: number): number =>
{
    if (!Number.isFinite(value)) {
        return BUDGET_MIN_VND;
    }

    return Math.max(
        0,
        Math.round(value / APPLICATION_PRICE_STEP_VND) *
        APPLICATION_PRICE_STEP_VND,
    );
};

const FormattedPriceInput = ({
    value,
    onChange,
    disabled = false,
    placeholder = "1.500.000",
}: FormattedPriceInputProps) =>
{
    const parsedValue = parseVndInput(value);

    const updateAmount = (nextAmount: number) =>
    {
        onChange(formatVndAmount(normalizePriceStep(nextAmount)));
    };

    const handleStepUp = () =>
    {
        const baseValue = Number.isFinite(parsedValue)
            ? parsedValue
            : BUDGET_MIN_VND - APPLICATION_PRICE_STEP_VND;

        updateAmount(baseValue + APPLICATION_PRICE_STEP_VND);
    };

    const handleStepDown = () =>
    {
        const baseValue = Number.isFinite(parsedValue)
            ? parsedValue
            : BUDGET_MIN_VND;

        updateAmount(baseValue - APPLICATION_PRICE_STEP_VND);
    };

    return (
        <div className="relative mt-2">
            <input
                value={value}
                onChange={(event) =>
                    onChange(formatPriceInputValue(event.target.value))
                }
                inputMode="numeric"
                placeholder={placeholder}
                disabled={disabled}
                className="w-full rounded-2xl border border-border bg-background py-3 pl-4 pr-12 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="absolute inset-y-1.5 right-1.5 flex w-8 flex-col overflow-hidden rounded-xl border border-border bg-surface">
                <button
                    type="button"
                    onClick={handleStepUp}
                    disabled={disabled}
                    className="flex flex-1 cursor-pointer items-center justify-center text-[0.65rem] leading-none text-muted transition hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Increase proposed price"
                >
                    ▲
                </button>

                <button
                    type="button"
                    onClick={handleStepDown}
                    disabled={disabled}
                    className="flex flex-1 cursor-pointer items-center justify-center border-t border-border text-[0.65rem] leading-none text-muted transition hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Decrease proposed price"
                >
                    ▼
                </button>
            </div>
        </div>
    );
};

export const ApplyToPhotoshootModal = ({
    isOpen,
    isSubmitting,
    onClose,
    onSubmit,
    initialApplication,
    title = "Photographer application",
    submitLabel = "Submit application",
    submittingLabel = "Submitting...",
}: ApplyToPhotoshootModalProps) =>
{
    const [message, setMessage] = useState("");
    const [proposedPrice, setProposedPrice] = useState("");
    const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<
        ApplicationDeliverableId[]
    >(["all_original_photos"]);
    const [estimatedDuration, setEstimatedDuration] = useState("");
    const [availableOnRequestedDate, setAvailableOnRequestedDate] =
        useState(true);

    useEffect(() =>
    {
        if (!isOpen) {
            return;
        }

        setMessage(initialApplication?.message ?? "");
        setProposedPrice(
            initialApplication?.proposedPrice
                ? formatPriceInputValue(initialApplication.proposedPrice)
                : "",
        );
        setSelectedDeliverableIds(
            parseApplicationDeliverableIds(
                initialApplication?.includedDeliverables,
            ).length > 0
                ? parseApplicationDeliverableIds(
                    initialApplication?.includedDeliverables,
                )
                : ["all_original_photos"],
        );
        setEstimatedDuration(initialApplication?.estimatedDuration ?? "");
        setAvailableOnRequestedDate(
            initialApplication?.availableOnRequestedDate ?? true,
        );
    }, [initialApplication, isOpen]);

    useEffect(() =>
    {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isSubmitting, onClose]);

    const parsedPrice = useMemo(
        () => parseVndInput(proposedPrice),
        [proposedPrice],
    );

    const proposalPreview = useMemo(() =>
    {
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            return "Add proposed price";
        }

        return `${formatVndAmount(parsedPrice)} VND`;
    }, [parsedPrice]);

    if (!isOpen) {
        return null;
    }

    const includedDeliverables = serializeApplicationDeliverables(
        selectedDeliverableIds,
    );

    const isValid =
        message.trim().length >= 20 &&
        Number.isFinite(parsedPrice) &&
        parsedPrice > 0 &&
        selectedDeliverableIds.length > 0 &&
        availableOnRequestedDate;

    const toggleDeliverable = (deliverableId: ApplicationDeliverableId) =>
    {
        setSelectedDeliverableIds((currentIds) =>
            currentIds.includes(deliverableId)
                ? currentIds.filter((id) => id !== deliverableId)
                : [...currentIds, deliverableId],
        );
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();

        if (!isValid || isSubmitting) {
            return;
        }

        onSubmit({
            message: message.trim(),
            proposedPrice: parsedPrice,
            includedDeliverables: includedDeliverables.trim(),
            availableOnRequestedDate,
            estimatedDuration: estimatedDuration.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/35 px-4 py-4 backdrop-blur-sm">
            <div
                className="fixed inset-0"
                aria-hidden="true"
                onClick={() =>
                {
                    if (!isSubmitting) {
                        onClose();
                    }
                }}
            />

            <div className="relative z-10 flex min-h-full items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-border bg-surface shadow-2xl"
                >
                    <div className="shrink-0 border-b border-border bg-surface px-5 py-5 sm:px-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-display text-3xl tracking-[-0.03em] text-foreground">
                                    {title}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-xl text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Close application form"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                        <div className="space-y-5">
                            <label className="block">
                                <span className="text-sm font-medium text-foreground">
                                    Message to client
                                </span>

                                <span className="text-sm font-medium text-red-500">
                                    *
                                </span>

                                <textarea
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(event.target.value)
                                    }
                                    rows={5}
                                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                                />

                                <span className="mt-1 block text-xs text-muted">
                                    Minimum 20 characters.
                                </span>
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-medium text-foreground">
                                        Proposed price
                                    </span>
                                    <span className="text-sm font-medium text-red-500">
                                        *
                                    </span>

                                    <FormattedPriceInput
                                        value={proposedPrice}
                                        onChange={setProposedPrice}
                                        disabled={isSubmitting}
                                    />


                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-foreground">
                                        Estimated duration
                                    </span>

                                    <span className="text-sm font-medium text-red-500">
                                        *
                                    </span>

                                    <input
                                        value={estimatedDuration}
                                        onChange={(event) =>
                                            setEstimatedDuration(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="120"
                                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                                    />


                                </label>
                            </div>

                            <div className="rounded-2xl border border-border bg-background px-4 py-3">
                                <span className="text-sm text-muted">
                                    Proposal preview:{" "}
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {proposalPreview}
                                </span>
                            </div>

                            <div>
                                <span className="text-sm font-medium text-foreground">
                                    Included deliverables
                                </span>
                                <span className="text-sm font-medium text-red-500">
                                    *
                                </span>

                                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                                    {APPLICATION_DELIVERABLE_OPTIONS.map((option) =>
                                    {
                                        const isSelected = selectedDeliverableIds.includes(option.id);

                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => toggleDeliverable(option.id)}
                                                className={[
                                                    "flex cursor-pointer flex-col items-start rounded-2xl border px-4 py-4 text-left transition",
                                                    isSelected
                                                        ? "border-accent bg-accent/10 text-foreground"
                                                        : "border-border bg-background text-muted hover:border-accent/60 hover:text-foreground",
                                                ].join(" ")}
                                            >
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <span
                                                        className={[
                                                            "flex h-4 w-4 items-center justify-center rounded border text-[0.65rem]",
                                                            isSelected
                                                                ? "border-accent bg-accent text-background"
                                                                : "border-border bg-surface",
                                                        ].join(" ")}
                                                    >
                                                        {isSelected ? "✓" : ""}
                                                    </span>

                                                    {option.label}
                                                </span>

                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="mt-2 text-xs text-muted">
                                    Select at least one deliverable. These options will be saved with your application.
                                </p>
                            </div>

                            <label className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-4">
                                <input
                                    type="checkbox"
                                    checked={availableOnRequestedDate}
                                    onChange={(event) =>
                                        setAvailableOnRequestedDate(
                                            event.target.checked,
                                        )
                                    }
                                    className="mt-1 h-4 w-4 rounded border-border"
                                />

                                <span>
                                    <span className="block text-sm font-medium text-foreground">
                                        I am available on the requested date.
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-muted">
                                        This helps avoid low-quality
                                        applications and makes the client
                                        selection process faster.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-border bg-surface px-5 py-4 sm:px-7">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? submittingLabel : submitLabel}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};