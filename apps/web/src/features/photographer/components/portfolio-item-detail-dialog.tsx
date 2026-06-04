"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Badge } from "../../../components/ui/badge";
import type {
    PhotographerPortfolioItem,
    PortfolioItemClassificationStatus,
    PortfolioStyleDistributionEntry,
} from "../types/portfolio.types";

interface PortfolioItemDetailDialogProps
{
    item: PhotographerPortfolioItem | null;
    actions?: ReactNode;
    authorName: string;
    authorAvatarUrl?: string | null;
    onClose: () => void;
    onOpenPreviousItem?: () => void;
    onOpenNextItem?: () => void;
    hasPreviousItem?: boolean;
    hasNextItem?: boolean;
}

type ClassificationStatusBadgeConfig = {
    label: string;
    helper: string;
    variant: "neutral" | "accent" | "ai";
    className?: string;
};

const CLASSIFICATION_STATUS_BADGE: Record<
    PortfolioItemClassificationStatus,
    ClassificationStatusBadgeConfig
> = {
    not_requested: {
        label: "AI pending",
        helper: "AI classification has not started.",
        variant: "neutral",
    },
    queued: {
        label: "Queued",
        helper: "Waiting for AI analysis.",
        variant: "ai",
    },
    processing: {
        label: "Analyzing",
        helper: "Fotovia is analyzing this collection.",
        variant: "ai",
    },
    completed: {
        label: "AI completed",
        helper: "AI style detection finished successfully.",
        variant: "accent",
    },
    failed: {
        label: "Needs retry",
        helper: "The last AI run did not finish.",
        variant: "neutral",
        className: "border border-border text-foreground",
    },
};

const getInitials = (value: string) =>
{
    return value
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();
};

const formatCreatedAt = (value: string) =>
{
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return "Unknown date";
    }

    return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatStyleLabel = (value: string) =>
{
    return value
        .split(/[\s-_]+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
};

const formatConfidence = (value: number | null) =>
{
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
    }

    return `${Math.round(value * 100)}%`;
};

const resolveSecondaryStyles = (
    item: PhotographerPortfolioItem,
): Array<{ label: string; score: number | null }> =>
{
    const fromDistribution = item.detectedStyleDistribution
        .filter((entry) => entry.label !== item.detectedPrimaryStyle)
        .slice(0, 3)
        .map((entry: PortfolioStyleDistributionEntry) => ({
            label: entry.label,
            score: entry.score,
        }));

    if (fromDistribution.length > 0) {
        return fromDistribution;
    }

    return item.detectedSecondaryStyles.slice(0, 3).map((label) => ({
        label,
        score: null,
    }));
};

type ClassificationStepState = "completed" | "active" | "pending" | "failed";

const getClassificationJourney = (item: PhotographerPortfolioItem) =>
{
    const isQueued = item.classificationStatus === "queued";
    const isProcessing = item.classificationStatus === "processing";
    const isCompleted = item.classificationStatus === "completed";
    const isFailed = item.classificationStatus === "failed";

    return [
        {
            label: "Upload received",
            helper: "Cover and gallery images are saved.",
            state: "completed" as ClassificationStepState,
        },
        {
            label: isQueued ? "Waiting in AI queue" : "Running style classifier",
            helper: isQueued
                ? "Fotovia is preparing this collection for model inference."
                : "The model is reading visual signals from the image set.",
            state: isCompleted
                ? ("completed" as ClassificationStepState)
                : isFailed
                    ? ("failed" as ClassificationStepState)
                    : isQueued || isProcessing
                        ? ("active" as ClassificationStepState)
                        : ("pending" as ClassificationStepState),
        },
        {
            label: "Style result ready",
            helper: isCompleted
                ? "The detected style is ready for portfolio discovery."
                : "Primary and secondary style confidence will appear here.",
            state: isCompleted
                ? ("completed" as ClassificationStepState)
                : ("pending" as ClassificationStepState),
        },
    ];
};

