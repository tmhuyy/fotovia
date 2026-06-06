"use client";

import { FormEvent, useEffect, useState } from "react";

import type { CreateBookingApplicationPayload } from "../types/booking.types";

interface ApplyToPhotoshootModalProps
{
    isOpen: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateBookingApplicationPayload) => void;
}

export const ApplyToPhotoshootModal = ({
    isOpen,
    isSubmitting,
    onClose,
    onSubmit,
}: ApplyToPhotoshootModalProps) =>
{
    const [message, setMessage] = useState("");
    const [proposedPrice, setProposedPrice] = useState("");
    const [includedDeliverables, setIncludedDeliverables] = useState("");
    const [estimatedDuration, setEstimatedDuration] = useState("");
    const [availableOnRequestedDate, setAvailableOnRequestedDate] =
        useState(true);

    useEffect(() =>
    {
        if (!isOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) {
        return null;
    }

    const parsedPrice = Number(proposedPrice.replace(/[^\d]/g, ""));
    const isValid =
        message.trim().length >= 20 &&
        Number.isFinite(parsedPrice) &&
        parsedPrice >= 0 &&
        includedDeliverables.trim().length >= 5 &&
        availableOnRequestedDate;

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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 px-4 py-4 backdrop-blur-sm sm:items-center">
            <div
                className="absolute inset-0"
                aria-hidden="true"
                onClick={() =>
                {
                    if (!isSubmitting) {
                        onClose();
                    }
                }}
            />

            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-5 shadow-2xl sm:p-7"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted">
                            Photographer application
                        </p>

                        <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] text-foreground">
                            Apply to photoshoot
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                            Send a short proposal so the client can understand
                            your fit, price, availability, and deliverables.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted transition hover:border-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-6 space-y-5">
                    <label className="block">
                        <span className="text-sm font-medium text-foreground">
                            Message to client
                        </span>
                        <textarea
                            value={message}
                            onChange={(event) =>
                                setMessage(event.target.value)
                            }
                            rows={5}
                            placeholder="Explain why you are a good fit for this concept, your shooting approach, and any relevant experience."
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
                            <input
                                value={proposedPrice}
                                onChange={(event) =>
                                    setProposedPrice(event.target.value)
                                }
                                inputMode="numeric"
                                placeholder="1500000"
                                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                            />
                            <span className="mt-1 block text-xs text-muted">
                                VND, numbers only.
                            </span>
                        </label>

                        <label className="block">
                            <span className="text-sm font-medium text-foreground">
                                Estimated duration
                            </span>
                            <input
                                value={estimatedDuration}
                                onChange={(event) =>
                                    setEstimatedDuration(event.target.value)
                                }
                                placeholder="120"
                                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                            />
                            <span className="mt-1 block text-xs text-muted">
                                Optional. Keep same format as booking duration.
                            </span>
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-sm font-medium text-foreground">
                            Included deliverables
                        </span>
                        <textarea
                            value={includedDeliverables}
                            onChange={(event) =>
                                setIncludedDeliverables(event.target.value)
                            }
                            rows={4}
                            placeholder="Example: 2-hour session, 30 edited photos, online gallery within 5 days."
                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                        />
                    </label>

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
                                This helps avoid low-quality applications and
                                makes the client selection process faster.
                            </span>
                        </span>
                    </label>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center rounded-2xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : "Submit application"}
                    </button>
                </div>
            </form>
        </div>
    );
};