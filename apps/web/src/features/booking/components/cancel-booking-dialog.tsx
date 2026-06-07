"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type {
    BookingCancelReason,
    CancelBookingPayload,
} from "../types/booking.types";

interface CancelBookingDialogProps
{
    isOpen: boolean;
    isPending?: boolean;
    onClose: () => void;
    onConfirm: (payload: CancelBookingPayload) => void;
}

const cancelReasonOptions: {
    value: BookingCancelReason;
    label: string;
}[] = [
        {
            value: "duplicated_booking",
            label: "Duplicated booking",
        },
        {
            value: "found_another_photographer",
            label: "Found another photographer",
        },
        {
            value: "no_longer_needed",
            label: "No longer need this photoshoot",
        },
        {
            value: "other",
            label: "Other",
        },
    ];

export const CancelBookingDialog = ({
    isOpen,
    isPending = false,
    onClose,
    onConfirm,
}: CancelBookingDialogProps) =>
{
    const [isMounted, setIsMounted] = useState(false);
    const [selectedReason, setSelectedReason] =
        useState<BookingCancelReason | undefined>("found_another_photographer");
    const [otherReason, setOtherReason] = useState("");

    useEffect(() =>
    {
        setIsMounted(true);
    }, []);

    useEffect(() =>
    {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape" && !isPending) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isPending, onClose]);

    useEffect(() =>
    {
        if (isOpen) {
            setSelectedReason(undefined);
            setOtherReason("");
        }
    }, [isOpen]);

    const canSubmit = useMemo(() =>
    {
        if (selectedReason !== "other") {
            return true;
        }

        return otherReason.trim().length >= 3;
    }, [otherReason, selectedReason]);

    if (!isMounted || !isOpen) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-foreground/40 px-4 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close cancel dialog"
                className="absolute inset-0"
                onClick={() =>
                {
                    if (!isPending) {
                        onClose();
                    }
                }}
            />

            <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-6 shadow-2xl sm:p-8">
                <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    disabled={isPending}
                    className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-xl leading-none text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                    ×
                </button>

                <div className="pr-12">


                    <h2 className="max-w-xl font-display text-2xl leading-tight tracking-[-0.03em] text-foreground sm:text-3xl">
                        Are you sure you want to cancel this photoshoot?

                    </h2>
                </div>



                <div className="mt-6  text-sm leading-7 text-muted">
                    <p>
                        Once cancelled, this shooting will be closed and can’t be reopened.
                    </p>

                    <p>
                        Let us know why you’re cancelling - it helps Potonow support you better!
                    </p>
                </div>

                <div className="mt-5 rounded-[1.5rem] bg-background p-3">
                    <div className="space-y-2">
                        {cancelReasonOptions.map((option) => (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
                            >
                                <input
                                    type="radio"
                                    name="cancel-reason"
                                    value={option.value}
                                    checked={selectedReason === option.value}
                                    disabled={isPending}
                                    onChange={() =>
                                        setSelectedReason(option.value)
                                    }
                                    className="h-5 w-5 accent-foreground"
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>

                    {selectedReason === "other" ? (
                        <textarea
                            value={otherReason}
                            onChange={(event) =>
                                setOtherReason(event.target.value)
                            }
                            placeholder="Write a short reason..."
                            maxLength={300}
                            disabled={isPending}
                            className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    ) : null}
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={isPending || !canSubmit}
                        onClick={() =>
                            onConfirm({
                                cancelReason: selectedReason,
                                cancelReasonNote:
                                    selectedReason === "other"
                                        ? otherReason.trim()
                                        : undefined,
                            })
                        }
                        className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isPending ? "Cancelling..." : "Confirm cancellation"}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};