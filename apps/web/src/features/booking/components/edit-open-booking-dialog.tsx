"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { VIETNAM_LOCATION_OPTIONS } from "../../../shared/data/vietnam-locations";
import type {
    OpenBookingRequestRecord,
    UpdateOpenBookingPayload,
} from "../types/booking.types";
import
{
    BUDGET_MIN_VND,
    BUDGET_STEP_VND,
    formatVndAmount,
    normalizeBudgetToStep,
    parseBudgetRangeValue,
    serializeBudgetRange,
} from "../utils/booking-budget";
import
{
    additionalServiceOptions,
    parseAdditionalServiceValues,
    serializeAdditionalServices,
    type AdditionalServiceValue,
} from "../data/additional-services";
import { shootTypeOptions } from "../data/booking-options";

interface EditOpenBookingDialogProps
{
    isOpen: boolean;
    booking: OpenBookingRequestRecord | null;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (payload: UpdateOpenBookingPayload) => void;
}

const RequiredMark = () => <span className="text-red-500">*</span>;

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

export const EditOpenBookingDialog = ({
    isOpen,
    booking,
    isSubmitting,
    onClose,
    onSubmit,
}: EditOpenBookingDialogProps) =>
{
    const parsedBudget = useMemo(
        () => parseBudgetRangeValue(booking?.budget),
        [booking?.budget],
    );

    const [title, setTitle] = useState("");
    const [shootType, setShootType] = useState("");
    const [sessionDate, setSessionDate] = useState("");
    const [sessionTime, setSessionTime] = useState("");
    const [location, setLocation] = useState("");
    const [concept, setConcept] = useState("");
    const [inspiration, setInspiration] = useState("");
    const [budgetFrom, setBudgetFrom] = useState(BUDGET_MIN_VND);
    const [budgetTo, setBudgetTo] = useState(BUDGET_MIN_VND);
    const [additionalServices, setAdditionalServices] = useState<
        AdditionalServiceValue[]
    >([]);

    useEffect(() =>
    {
        if (!isOpen || !booking) {
            return;
        }

        const resolvedShootType = booking.shootType || booking.sessionType || "";

        setTitle(booking.title ?? "");
        setShootType(resolvedShootType.toLowerCase());
        setSessionDate(booking.sessionDate ?? "");
        setSessionTime(
            booking.sessionTime && booking.sessionTime !== "flexible"
                ? booking.sessionTime
                : "",
        );
        setLocation(booking.location ?? "");
        setConcept(booking.concept ?? "");
        setInspiration(booking.inspiration ?? "");
        setBudgetFrom(parsedBudget?.from ?? BUDGET_MIN_VND);
        setBudgetTo(parsedBudget?.to ?? parsedBudget?.from ?? BUDGET_MIN_VND);
        setAdditionalServices(parseAdditionalServiceValues(booking.notes));
    }, [booking, isOpen, parsedBudget?.from, parsedBudget?.to]);

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

    if (!isOpen || !booking) {
        return null;
    }

    const normalizedBudgetFrom = normalizeBudgetToStep(budgetFrom);
    const normalizedBudgetTo = normalizeBudgetToStep(budgetTo);

    const isValid =
        title.trim().length >= 3 &&
        shootType.trim().length > 0 &&
        sessionDate.trim().length > 0 &&
        location.trim().length >= 2 &&
        concept.trim().length >= 10 &&
        normalizedBudgetFrom >= BUDGET_MIN_VND &&
        normalizedBudgetTo >= normalizedBudgetFrom;

    const toggleService = (value: AdditionalServiceValue) =>
    {
        setAdditionalServices((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value],
        );
    };

    const handleBudgetBlur = (
        value: number,
        setter: (nextValue: number) => void,
    ) =>
    {
        setter(normalizeBudgetToStep(value));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();

        if (!isValid || isSubmitting) {
            return;
        }

        const normalizedShootType = shootType.trim().toLowerCase();

        onSubmit({
            title: title.trim(),
            shootType: normalizedShootType,
            sessionType: normalizedShootType,
            sessionDate: sessionDate.trim(),
            sessionTime: sessionTime.trim() || "flexible",
            duration: booking.duration || "flexible",
            location: location.trim(),
            budget: serializeBudgetRange(
                normalizedBudgetFrom,
                normalizedBudgetTo,
            ),
            contactPreference: booking.contactPreference || "email",
            concept: concept.trim(),
            inspiration: inspiration.trim() || undefined,
            notes: serializeAdditionalServices(additionalServices),
        });
    };

    return (
        <div className="fixed inset-0 z-[75] overflow-y-auto bg-foreground/40 px-4 py-4 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close edit booking dialog"
                className="fixed inset-0"
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
                    <div className="shrink-0 border-b border-border px-5 py-5 sm:px-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="font-display text-3xl tracking-[-0.03em] text-foreground">
                                    Edit photoshoot
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Update your open booking request before
                                    choosing a photographer.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-xl text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
                        <label className="block">
                            <span className="text-sm font-medium text-foreground">
                                Photoshoot title <RequiredMark />
                            </span>

                            <input
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="text-sm font-medium text-foreground">
                                    Expected shoot date <RequiredMark />
                                </span>

                                <input
                                    type="date"
                                    value={sessionDate}
                                    onChange={(event) =>
                                        setSessionDate(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-foreground">
                                    Preferred time{" "}
                                    <span className="font-normal text-muted">
                                        (optional)
                                    </span>
                                </span>

                                <input
                                    type="time"
                                    value={sessionTime}
                                    onChange={(event) =>
                                        setSessionTime(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                />
                            </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="text-sm font-medium text-foreground">
                                    Select shoot type <RequiredMark />
                                </span>

                                <select
                                    value={shootType}
                                    onChange={(event) =>
                                        setShootType(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                >
                                    <option value="">Select shoot type</option>

                                    {shootTypeOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-foreground">
                                    Choose location <RequiredMark />
                                </span>

                                <select
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(event.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                >
                                    <option value="">Select location</option>

                                    {VIETNAM_LOCATION_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="block">
                            <span className="text-sm font-medium text-foreground">
                                Photoshoot description <RequiredMark />
                            </span>

                            <textarea
                                value={concept}
                                onChange={(event) =>
                                    setConcept(event.target.value)
                                }
                                rows={4}
                                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent"
                            />

                            <div className="mt-1 flex justify-end">
                                <span className="text-xs text-muted">
                                    {concept.length}/500
                                </span>
                            </div>
                        </label>

                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Additional services
                            </p>

                            <div className="mt-3 space-y-2">
                                {additionalServiceOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={additionalServices.includes(
                                                option.value,
                                            )}
                                            onChange={() =>
                                                toggleService(option.value)
                                            }
                                            className="mt-1 h-4 w-4"
                                        />

                                        <span>
                                            <span className="block text-sm font-semibold text-foreground">
                                                {option.label}
                                            </span>

                                            <span className="mt-1 block text-xs leading-5 text-muted">
                                                {option.description}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="text-sm font-medium text-foreground">
                                    From (VND) <RequiredMark />
                                </span>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatBudgetInput(budgetFrom)}
                                    onChange={(event) =>
                                        setBudgetFrom(
                                            parseVndInput(event.target.value),
                                        )
                                    }
                                    onBlur={() =>
                                        handleBudgetBlur(
                                            budgetFrom,
                                            setBudgetFrom,
                                        )
                                    }
                                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-foreground">
                                    To (VND) <RequiredMark />
                                </span>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatBudgetInput(budgetTo)}
                                    onChange={(event) =>
                                        setBudgetTo(
                                            parseVndInput(event.target.value),
                                        )
                                    }
                                    onBlur={() =>
                                        handleBudgetBlur(budgetTo, setBudgetTo)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                />
                            </label>
                        </div>

                        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted">
                            Budget preview:{" "}
                            <span className="font-semibold text-foreground">
                                {formatVndAmount(normalizedBudgetFrom)} VND -{" "}
                                {formatVndAmount(normalizedBudgetTo)} VND
                            </span>
                        </div>

                        <label className="block">
                            <span className="text-sm font-medium text-foreground">
                                Inspiration link{" "}
                                <span className="font-normal text-muted">
                                    (optional)
                                </span>
                            </span>

                            <input
                                value={inspiration}
                                onChange={(event) =>
                                    setInspiration(event.target.value)
                                }
                                placeholder="Moodboard, album, or reference URL"
                                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                            />
                        </label>
                    </div>

                    <div className="shrink-0 border-t border-border px-5 py-4 sm:px-7">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center rounded-2xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-accent disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};