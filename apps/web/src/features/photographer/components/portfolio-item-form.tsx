"use client";

import
{
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { toast } from "sonner";

import type { AssetPreview } from "../../asset/types/asset.types";
import { Button } from "../../../components/ui/button";
import { assetService } from "../../../services/asset.service";
import type { PortfolioItemDraft } from "../types/portfolio.types";

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
    const [draggingGalleryIndex, setDraggingGalleryIndex] = useState<
        number | null
    >(null);

    useEffect(() =>
    {
        setDraft(initialValue ?? emptyDraft);
        setFormError(null);
        setDraggingGalleryIndex(null);
    }, [initialValue, mode]);

    const isEditMode = mode === "edit";
    const isPreparingAsset = isPreparingCover || isPreparingGallery;

    const remainingHint = useMemo(() =>
    {
        if (!draft.coverAsset) {
            return "Choose a cover image first so Fotovia has a strong primary image to analyze and show publicly.";
        }

        if (!draft.description.trim()) {
            return "Add a short description so this work still has human context alongside the AI-detected style.";
        }

        if (draft.galleryAssets.length === 0) {
            return "You can save with only a cover image. Gallery images are optional, but they provide stronger extra signals for AI style detection.";
        }

        return "This item is ready. After save, Fotovia will queue AI style detection from the cover and gallery images automatically.";
    }, [draft.coverAsset, draft.description, draft.galleryAssets.length]);

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
            toast.error("We couldn’t prepare this cover image.");
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
            const message = `You can upload up to ${MAX_GALLERY_IMAGES} gallery images for one portfolio item.`;
            setFormError(message);
            toast.error("Gallery image limit reached", {
                description: message,
            });

            if (event.target) {
                event.target.value = "";
            }

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
            const message =
                error instanceof Error
                    ? error.message
                    : "We couldn’t prepare these gallery images.";

            setFormError(message);
            toast.error("Gallery image preparation failed", {
                description: message,
            });
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
            galleryAssets: current.galleryAssets.filter(
                (_, itemIndex) => itemIndex !== index,
            ),
        }));
    };

    const handleGalleryDragStart = (index: number) =>
    {
        setDraggingGalleryIndex(index);
    };

    const handleGalleryDrop = (targetIndex: number) =>
    {
        if (draggingGalleryIndex === null || draggingGalleryIndex === targetIndex) {
            setDraggingGalleryIndex(null);
            return;
        }

        setDraft((current) =>
        {
            const nextAssets = [...current.galleryAssets];
            const [draggedAsset] = nextAssets.splice(draggingGalleryIndex, 1);

            if (draggedAsset) {
                nextAssets.splice(targetIndex, 0, draggedAsset);
            }

            return {
                ...current,
                galleryAssets: nextAssets,
            };
        });

        setDraggingGalleryIndex(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) =>
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
        <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            Portfolio workspace
                        </p>

                        <div className="space-y-3">
                            <h2 className="font-serif text-4xl text-foreground">
                                {isEditMode
                                    ? "Edit portfolio work"
                                    : "Upload portfolio work"}
                            </h2>

                            <p className="max-w-4xl text-sm leading-7 text-muted">
                                {isEditMode
                                    ? "Update the images, description, or featured state for this saved work. Fotovia will use the latest media set for AI style detection."
                                    : "Add a real portfolio work with one required cover image and optional gallery images. Fotovia now detects the photography style automatically after save, so you no longer need to choose a manual category."}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_360px]">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label
                                    htmlFor="portfolio-title"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Title
                                </label>

                                <input
                                    id="portfolio-title"
                                    type="text"
                                    value={draft.title}
                                    onChange={(event) =>
                                        handleChange("title", event.target.value)
                                    }
                                    placeholder="Example: Sunset wedding ceremony"
                                    className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent"
                                    disabled={isPreparingAsset || isSubmitting}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">
                                    Cover image
                                </label>

                                {!draft.coverAsset ? (
                                    <button
                                        type="button"
                                        onClick={() => coverInputRef.current?.click()}
                                        className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-10 text-center transition hover:border-accent"
                                        disabled={isPreparingAsset || isSubmitting}
                                    >
                                        <span className="text-lg font-medium text-foreground">
                                            {isPreparingCover
                                                ? "Preparing cover..."
                                                : "Choose cover image"}
                                        </span>
                                        <span className="mt-2 text-sm text-muted">
                                            JPG, PNG, or WEBP · maximum 8MB before
                                            compression
                                        </span>
                                    </button>
                                ) : (
                                    <div className="overflow-hidden rounded-[1.5rem] border border-border bg-background">
                                        <div className="aspect-[4/3] overflow-hidden">
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

                                                <p className="text-sm text-muted">
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
                                                    onClick={() =>
                                                        coverInputRef.current?.click()
                                                    }
                                                    disabled={
                                                        isPreparingAsset || isSubmitting
                                                    }
                                                >
                                                    Replace cover
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleRemoveCover}
                                                    disabled={
                                                        isPreparingAsset || isSubmitting
                                                    }
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
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleChooseCoverFile}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-sm font-medium text-foreground">
                                        Gallery images
                                    </label>

                                    <span className="text-sm text-muted">
                                        {draft.galleryAssets.length}/{MAX_GALLERY_IMAGES}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-background px-5 py-8 text-center transition hover:border-accent"
                                    disabled={
                                        isPreparingAsset ||
                                        isSubmitting ||
                                        draft.galleryAssets.length >= MAX_GALLERY_IMAGES
                                    }
                                >
                                    <span className="text-lg font-medium text-foreground">
                                        {isPreparingGallery
                                            ? "Preparing gallery images..."
                                            : "Add gallery images"}
                                    </span>

                                    <span className="mt-2 text-sm text-muted">
                                        Optional extra photos for the same project
                                    </span>
                                </button>

                                <input
                                    ref={galleryInputRef}
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleChooseGalleryFiles}
                                    disabled={
                                        draft.galleryAssets.length >= MAX_GALLERY_IMAGES
                                    }
                                />

                                {draft.galleryAssets.length ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted">
                                            Drag and drop thumbnails to reorder your
                                            gallery.
                                        </p>

                                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                            {draft.galleryAssets.map((asset, index) =>
                                            {
                                                const isDragging =
                                                    draggingGalleryIndex === index;

                                                return (
                                                    <div
                                                        key={`${asset.previewUrl}-${index}`}
                                                        className={`overflow-hidden rounded-[1.5rem] border bg-background transition ${isDragging
                                                            ? "border-accent shadow-sm"
                                                            : "border-border"
                                                            }`}
                                                        draggable
                                                        onDragStart={() =>
                                                            handleGalleryDragStart(index)
                                                        }
                                                        onDragOver={(event) =>
                                                        {
                                                            event.preventDefault();
                                                        }}
                                                        onDrop={() =>
                                                            handleGalleryDrop(index)
                                                        }
                                                        onDragEnd={() =>
                                                            setDraggingGalleryIndex(null)
                                                        }
                                                    >
                                                        <div className="aspect-[4/3] overflow-hidden">
                                                            <img
                                                                src={asset.previewUrl}
                                                                alt={asset.fileName}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="space-y-3 p-4">
                                                            <div className="space-y-1">
                                                                <p className="line-clamp-1 text-sm font-medium text-foreground">
                                                                    {asset.fileName}
                                                                </p>

                                                                <p className="text-sm text-muted">
                                                                    {assetService.formatFileSize(
                                                                        asset.sizeInBytes,
                                                                    )}
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

                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                                                    Position {index + 1}
                                                                </p>

                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRemoveGalleryAsset(
                                                                            index,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isPreparingAsset ||
                                                                        isSubmitting
                                                                    }
                                                                    aria-label={`Remove ${asset.fileName}`}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-[1.5rem] border border-border bg-background px-4 py-5">
                                        <p className="text-sm text-muted">
                                            No gallery images yet. This item can still
                                            be saved with only a cover image.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
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
                                    rows={7}
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
                                    AI style detection
                                </p>

                                <p className="mt-2 text-sm leading-7 text-muted">
                                    Fotovia analyzes the cover image first and uses
                                    gallery images as extra signals after save. You do
                                    not need to choose a manual category here anymore.
                                </p>
                            </div>

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
                </div>
            </form>
        </div>
    );
};