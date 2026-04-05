"use client";

import { useMemo, useRef, useState } from "react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { assetService } from "../../../services/asset.service";
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
    asset: null,
    category: "wedding",
    isFeatured: false,
};

export const PortfolioItemForm = ({
    onSubmit,
    onLoadSamples,
    canLoadSamples,
}: PortfolioItemFormProps) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [draft, setDraft] = useState<PortfolioItemDraft>(initialDraft);
    const [formError, setFormError] = useState<string | null>(null);
    const [isPreparingAsset, setIsPreparingAsset] = useState(false);

    const remainingHint = useMemo(() => {
        if (!draft.asset)
            return "Upload an image file to create a local asset preview.";
        if (!draft.description.trim())
            return "Add a short description of the work.";
        return "This portfolio item is ready to be added.";
    }, [draft.asset, draft.description]);

    const handleChange = <K extends keyof PortfolioItemDraft>(
        key: K,
        value: PortfolioItemDraft[K],
    ) => {
        setDraft((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleChooseFile = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        const validation = assetService.validateImageFile(file);

        if (!validation.isValid) {
            setFormError(validation.message);
            return;
        }

        if (!file) return;

        setFormError(null);
        setIsPreparingAsset(true);

        try {
            const asset = await assetService.createLocalAssetPreview(file);
            handleChange("asset", asset);
        } catch {
            setFormError("We couldn’t prepare a preview for this image.");
        } finally {
            setIsPreparingAsset(false);
            if (event.target) {
                event.target.value = "";
            }
        }
    };

    const handleRemoveAsset = () => {
        handleChange("asset", null);
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

        if (!draft.asset) {
            setFormError("Please upload an image for this portfolio work.");
            return;
        }

        onSubmit({
            ...draft,
            title: draft.title.trim(),
            description: draft.description.trim(),
        });

        setDraft(initialDraft);
    };

    return (
        <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <Badge variant="accent">Upload portfolio work</Badge>
                    <h2 className="mt-4 text-2xl font-semibold text-foreground">
                        Add a portfolio asset
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-muted">
                        This phase replaces manual image URLs with a real
                        upload-oriented flow. Files still stay frontend-only for
                        now, but the page now behaves like an asset-first
                        portfolio workflow.
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

                <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                        Asset image
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={assetService.acceptedImageMimeTypes.join(",")}
                        className="hidden"
                        onChange={handleChooseFile}
                    />

                    {!draft.asset ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-8 text-center transition hover:border-accent"
                        >
                            <span className="text-sm font-medium text-foreground">
                                {isPreparingAsset
                                    ? "Preparing preview..."
                                    : "Choose image file"}
                            </span>
                            <span className="mt-2 text-sm leading-6 text-muted">
                                JPG, PNG, or WEBP · maximum 8MB
                            </span>
                        </button>
                    ) : (
                        <div className="rounded-[1.5rem] border border-border bg-background p-4">
                            <div className="overflow-hidden rounded-2xl border border-border">
                                <img
                                    src={draft.asset.previewUrl}
                                    alt={draft.title || draft.asset.fileName}
                                    className="aspect-[4/3] w-full object-cover"
                                />
                            </div>

                            <div className="mt-4 rounded-2xl border border-border bg-surface px-4 py-4">
                                <p className="break-all text-sm font-medium text-foreground">
                                    {draft.asset.fileName}
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                    {draft.asset.mimeType} ·{" "}
                                    {assetService.formatFileSize(
                                        draft.asset.sizeInBytes,
                                    )}
                                </p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    size="md"
                                    variant="secondary"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    Replace image
                                </Button>

                                <Button
                                    type="button"
                                    size="md"
                                    variant="secondary"
                                    onClick={handleRemoveAsset}
                                >
                                    Remove image
                                </Button>
                            </div>
                        </div>
                    )}
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
                    <Button type="submit" size="lg" disabled={isPreparingAsset}>
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
