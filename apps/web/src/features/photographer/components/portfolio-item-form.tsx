"use client";

import { useMemo, useState } from "react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
    PORTFOLIO_CATEGORIES,
    PORTFOLIO_CATEGORY_LABELS,
    type PortfolioItemDraft,
} from "../types/portfolio.types";

interface PortfolioItemFormProps {
    onSubmit: (draft: PortfolioItemDraft) => void;
    onLoadSamples: () => void;
    canLoadSamples: boolean;
}

const initialDraft: PortfolioItemDraft = {
    title: "",
    description: "",
    imageUrl: "",
    category: "wedding",
    isFeatured: false,
};

export const PortfolioItemForm = ({
    onSubmit,
    onLoadSamples,
    canLoadSamples,
}: PortfolioItemFormProps) => {
    const [draft, setDraft] = useState<PortfolioItemDraft>(initialDraft);
    const [formError, setFormError] = useState<string | null>(null);

    const remainingHint = useMemo(() => {
        if (!draft.description.trim())
            return "Add a short description of the work.";
        if (!draft.imageUrl.trim())
            return "Paste an image URL to preview the work.";
        return "This item is ready to be added.";
    }, [draft.description, draft.imageUrl]);

    const handleChange = <K extends keyof PortfolioItemDraft>(
        key: K,
        value: PortfolioItemDraft[K],
    ) => {
        setDraft((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!draft.title.trim()) {
            setFormError("Please add a title for this portfolio work.");
            return;
        }

        if (!draft.description.trim()) {
            setFormError(
                "Please add a short description for this portfolio work.",
            );
            return;
        }

        if (!draft.imageUrl.trim()) {
            setFormError("Please add an image URL for this portfolio work.");
            return;
        }

        onSubmit({
            ...draft,
            title: draft.title.trim(),
            description: draft.description.trim(),
            imageUrl: draft.imageUrl.trim(),
        });

        setDraft(initialDraft);
    };

    return (
        <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <Badge variant="accent">Add portfolio work</Badge>
                    <h2 className="mt-4 text-2xl font-semibold text-foreground">
                        Build your first portfolio set
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-muted">
                        Keep this phase simple: add title, description,
                        category, and an image URL. Real asset upload can come
                        later.
                    </p>
                </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label
                        htmlFor="portfolio-title"
                        className="text-sm font-medium text-foreground"
                    >
                        Title
                    </label>
                    <input
                        id="portfolio-title"
                        value={draft.title}
                        onChange={(event) =>
                            handleChange("title", event.target.value)
                        }
                        placeholder="Example: Sunset wedding ceremony"
                        className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="portfolio-category"
                        className="text-sm font-medium text-foreground"
                    >
                        Category
                    </label>
                    <select
                        id="portfolio-category"
                        value={draft.category}
                        onChange={(event) =>
                            handleChange(
                                "category",
                                event.target
                                    .value as PortfolioItemDraft["category"],
                            )
                        }
                        className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                    >
                        {PORTFOLIO_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {PORTFOLIO_CATEGORY_LABELS[category]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="portfolio-image-url"
                        className="text-sm font-medium text-foreground"
                    >
                        Image URL
                    </label>
                    <input
                        id="portfolio-image-url"
                        value={draft.imageUrl}
                        onChange={(event) =>
                            handleChange("imageUrl", event.target.value)
                        }
                        placeholder="https://..."
                        className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="portfolio-description"
                        className="text-sm font-medium text-foreground"
                    >
                        Description
                    </label>
                    <textarea
                        id="portfolio-description"
                        value={draft.description}
                        onChange={(event) =>
                            handleChange("description", event.target.value)
                        }
                        placeholder="Describe the style, mood, or story behind this work."
                        rows={4}
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                    />
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-4 text-sm text-foreground">
                    <input
                        type="checkbox"
                        checked={draft.isFeatured}
                        onChange={(event) =>
                            handleChange("isFeatured", event.target.checked)
                        }
                        className="h-4 w-4 rounded border-border"
                    />
                    Mark this work as featured
                </label>

                <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Form hint
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                        {remainingHint}
                    </p>
                </div>

                {formError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-red-700">
                            {formError}
                        </p>
                    </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                    <Button type="submit" size="lg">
                        Add portfolio item
                    </Button>

                    {canLoadSamples ? (
                        <Button
                            type="button"
                            size="lg"
                            variant="secondary"
                            onClick={onLoadSamples}
                        >
                            Load sample works
                        </Button>
                    ) : null}
                </div>
            </form>
        </div>
    );
};