const ClassificationStepDot = ({
    state,
}: {
    state: ClassificationStepState;
}) =>
{
    if (state === "completed") {
        return (
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                ✓
            </span>
        );
    }

    if (state === "active") {
        return (
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ai/20">
                <span className="absolute h-5 w-5 animate-ping rounded-full bg-ai/30" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-ai" />
            </span>
        );
    }

    if (state === "failed") {
        return (
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-foreground text-[10px] text-foreground">
                !
            </span>
        );
    }

    return (
        <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-border bg-surface" />
    );
};

const AiIndeterminateBar = () =>
{
    return (
        <div className="relative h-1.5 overflow-hidden rounded-full bg-border/70">
            <div className="fotovia-ai-indeterminate-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-foreground" />

            <style jsx>{`
        .fotovia-ai-indeterminate-bar {
          animation: fotovia-ai-indeterminate 1.25s ease-in-out infinite;
        }

        @keyframes fotovia-ai-indeterminate {
          0% {
            transform: translateX(-130%);
          }

          55% {
            transform: translateX(135%);
          }

          100% {
            transform: translateX(330%);
          }
        }
      `}</style>
        </div>
    );
};

const AiProcessingPanel = ({
    status,
}: {
    status: PortfolioItemClassificationStatus;
}) =>
{
    const isQueued = status === "queued";

    return (
        <div className="mt-4 space-y-4">
            <AiIndeterminateBar />

            <div className="rounded-[1rem] border border-dashed border-border bg-surface px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ai opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ai" />
                    </span>

                    <p className="text-sm font-medium text-foreground">
                        {isQueued
                            ? "Waiting in AI queue"
                            : "Running visual style analysis"}
                    </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-muted">
                    {isQueued
                        ? "Fotovia has received this collection. The classifier will start reading the image set shortly."
                        : "The model is analyzing the cover image and gallery images. This view will update automatically when the style result is ready."}
                </p>
            </div>
        </div>
    );
};

