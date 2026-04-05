"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { Button } from "../../../components/ui/button";
import { assetService } from "../../../services/asset.service";
import
    {
        PORTFOLIO_CATEGORIES,
        PORTFOLIO_CATEGORY_LABELS,
        type PortfolioItemDraft,
    } from "../types/portfolio.types";

interface PortfolioItemFormProps
{
    mode?: "create" | "edit";
    initialValue?: PortfolioItemDraft;
    onSubmit: (draft: PortfolioItemDraft) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

const emptyDraft: PortfolioItemDraft = {
    title: "",
    description: "",
    asset: null,
    category: "wedding",
    isFeatured: false,
};

export const PortfolioItemForm = ({
    mode = "create",
    initialValue,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: PortfolioItemFormProps) =>
{
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [draft, setDraft] = useState<PortfolioItemDraft>(
        initialValue ?? emptyDraft,
    );
    const [formError, setFormError] = useState<string | null>(null);
    const [isPreparingAsset, setIsPreparingAsset] = useState(false);

    useEffect(() =>
    {
        setDraft(initialValue ?? emptyDraft);
        setFormError(null);
    }, [initialValue, mode]);

    const isEditMode = mode === "edit";

    const remainingHint = useMemo(() =>
    {
        if (!draft.asset) {
            return "Choose an image first so this item can be persisted with a real uploaded asset.";
        }

        if (!draft.description.trim()) {
            return "Add a short description so the saved work has useful context.";
        }

        return "This portfolio item is ready to be saved to the backend.";
    }, [draft.asset, draft.description]);

    const handleChange = <K extends keyof PortfolioItemDraft>(
        key: K,
        value: PortfolioItemDraft[K],
    ) =>
    {
        setDraft((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleChooseFile = async (
        event: ChangeEvent<HTMLInputElement>,
    ) =>
    {
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

    const handleRemoveAsset = () =>
    {
        handleChange("asset", null);
    };

    const handleSubmit = async (event: React.FormEvent) =>
    {
        event.preventDefault();
        setFormError(null);

        if (!draft.title.trim()) {
            setFormError("Please add a title for this portfolio work.");
            return;
        }

        if (!draft.description.trim()) {
            setFormError("Please add a short description for this portfolio work.");
            return;
        }

        if (!draft.asset) {
            setFormError("Please upload an image for this portfolio work.");
            return;
        }

        try {
            await onSubmit({
                ...draft,
                title: draft.title.trim(),
                description: draft.description.trim(),
            });

            if (!isEditMode) {
                setDraft(emptyDraft);

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        } catch {
            setFormError("We couldn’t save this portfolio item. Please try again.");
        }
    };

    return (
        <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Portfolio workspace
                </p>

                <h2 className="font-serif text-2xl text-foreground">
                    {isEditMode ? "Edit portfolio work" : "Upload portfolio work"}
                </h2>

                <p className="text-sm leading-6 text-muted">
                    {isEditMode
                        ? "Update a saved portfolio item. You can edit the text, featured state, category, or replace the image."
                        : "Add a real portfolio work. The image will upload through the backend asset flow instead of staying browser-local."}
                </p>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-6">
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
                                onChange={(event) => handleChange("title", event.target.value)}
                                placeholder="Example: Sunset wedding ceremony"
                                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                                disabled={isPreparingAsset || isSubmitting}
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
                                        event.target.value as PortfolioItemDraft["category"],
                                    )
                                }
                                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                                disabled={isPreparingAsset || isSubmitting}
                            >
                                {PORTFOLIO_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {PORTFOLIO_CATEGORY_LABELS[category]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Asset image
                            </label>

                            {!draft.asset ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-8 text-center transition hover:border-accent"
                                    disabled={isPreparingAsset || isSubmitting}
                                >
                                    <span className="text-sm font-medium text-foreground">
                                        {isPreparingAsset ? "Preparing preview..." : "Choose image file"}
                                    </span>

                                    <span className="mt-2 text-xs text-muted">
                                        JPG, PNG, or WEBP · maximum 8MB
                                    </span>
                                </button>
                            ) : (
                                <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background">
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-brand-background">
                                        <img
                                            src={draft.asset.previewUrl}
                                            alt={draft.asset.fileName}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="space-y-4 p-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-foreground">
                                                {draft.asset.fileName}
                                            </p>

                                            <p className="text-xs text-muted">
                                                {draft.asset.mimeType} ·{" "}
                                                {assetService.formatFileSize(draft.asset.sizeInBytes)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isPreparingAsset || isSubmitting}
                                            >
                                                Replace image
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleRemoveAsset}
                                                disabled={isPreparingAsset || isSubmitting}
                                            >
                                                Remove image
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={assetService.acceptedImageMimeTypes.join(",")}
                                className="hidden"
                                onChange={handleChooseFile}
                                disabled={isPreparingAsset || isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
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
                                rows={6}
                                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                                disabled={isPreparingAsset || isSubmitting}
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
                                disabled={isPreparingAsset || isSubmitting}
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
                                <p className="text-sm font-medium text-red-700">{formError}</p>
                            </div>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isPreparingAsset || isSubmitting}
                            >
                                {isSubmitting
                                    ? isEditMode
                                        ? "Saving changes..."
                                        : "Saving portfolio item..."
                                    : isEditMode
                                        ? "Save changes"
                                        : "Add portfolio item"}
                            </Button>

                            {isEditMode ? (
                                <Button
                                    type="button"
                                    size="lg"
                                    variant="secondary"
                                    onClick={onCancel}
                                    disabled={isPreparingAsset || isSubmitting}
                                >
                                    Cancel edit
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};