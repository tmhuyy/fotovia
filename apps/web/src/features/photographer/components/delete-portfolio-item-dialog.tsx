"use client";

import { Button } from "../../../components/ui/button";
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
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="w-full max-w-lg rounded-[2rem] border border-border bg-surface p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Delete portfolio item"
            >
                <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Delete portfolio item
                    </p>

                    <h2 className="font-serif text-3xl text-foreground">
                        Delete “{item.title}”?
                    </h2>

                    <p className="text-sm leading-7 text-muted">
                        This will remove the portfolio item from your saved works. Images
                        that are no longer used anywhere else may also be cleaned up from
                        storage.
                    </p>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-border bg-background px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        What will happen
                    </p>

                    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                        <li>• The portfolio item will be removed from your workspace</li>
                        <li>• Public photographer pages will stop showing this work</li>
                        <li>• Unused media may also be cleaned up afterward</li>
                    </ul>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={() => void onConfirm(item)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete item"}
                    </Button>
                </div>
            </div>
        </div>
    );
};