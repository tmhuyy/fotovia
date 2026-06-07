"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { VIETNAM_LOCATION_OPTIONS } from "../../../shared/data/vietnam-locations";
import
    {
        additionalServiceOptions,
        parseAdditionalServiceValues,
        serializeAdditionalServices,
        type AdditionalServiceValue,
    } from "../data/additional-services";
import { shootTypeOptions } from "../data/booking-options";
import type {
    OpenBookingRequestRecord,
    UpdateOpenBookingPayload,
} from "../types/booking.types";
import
    {
        BUDGET_MIN_VND,
        formatVndAmount,
        normalizeBudgetToStep,
        parseBudgetRangeValue,
        serializeBudgetRange,
    } from "../utils/booking-budget";

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
        <div className="fixed inset-0 z-[75] bg-background text-foreground">
            <form onSubmit={handleSubmit} className="flex h-dvh flex-col">
                <header className="shrink-0 border-b border-border bg-background/95 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                                Edit open request
                            </p>

                            <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] text-foreground sm:text-4xl">
                                Edit photoshoot
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                                Update your open booking request before choosing
                                a photographer.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xl text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            ×
                        </button>
                    </div>
                </header>

                <main className="min-h-0 flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                            <section className="rounded-[2rem] border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(23,23,23,0.06)] sm:p-7">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <label className="block md:col-span-2">
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

                                    <label className="block">
                                        <span className="text-sm font-medium text-foreground">
                                            Expected shoot date <RequiredMark />
                                        </span>

                                        <input
                                            type="date"
                                            value={sessionDate}
                                            onChange={(event) =>
                                                setSessionDate(
                                                    event.target.value,
                                                )
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
                                                setSessionTime(
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                        />
                                    </label>

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
                                            <option value="">
                                                Select shoot type
                                            </option>

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
                                            <option value="">
                                                Select location
                                            </option>

                                            {VIETNAM_LOCATION_OPTIONS.map(
                                                (option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>

                                    <label className="block md:col-span-2">
                                        <span className="text-sm font-medium text-foreground">
                                            Photoshoot description{" "}
                                            <RequiredMark />
                                        </span>

                                        <textarea
                                            value={concept}
                                            onChange={(event) =>
                                                setConcept(event.target.value)
                                            }
                                            rows={5}
                                            maxLength={500}
                                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent"
                                        />

                                        <div className="mt-1 flex justify-end">
                                            <span className="text-xs text-muted">
                                                {concept.length}/500
                                            </span>
                                        </div>
                                    </label>

                                    <div className="md:col-span-2">
                                        <p className="text-sm font-medium text-foreground">
                                            Additional services
                                        </p>

                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            {additionalServiceOptions.map(
                                                (option) => (
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
                                                                toggleService(
                                                                    option.value,
                                                                )
                                                            }
                                                            className="mt-1 h-4 w-4"
                                                        />

                                                        <span>
                                                            <span className="block text-sm font-semibold text-foreground">
                                                                {option.label}
                                                            </span>

                                                            <span className="mt-1 block text-xs leading-5 text-muted">
                                                                {
                                                                    option.description
                                                                }
                                                            </span>
                                                        </span>
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <label className="block">
                                        <span className="text-sm font-medium text-foreground">
                                            From (VND) <RequiredMark />
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formatBudgetInput(
                                                budgetFrom,
                                            )}
                                            onChange={(event) =>
                                                setBudgetFrom(
                                                    parseVndInput(
                                                        event.target.value,
                                                    ),
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
                                                    parseVndInput(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            onBlur={() =>
                                                handleBudgetBlur(
                                                    budgetTo,
                                                    setBudgetTo,
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                        />
                                    </label>

                                    <label className="block md:col-span-2">
                                        <span className="text-sm font-medium text-foreground">
                                            Inspiration link{" "}
                                            <span className="font-normal text-muted">
                                                (optional)
                                            </span>
                                        </span>

                                        <input
                                            value={inspiration}
                                            onChange={(event) =>
                                                setInspiration(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Moodboard, album, or reference URL"
                                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                        />
                                    </label>
                                </div>
                            </section>

                        </div>
                    </div>
                </main>

                <footer className="shrink-0 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="mx-auto flex w-full max-w-6xl flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:border-accent disabled:opacity-60"
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
                </footer>
            </form>
        </div>
    );
};