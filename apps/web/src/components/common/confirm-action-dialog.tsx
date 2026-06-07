"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmActionDialogProps
{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
    tone?: "default" | "danger";
    isPending?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export const ConfirmActionDialog = ({
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancel",
    tone = "default",
    isPending = false,
    onCancel,
    onConfirm,
}: ConfirmActionDialogProps) =>
{
    const [isMounted, setIsMounted] = useState(false);

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
                onCancel();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isPending, onCancel]);

    if (!isMounted || !isOpen) {
        return null;
    }

    const confirmClassName =
        tone === "danger"
            ? "bg-rose-600 text-white hover:bg-rose-700"
            : "bg-foreground text-background hover:opacity-90";

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/40 px-4 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close dialog"
                className="absolute inset-0"
                onClick={() =>
                {
                    if (!isPending) {
                        onCancel();
                    }
                }}
            />

            <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-border bg-surface p-6 shadow-2xl">
                <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                        Confirm action
                    </p>

                    <h2 className="font-display text-3xl leading-tight tracking-[-0.03em] text-foreground">
                        {title}
                    </h2>

                    <p className="text-sm leading-7 text-muted">
                        {description}
                    </p>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={onCancel}
                        className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        disabled={isPending}
                        onClick={onConfirm}
                        className={[
                            "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                            confirmClassName,
                        ].join(" ")}
                    >
                        {isPending ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};