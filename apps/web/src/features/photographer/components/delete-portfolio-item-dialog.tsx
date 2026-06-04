"use client";

import type { PhotographerPortfolioItem } from "../types/portfolio.types";

interface DeletePortfolioItemDialogProps
{
    item: PhotographerPortfolioItem | null;
    isOpen: boolean;
    isDeleting?: boolean;
    onClose: () => void;
    onConfirm: (item: PhotographerPortfolioItem) => Promise<void> | void;
}

export const DeletePortfolioItemDialog = ({
    item,
    isOpen,
    isDeleting = false,
    onClose,
    onConfirm,
}: DeletePortfolioItemDialogProps) =>
{
    if (!isOpen || !item) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/55 p-4 backdrop-blur-[2px]"
            role="presentation"
            onMouseDown={(event) =>
            {
                if (event.target === event.currentTarget && !isDeleting) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-portfolio-title"
                className="w-full max-w-xl overflow-hidden rounded-[1.75rem] bg-surface text-center shadow-2xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="px-8 py-8">
                    <h2
                        id="delete-portfolio-title"
                        className="font-serif text-3xl leading-tight text-foreground"
                    >
                        Delete post?
                    </h2>

                    <p className="mt-3 text-base leading-7 text-muted">
                        Are you sure you want to delete this post?
                    </p>
                </div>

                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => void onConfirm(item)}
                    className="flex h-16 w-full items-center justify-center border-t border-border text-base font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>

                <button
                    type="button"
                    disabled={isDeleting}
                    onClick={onClose}
                    className="flex h-16 w-full items-center justify-center border-t border-border text-base font-medium text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Cancel
                </button>
            </section>
        </div>
    );
};