export const PortfolioItemDetailDialog = ({
    item,
    actions,
    authorName,
    authorAvatarUrl,
    onClose,
    onOpenPreviousItem,
    onOpenNextItem,
    hasPreviousItem = false,
    hasNextItem = false,
}: PortfolioItemDetailDialogProps) =>
{
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

    const images = useMemo(() =>
    {
        if (!item) {
            return [];
        }

        return [
            {
                id: item.coverAsset.assetId ?? item.coverAsset.previewUrl,
                previewUrl: item.coverAsset.previewUrl,
                fileName: item.coverAsset.fileName,
                label: "Cover",
            },
            ...item.galleryAssets.map((asset, index) => ({
                id: asset.assetId ?? `${asset.previewUrl}-${index}`,
                previewUrl: asset.previewUrl,
                fileName: asset.fileName,
                label: `Gallery ${index + 1}`,
            })),
        ];
    }, [item]);

    useEffect(() =>
    {
        setActiveImageIndex(0);
        setIsActionMenuOpen(false);
    }, [item?.id]);

    useEffect(() =>
    {
        if (!item) {
            return;
        }

        images.forEach((image) =>
        {
            const preloadImage = new Image();
            preloadImage.src = image.previewUrl;
        });
    }, [images, item]);

    useEffect(() =>
    {
        if (!item) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape") {
                if (isActionMenuOpen) {
                    setIsActionMenuOpen(false);
                    return;
                }

                onClose();
            }

            if (event.key === "ArrowRight") {
                setActiveImageIndex((current) =>
                    images.length ? (current + 1) % images.length : current,
                );
            }

            if (event.key === "ArrowLeft") {
                setActiveImageIndex((current) =>
                    images.length
                        ? (current - 1 + images.length) % images.length
                        : current,
                );
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () =>
        {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [images.length, isActionMenuOpen, item, onClose]);

    if (!item) {
        return null;
    }

    const statusConfig = CLASSIFICATION_STATUS_BADGE[item.classificationStatus];
    const primaryStyleLabel = item.detectedPrimaryStyle
        ? formatStyleLabel(item.detectedPrimaryStyle)
        : null;
    const primaryConfidence = formatConfidence(item.detectedPrimaryScore);
    const secondaryStyles = resolveSecondaryStyles(item);
    const classificationJourney = getClassificationJourney(item);

    const isAiQueued = item.classificationStatus === "queued";
    const isAiProcessing = item.classificationStatus === "processing";
    const isAiInProgress = isAiQueued || isAiProcessing;
    const isAiCompleted = item.classificationStatus === "completed";
    const isAiFailed = item.classificationStatus === "failed";

    const styleTags = [
        ...(primaryStyleLabel ? [primaryStyleLabel] : []),
        ...secondaryStyles.map((style) => formatStyleLabel(style.label)),
    ];

    const goToPreviousImage = () =>
    {
        setActiveImageIndex((current) =>
            images.length ? (current - 1 + images.length) % images.length : current,
        );
    };

    const goToNextImage = () =>
    {
        setActiveImageIndex((current) =>
            images.length ? (current + 1) % images.length : current,
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) =>
            {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            {hasPreviousItem ? (
                <button
                    type="button"
                    onClick={onOpenPreviousItem}
                    className="absolute left-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/95 text-3xl text-foreground shadow-sm backdrop-blur transition hover:scale-105 lg:flex"
                    aria-label="Open previous collection"
                >
                    ‹
                </button>
            ) : null}

            {hasNextItem ? (
                <button
                    type="button"
                    onClick={onOpenNextItem}
                    className="absolute right-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/95 text-3xl text-foreground shadow-sm backdrop-blur transition hover:scale-105 lg:flex"
                    aria-label="Open next collection"
                >
                    ›
                </button>
            ) : null}

            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="portfolio-detail-title"
                className="grid max-h-[84vh] w-full max-w-[1080px] overflow-hidden rounded-md border border-border bg-surface shadow-2xl lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]"
            >
                <div className="relative flex min-h-[48vh] items-center justify-center bg-foreground lg:min-h-[74vh]">
                    <div className="relative h-full min-h-[48vh] w-full overflow-hidden lg:min-h-[74vh]">
                        {images.map((image, index) => (
                            <img
                                key={image.id}
                                src={image.previewUrl}
                                alt={image.fileName}
                                loading="eager"
                                decoding="async"
                                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-150 ${index === activeImageIndex ? "opacity-100" : "opacity-0"
                                    }`}
                            />
                        ))}
                    </div>

                    {images.length > 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={goToPreviousImage}
                                className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-2xl text-foreground shadow-sm backdrop-blur transition hover:bg-surface"
                                aria-label="Previous image"
                            >
                                ‹
                            </button>

                            <button
                                type="button"
                                onClick={goToNextImage}
                                className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-2xl text-foreground shadow-sm backdrop-blur transition hover:bg-surface"
                                aria-label="Next image"
                            >
                                ›
                            </button>

                            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                                {images.map((image, index) => (
                                    <button
                                        key={image.id}
                                        type="button"
                                        onClick={() => setActiveImageIndex(index)}
                                        className={`h-2.5 w-2.5 cursor-pointer rounded-full transition ${index === activeImageIndex
                                            ? "bg-surface"
                                            : "bg-surface/45 hover:bg-surface/70"
                                            }`}
                                        aria-label={`Open ${image.label}`}
                                    />
                                ))}
                            </div>
                        </>
                    ) : null}

                    {images.length > 1 ? (
                        <div className="absolute left-4 top-4 z-10 rounded-full bg-surface/92 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur">
                            {activeImageIndex + 1}/{images.length}
                        </div>
                    ) : null}
                </div>

                <aside className="flex max-h-[84vh] flex-col overflow-y-auto">
                    <div className="relative flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                            {authorAvatarUrl ? (
                                <img
                                    src={authorAvatarUrl}
                                    alt={authorName}
                                    className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                                />
                            ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-foreground">
                                    {getInitials(authorName)}
                                </div>
                            )}

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {authorName}
                                </p>

                                <p className="truncate text-xs text-muted">
                                    {statusConfig.label}
                                    {primaryStyleLabel ? ` · ${primaryStyleLabel}` : ""}
                                </p>
                            </div>
                        </div>

                        {actions ? (
                            <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsActionMenuOpen((current) => !current)}
                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl text-foreground transition hover:bg-background"
                                    aria-label="Open portfolio actions"
                                    aria-expanded={isActionMenuOpen}
                                >
                                    …
                                </button>

                                {isActionMenuOpen ? (
                                    <div className="absolute right-0 top-11 z-20 w-56 rounded-[1.25rem] border border-border bg-surface p-2 shadow-xl">
                                        <div className="flex flex-col gap-2">{actions}</div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-5 px-5 py-5">
                        <div className="space-y-2">
                            <h2
                                id="portfolio-detail-title"
                                className="font-serif text-2xl leading-tight text-foreground"
                            >
                                {item.title}
                            </h2>

                            {item.description ? (
                                <p className="text-sm leading-7 text-foreground">
                                    <span className="font-semibold">{authorName}</span>{" "}
                                    {item.description}
                                </p>
                            ) : null}

                            <p className="text-xs uppercase tracking-[0.16em] text-muted">
                                Added {formatCreatedAt(item.createdAt)}
                            </p>
                        </div>

                        {styleTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {styleTags.map((style) => (
                                    <Badge key={style} variant="ai">
                                        {style}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}

                        <div className="rounded-[1.25rem] border border-border bg-background p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                        AI result
                                    </p>

                                    <p className="mt-2 text-base font-medium text-foreground">
                                        {isAiCompleted
                                            ? primaryStyleLabel ?? "Style detected"
                                            : isAiQueued
                                                ? "Waiting for AI analysis."
                                                : isAiProcessing
                                                    ? "Analyzing visual style."
                                                    : isAiFailed
                                                        ? "Classification needs retry."
                                                        : primaryStyleLabel ?? statusConfig.helper}
                                    </p>
                                </div>

                                <Badge
                                    variant={statusConfig.variant}
                                    className={statusConfig.className}
                                >
                                    {statusConfig.label}
                                </Badge>
                            </div>

                            {isAiInProgress ? (
                                <AiProcessingPanel status={item.classificationStatus} />
                            ) : null}

                            {isAiCompleted && primaryConfidence ? (
                                <div className="mt-4 space-y-3">
                                    <div className="space-y-2">
                                        <div className="h-2 overflow-hidden rounded-full bg-border/70">
                                            <div
                                                className="h-full rounded-full bg-foreground"
                                                style={{ width: primaryConfidence }}
                                            />
                                        </div>

                                        <p className="text-xs text-muted">
                                            Primary confidence: {primaryConfidence}
                                        </p>
                                    </div>

                                    {secondaryStyles.length > 0 ? (
                                        <div className="space-y-2">
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted">
                                                Secondary confidence
                                            </p>

                                            <div className="grid gap-2">
                                                {secondaryStyles.map((style) =>
                                                {
                                                    const styleConfidence =
                                                        typeof style.score === "number" && Number.isFinite(style.score)
                                                            ? `${Math.round(style.score * 100)}%`
                                                            : null;

                                                    return (
                                                        <div
                                                            key={style.label}
                                                            className="flex items-center justify-between gap-3 rounded-full bg-surface px-3 py-2 text-xs"
                                                        >
                                                            <span className="font-medium text-foreground">
                                                                {formatStyleLabel(style.label)}
                                                            </span>

                                                            <span className="text-muted">
                                                                {styleConfidence ?? "Signal"}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {isAiFailed ? (
                                <p className="mt-4 text-sm leading-6 text-muted">
                                    The last AI run did not finish. Open the menu and choose Retry AI to send
                                    this collection back to the classifier.
                                </p>
                            ) : null}
                        </div>

                        <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                    Classification journey
                                </p>

                                {isAiCompleted ? (
                                    <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                                        Completed
                                    </span>
                                ) : isAiInProgress ? (
                                    <span className="rounded-full bg-ai/15 px-3 py-1 text-xs font-medium text-foreground">
                                        Live
                                    </span>
                                ) : isAiFailed ? (
                                    <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                                        Needs retry
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                                        Pending
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 grid gap-3 text-sm">
                                {classificationJourney.map((step) =>
                                {
                                    const isMuted = step.state === "pending";

                                    return (
                                        <div key={step.label} className="flex gap-3">
                                            <ClassificationStepDot state={step.state} />

                                            <div className="space-y-0.5">
                                                <p className={isMuted ? "text-muted" : "text-foreground"}>
                                                    {step.label}
                                                </p>

                                                <p className="text-xs leading-5 text-muted">
                                                    {step.helper}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    );
};