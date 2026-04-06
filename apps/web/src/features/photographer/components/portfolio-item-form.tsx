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
import { AssetPreview } from "../../asset/types/asset.types";

interface PortfolioItemFormProps
{
    mode?: "create" | "edit";
    initialValue?: PortfolioItemDraft;
    onSubmit: (draft: PortfolioItemDraft) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
}

const MAX_GALLERY_IMAGES = 8;

const emptyDraft: PortfolioItemDraft = {
    title: "",
    description: "",
    coverAsset: null,
    galleryAssets: [],
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
    const coverInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const [draft, setDraft] = useState<PortfolioItemDraft>(
        initialValue ?? emptyDraft,
    );
    const [formError, setFormError] = useState<string | null>(null);
    const [isPreparingCover, setIsPreparingCover] = useState(false);
    const [isPreparingGallery, setIsPreparingGallery] = useState(false);

    useEffect(() =>
    {
        setDraft(initialValue ?? emptyDraft);
        setFormError(null);
    }, [initialValue, mode]);

    const isEditMode = mode === "edit";

    const remainingHint = useMemo(() =>
    {
        if (!draft.coverAsset) {
            return "Choose a cover image first so this portfolio item has a strong public-facing hero image.";
        }

        if (!draft.description.trim()) {
            return "Add a short description so this saved work has clear story and context.";
        }

        if (draft.galleryAssets.length === 0) {
            return "You can save this item with only a cover image, or add extra gallery images for a richer showcase.";
        }

        return "This portfolio item is ready with a cover image and gallery support.";
    }, [draft.coverAsset, draft.description, draft.galleryAssets.length]);

    const isPreparingAsset = isPreparingCover || isPreparingGallery;

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

    const handleChooseCoverFile = async (
        event: ChangeEvent<HTMLInputElement>,
    ) =>
    {
        const file = event.target.files?.[0];
        const validation = assetService.validateImageFile(file);

        if (!validation.isValid || !file) {
            setFormError(validation.message);
            return;
        }

        setFormError(null);
        setIsPreparingCover(true);

        try {
            const coverAsset = await assetService.prepareImageAsset(
                file,
                "portfolio-cover",
            );

            handleChange("coverAsset", coverAsset);
        } catch {
            setFormError("We couldn’t prepare this cover image.");
        } finally {
            setIsPreparingCover(false);

            if (event.target) {
                event.target.value = "";
            }
        }
    };

    const handleChooseGalleryFiles = async (
        event: ChangeEvent<HTMLInputElement>,
    ) =>
    {
        const files = Array.from(event.target.files ?? []);

        if (!files.length) {
            return;
        }

        if (draft.galleryAssets.length + files.length > MAX_GALLERY_IMAGES) {
            setFormError(
                `Please keep the gallery at ${MAX_GALLERY_IMAGES} images or fewer.`,
            );
            return;
        }

        setFormError(null);
        setIsPreparingGallery(true);

        try {
            const preparedAssets: AssetPreview[] = [];

            for (const file of files) {
                const validation = assetService.validateImageFile(file);

                if (!validation.isValid) {
                    throw new Error(validation.message ?? "Invalid gallery image.");
                }

                const galleryAsset = await assetService.prepareImageAsset(
                    file,
                    "portfolio-gallery",
                );

                preparedAssets.push(galleryAsset);
            }

            setDraft((current) => ({
                ...current,
                galleryAssets: [...current.galleryAssets, ...preparedAssets],
            }));
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "We couldn’t prepare these gallery images.",
            );
        } finally {
            setIsPreparingGallery(false);

            if (event.target) {
                event.target.value = "";
            }
        }
    };

    const handleRemoveCover = () =>
    {
        handleChange("coverAsset", null);
    };

    const handleRemoveGalleryAsset = (index: number) =>
    {
        setDraft((current) => ({
            ...current,
            galleryAssets: current.galleryAssets.filter((_, itemIndex) =>
            {
                return itemIndex !== index;
            }),
        }));
    };

    const handleMoveGalleryAsset = (index: number, direction: "left" | "right") =>
    {
        setDraft((current) =>
        {
            const nextAssets = [...current.galleryAssets];
            const nextIndex = direction === "left" ? index - 1 : index + 1;

            if (nextIndex < 0 || nextIndex >= nextAssets.length) {
                return current;
            }

            const currentAsset = nextAssets[index];
            const targetAsset = nextAssets[nextIndex];

            if (!currentAsset || !targetAsset) {
                return current;
            }

            nextAssets[index] = targetAsset;
            nextAssets[nextIndex] = currentAsset;

            return {
                ...current,
                galleryAssets: nextAssets,
            };
        });
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

        if (!draft.coverAsset) {
            setFormError("Please upload a cover image for this portfolio work.");
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

                if (coverInputRef.current) {
                    coverInputRef.current.value = "";
                }

                if (galleryInputRef.current) {
                    galleryInputRef.current.value = "";
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
                        ? "Update a saved portfolio item. You can edit the cover image, gallery images, text, featured state, and category."
                        : "Add a real portfolio work with one required cover image and optional gallery images. Images are compressed in the browser before upload to keep storage usage healthier."}
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

                        <div className="space-y-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Cover image
                                </label>

                                {!draft.coverAsset ? (
                                    <button
                                        type="button"
                                        onClick={() => coverInputRef.current?.click()}
                                        className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-8 text-center transition hover:border-accent"
                                        disabled={isPreparingAsset || isSubmitting}
                                    >
                                        <span className="text-sm font-medium text-foreground">
                                            {isPreparingCover
                                                ? "Preparing cover..."
                                                : "Choose cover image"}
                                        </span>

                                        <span className="mt-2 text-xs text-muted">
                                            JPG, PNG, or WEBP · maximum 8MB before compression
                                        </span>
                                    </button>
                                ) : (
                                    <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background">
                                        <div className="aspect-[4/3] w-full overflow-hidden bg-brand-background">
                                            <img
                                                src={draft.coverAsset.previewUrl}
                                                alt={draft.coverAsset.fileName}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="space-y-4 p-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-foreground">
                                                    {draft.coverAsset.fileName}
                                                </p>

                                                <p className="text-xs text-muted">
                                                    {draft.coverAsset.mimeType} ·{" "}
                                                    {assetService.formatFileSize(
                                                        draft.coverAsset.sizeInBytes,
                                                    )}
                                                    {draft.coverAsset.originalSizeInBytes ? (
                                                        <>
                                                            {" "}
                                                            (from{" "}
                                                            {assetService.formatFileSize(
                                                                draft.coverAsset.originalSizeInBytes,
                                                            )}
                                                            )
                                                        </>
                                                    ) : null}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => coverInputRef.current?.click()}
                                                    disabled={isPreparingAsset || isSubmitting}
                                                >
                                                    Replace cover
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleRemoveCover}
                                                    disabled={isPreparingAsset || isSubmitting}
                                                >
                                                    Remove cover
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept={assetService.acceptedImageMimeTypes.join(",")}
                                    className="hidden"
                                    onChange={handleChooseCoverFile}
                                    disabled={isPreparingAsset || isSubmitting}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-sm font-medium text-foreground">
                                        Gallery images
                                    </label>

                                    <span className="text-xs text-muted">
                                        {draft.galleryAssets.length}/{MAX_GALLERY_IMAGES}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-6 text-center transition hover:border-accent"
                                    disabled={
                                        isPreparingAsset ||
                                        isSubmitting ||
                                        draft.galleryAssets.length >= MAX_GALLERY_IMAGES
                                    }
                                >
                                    <span className="text-sm font-medium text-foreground">
                                        {isPreparingGallery
                                            ? "Preparing gallery images..."
                                            : "Add gallery images"}
                                    </span>

                                    <span className="mt-2 text-xs text-muted">
                                        Optional extra photos for the same project
                                    </span>
                                </button>

                                <input
                                    ref={galleryInputRef}
                                    type="file"
                                    multiple
                                    accept={assetService.acceptedImageMimeTypes.join(",")}
                                    className="hidden"
                                    onChange={handleChooseGalleryFiles}
                                    disabled={
                                        isPreparingAsset ||
                                        isSubmitting ||
                                        draft.galleryAssets.length >= MAX_GALLERY_IMAGES
                                    }
                                />

                                {draft.galleryAssets.length ? (
                                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {draft.galleryAssets.map((asset, index) => (
                                            <div
                                                key={`${asset.id}-${index}`}
                                                className="overflow-hidden rounded-[1.5rem] border border-border bg-background"
                                            >
                                                <div className="aspect-[4/3] overflow-hidden bg-brand-background">
                                                    <img
                                                        src={asset.previewUrl}
                                                        alt={asset.fileName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                <div className="space-y-3 p-4">
                                                    <div className="space-y-1">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {asset.fileName}
                                                        </p>

                                                        <p className="text-xs text-muted">
                                                            {assetService.formatFileSize(asset.sizeInBytes)}
                                                            {asset.originalSizeInBytes ? (
                                                                <>
                                                                    {" "}
                                                                    (from{" "}
                                                                    {assetService.formatFileSize(
                                                                        asset.originalSizeInBytes,
                                                                    )}
                                                                    )
                                                                </>
                                                            ) : null}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() =>
                                                                handleMoveGalleryAsset(index, "left")
                                                            }
                                                            disabled={index === 0 || isPreparingAsset || isSubmitting}
                                                        >
                                                            Move left
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() =>
                                                                handleMoveGalleryAsset(index, "right")
                                                            }
                                                            disabled={
                                                                index === draft.galleryAssets.length - 1 ||
                                                                isPreparingAsset ||
                                                                isSubmitting
                                                            }
                                                        >
                                                            Move right
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleRemoveGalleryAsset(index)}
                                                            disabled={isPreparingAsset || isSubmitting}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-[1.5rem] border border-dashed border-border bg-background px-4 py-4">
                                        <p className="text-sm leading-7 text-muted">
                                            No gallery images yet. This item can still be saved with
                                            only a cover image.
                                        </p>
                                    </div>
                                )}
                            </div>
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