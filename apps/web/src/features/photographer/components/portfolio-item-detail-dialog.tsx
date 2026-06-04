"use client";

import { useEffect, useMemo, useState, } from "react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import type {
    PhotographerPortfolioItem,
    PortfolioItemClassificationStatus,
    PortfolioStyleDistributionEntry,
} from "../types/portfolio.types";

export interface PortfolioActionMenuItem
{
    label: string;
    tone?: "default" | "danger";
    disabled?: boolean;
    onSelect: () => void;
}

interface PortfolioItemDetailDialogProps
{
    item: PhotographerPortfolioItem | null;
    actionItems?: PortfolioActionMenuItem[];
    authorName: string;
    authorAvatarUrl?: string | null;
    isRetryingClassification?: boolean;
    onRetryClassification?: (item: PhotographerPortfolioItem) => void;
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
        className: "border border-red-200 bg-red-50 text-red-600",
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
            label: isFailed
                ? "Classifier stopped"
                : isQueued
                    ? "Waiting in AI queue"
                    : "Running style classifier",
            helper: isFailed
                ? "The AI job did not finish, so no style result was produced."
                : isQueued
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
                : isFailed
                    ? "Retry AI classification to generate a new style result."
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
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
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

const AiFailurePanel = ({
    error,
    isRetrying,
    onRetry,
}: {
    error?: string | null;
    isRetrying?: boolean;
    onRetry?: () => void;
}) =>
{
    return (
        <div className="mt-4 overflow-hidden rounded-[1rem] border border-red-200 bg-red-50">
            <div className="flex gap-3 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-base font-semibold text-white">
                    !
                </div>

                <div className="min-w-0 space-y-2">
                    <p className="text-sm font-semibold text-red-700">
                        AI classification failed
                    </p>

                    <p className="text-xs leading-5 text-red-700/80">
                        Fotovia could not finish reading this collection. Retry will send
                        the same cover and gallery images back to the classifier.
                    </p>

                    {error ? (
                        <p className="rounded-xl bg-white/70 px-3 py-2 text-xs leading-5 text-red-700">
                            {error}
                        </p>
                    ) : null}

                    <div className="pt-1">
                        <Button
                            type="button"
                            size="sm"
                            onClick={onRetry}
                            disabled={!onRetry || isRetrying}
                            className="rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                            {isRetrying ? "Retrying AI..." : "Retry AI classification"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

type AiStyleAnalysisCardProps = {
    item: PhotographerPortfolioItem;
    statusConfig: ClassificationStatusBadgeConfig;
    primaryStyleLabel: string | null;
    primaryConfidence: string | null;
    secondaryStyles: Array<{ label: string; score: number | null }>;
    classificationJourney: ReturnType<typeof getClassificationJourney>;
    isAiCompleted: boolean;
    isAiInProgress: boolean;
    isAiFailed: boolean;
    isRetryingClassification?: boolean;
    onRetryClassification?: () => void;
    onOpenAnalysis: () => void;
};

const AiStyleAnalysisCard = ({
    item,
    statusConfig,
    primaryStyleLabel,
    primaryConfidence,
    secondaryStyles,
    classificationJourney,
    isAiCompleted,
    isAiInProgress,
    isAiFailed,
    isRetryingClassification = false,
    onRetryClassification,
    onOpenAnalysis,
}: AiStyleAnalysisCardProps) =>
{
    const secondaryPreview = secondaryStyles.slice(0, 2);

    return (
        <div
            className={`rounded-[1.25rem] border p-4 ${isAiFailed
                ? "border-red-200 bg-red-50"
                : isAiInProgress
                    ? "border-ai/30 bg-ai/5"
                    : "border-border bg-background"
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        AI style analysis
                    </p>

                    <h3 className="mt-2 text-base font-semibold text-foreground">
                        {isAiCompleted
                            ? `AI detected ${primaryStyleLabel ?? "a visual style"}`
                            : isAiInProgress
                                ? "Fotovia is reading this collection"
                                : isAiFailed
                                    ? "AI analysis needs retry"
                                    : "AI analysis pending"}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted">
                        {isAiCompleted
                            ? `${primaryConfidence ?? "A"} primary confidence result is ready for discovery.`
                            : isAiInProgress
                                ? "The classifier is checking the cover image and gallery images. This post will update automatically."
                                : isAiFailed
                                    ? "The last classifier run did not finish. Retry will send this collection back to the AI service."
                                    : statusConfig.helper}
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
                <div className="mt-4 space-y-4">
                    <AiIndeterminateBar />

                    <div className="grid gap-3">
                        {classificationJourney.map((step) => (
                            <div key={step.label} className="flex items-start gap-3">
                                <ClassificationStepDot state={step.state} />

                                <div className="min-w-0">
                                    <p
                                        className={
                                            step.state === "pending"
                                                ? "text-sm text-muted"
                                                : "text-sm font-medium text-foreground"
                                        }
                                    >
                                        {step.label}
                                    </p>

                                    <p className="text-xs leading-5 text-muted">
                                        {step.helper}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {isAiCompleted ? (
                <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-border/70">
                            <div
                                className="h-full rounded-full bg-foreground"
                                style={{ width: primaryConfidence ?? "0%" }}
                            />
                        </div>

                        <p className="text-xs text-muted">
                            Primary confidence: {primaryConfidence ?? "Ready"}
                        </p>
                    </div>

                    {secondaryPreview.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {secondaryPreview.map((style) =>
                            {
                                const score = formatConfidence(style.score);

                                return (
                                    <span
                                        key={style.label}
                                        className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground"
                                    >
                                        {formatStyleLabel(style.label)}
                                        {score ? ` · ${score}` : ""}
                                    </span>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {isAiFailed ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        onClick={onRetryClassification}
                        disabled={!onRetryClassification || isRetryingClassification}
                        className="rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                        {isRetryingClassification ? "Retrying AI..." : "Retry AI analysis"}
                    </Button>
                </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                <p className="text-xs text-muted">
                    {item.galleryAssets.length + 1} image
                    {item.galleryAssets.length + 1 > 1 ? "s" : ""} analyzed
                </p>

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onOpenAnalysis}
                    className="rounded-full"
                >
                    View AI analysis
                </Button>
            </div>
        </div>
    );
};

type AiStyleAnalysisSheetProps = {
    item: PhotographerPortfolioItem;
    statusConfig: ClassificationStatusBadgeConfig;
    primaryStyleLabel: string | null;
    primaryConfidence: string | null;
    secondaryStyles: Array<{ label: string; score: number | null }>;
    classificationJourney: ReturnType<typeof getClassificationJourney>;
    isAiCompleted: boolean;
    isAiInProgress: boolean;
    isAiFailed: boolean;
    isRetryingClassification?: boolean;
    onRetryClassification?: () => void;
    onClose: () => void;
};

const AiStyleAnalysisSheet = ({
    item,
    statusConfig,
    primaryStyleLabel,
    primaryConfidence,
    secondaryStyles,
    classificationJourney,
    isAiCompleted,
    isAiInProgress,
    isAiFailed,
    isRetryingClassification = false,
    onRetryClassification,
    onClose,
}: AiStyleAnalysisSheetProps) =>
{
    return (
        <div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            role="presentation"
            onMouseDown={(event) =>
            {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-label="AI style analysis"
                className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] bg-surface shadow-2xl sm:max-w-[760px] sm:rounded-[2rem]"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            Fotovia AI
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-foreground">
                            Style analysis
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-2xl text-foreground transition hover:bg-border/50"
                        aria-label="Close AI analysis"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-5 px-5 py-5">
                    <div
                        className={`rounded-[1.5rem] border p-5 ${isAiFailed
                            ? "border-red-200 bg-red-50"
                            : isAiInProgress
                                ? "border-ai/30 bg-ai/5"
                                : "border-border bg-background"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                    Current status
                                </p>

                                <h3 className="mt-2 text-xl font-semibold text-foreground">
                                    {isAiCompleted
                                        ? primaryStyleLabel ?? "Style detected"
                                        : isAiInProgress
                                            ? "AI analysis is running"
                                            : isAiFailed
                                                ? "AI analysis needs retry"
                                                : "AI analysis pending"}
                                </h3>
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

                        {isAiFailed ? (
                            <AiFailurePanel
                                error={item.classificationError}
                                isRetrying={isRetryingClassification}
                                onRetry={onRetryClassification}
                            />
                        ) : null}

                        {isAiCompleted && primaryConfidence ? (
                            <div className="mt-5 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-muted">
                                        Primary confidence
                                    </span>

                                    <span className="text-sm font-semibold text-foreground">
                                        {primaryConfidence}
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-border/70">
                                    <div
                                        className="h-full rounded-full bg-foreground"
                                        style={{ width: primaryConfidence }}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {isAiCompleted && secondaryStyles.length > 0 ? (
                        <div className="rounded-[1.5rem] border border-border bg-background p-5">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                Secondary confidence
                            </p>

                            <div className="mt-4 grid gap-3">
                                {secondaryStyles.map((style) =>
                                {
                                    const score = formatConfidence(style.score);

                                    return (
                                        <div key={style.label} className="space-y-2">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm font-medium text-foreground">
                                                    {formatStyleLabel(style.label)}
                                                </span>

                                                <span className="text-sm text-muted">
                                                    {score ?? "Signal"}
                                                </span>
                                            </div>

                                            {score ? (
                                                <div className="h-2 overflow-hidden rounded-full bg-border/70">
                                                    <div
                                                        className="h-full rounded-full bg-foreground/70"
                                                        style={{ width: score }}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    <div
                        className={`rounded-[1.5rem] border border-dashed p-5 ${isAiFailed
                            ? "border-red-200 bg-red-50/30"
                            : "border-border bg-background"
                            }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                Classification journey
                            </p>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${isAiCompleted
                                    ? "bg-foreground text-background"
                                    : isAiInProgress
                                        ? "bg-ai/15 text-foreground"
                                        : isAiFailed
                                            ? "border border-red-200 bg-red-50 text-red-600"
                                            : "border border-border text-muted"
                                    }`}
                            >
                                {isAiCompleted
                                    ? "Completed"
                                    : isAiInProgress
                                        ? "Live"
                                        : isAiFailed
                                            ? "Needs retry"
                                            : "Pending"}
                            </span>
                        </div>

                        <div className="mt-5 grid gap-4">
                            {classificationJourney.map((step) => (
                                <div key={step.label} className="flex gap-3">
                                    <ClassificationStepDot state={step.state} />

                                    <div>
                                        <p
                                            className={
                                                step.state === "pending"
                                                    ? "text-sm text-muted"
                                                    : "text-sm font-medium text-foreground"
                                            }
                                        >
                                            {step.label}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-muted">
                                            {step.helper}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border bg-background p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            Image set analyzed
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-surface px-4 py-3">
                                <p className="text-muted">Cover image</p>
                                <p className="mt-1 font-semibold text-foreground">1</p>
                            </div>

                            <div className="rounded-2xl bg-surface px-4 py-3">
                                <p className="text-muted">Gallery images</p>
                                <p className="mt-1 font-semibold text-foreground">
                                    {item.galleryAssets.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export const PortfolioItemDetailDialog = ({
    item,
    actionItems = [],
    authorName,
    authorAvatarUrl,
    isRetryingClassification = false,
    onRetryClassification,
    onClose,
    onOpenPreviousItem,
    onOpenNextItem,
    hasPreviousItem = false,
    hasNextItem = false,
}: PortfolioItemDetailDialogProps) =>
{
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);

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
        setIsAiAnalysisOpen(false);
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
            className="fixed inset-0 z-50 overflow-y-auto bg-surface sm:flex sm:items-center sm:justify-center sm:bg-foreground/70 sm:p-4 sm:backdrop-blur-sm"
            role="presentation"
            onMouseDown={(event) =>
            {
                if (event.target !== event.currentTarget) {
                    return;
                }

                if (window.matchMedia("(min-width: 640px)").matches) {
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
                className="mx-auto min-h-dvh w-full bg-surface sm:grid sm:min-h-0 sm:max-h-[90vh] sm:max-w-[1080px] sm:overflow-hidden sm:rounded-md sm:border sm:border-border sm:shadow-2xl lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]"
            >
                <div className="sticky top-0 z-40 flex h-12 items-center justify-center border-b border-border bg-surface sm:hidden">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute left-3 flex h-10 w-10 items-center justify-center text-3xl leading-none text-foreground"
                        aria-label="Back to portfolio"
                    >
                        ‹
                    </button>

                    <p className="text-sm font-semibold text-foreground">Post</p>
                </div>

                <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:hidden">
                    <div className="flex min-w-0 items-center gap-3">
                        {authorAvatarUrl ? (
                            <img
                                src={authorAvatarUrl}
                                alt={authorName}
                                className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                            />
                        ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-foreground">
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

                    {actionItems.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => setIsActionMenuOpen(true)}
                            className="flex h-9 w-9 items-center justify-center text-xl text-foreground"
                            aria-label="Open portfolio actions"
                            aria-expanded={isActionMenuOpen}
                        >
                            …
                        </button>
                    ) : null}
                </div>
                <div className="relative flex items-center justify-center bg-foreground sm:min-h-[58vh] lg:min-h-[74vh]">
                    <div className="relative aspect-[4/5] w-full overflow-hidden sm:h-full sm:min-h-[58vh] sm:aspect-auto lg:min-h-[74vh]">                        {images.map((image, index) => (
                        <img
                            key={image.id}
                            src={image.previewUrl}
                            alt={image.fileName}
                            loading="eager"
                            decoding="async"
                            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-150 sm:object-contain ${index === activeImageIndex ? "opacity-100" : "opacity-0"
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

                <aside className="flex flex-col overflow-visible sm:max-h-[90vh] sm:overflow-y-auto">
                    <div className="relative hidden items-center justify-between gap-4 border-b border-border px-5 py-4 sm:flex">
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

                        {actionItems.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => setIsActionMenuOpen(true)}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl text-foreground transition hover:bg-background"
                                aria-label="Open portfolio actions"
                                aria-expanded={isActionMenuOpen}
                            >
                                …
                            </button>
                        ) : null}
                    </div>

                    <div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-5 sm:py-5">
                        <div className="space-y-2">
                            <h2
                                id="portfolio-detail-title"
                                className="font-serif text-xl leading-tight text-foreground sm:text-2xl"
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

                        <AiStyleAnalysisCard
                            item={item}
                            statusConfig={statusConfig}
                            primaryStyleLabel={primaryStyleLabel}
                            primaryConfidence={primaryConfidence}
                            secondaryStyles={secondaryStyles}
                            classificationJourney={classificationJourney}
                            isAiCompleted={isAiCompleted}
                            isAiInProgress={isAiInProgress}
                            isAiFailed={isAiFailed}
                            isRetryingClassification={isRetryingClassification}
                            onRetryClassification={
                                onRetryClassification ? () => onRetryClassification(item) : undefined
                            }
                            onOpenAnalysis={() => setIsAiAnalysisOpen(true)}
                        />
                        {/* old design */}
                        {/* <div className={`rounded-[1.25rem] border p-4 ${isAiFailed
                            ? "border-red-200 bg-red-50/35"
                            : "border-border bg-background"
                            }`}>
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
                                                        ? "AI classification failed."
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
                                <AiFailurePanel
                                    error={item.classificationError}
                                    isRetrying={isRetryingClassification}
                                    onRetry={
                                        onRetryClassification
                                            ? () => onRetryClassification(item)
                                            : undefined
                                    }
                                />
                            ) : null}
                        </div>

                        <div className={`rounded-[1.25rem] border border-dashed p-4 ${isAiFailed
                            ? "border-red-200 bg-red-50/25"
                            : "border-border bg-background"
                            }`}>
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
                                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
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
                        </div> */}
                    </div>
                </aside>
            </section>


            {isAiAnalysisOpen ? (
                <AiStyleAnalysisSheet
                    item={item}
                    statusConfig={statusConfig}
                    primaryStyleLabel={primaryStyleLabel}
                    primaryConfidence={primaryConfidence}
                    secondaryStyles={secondaryStyles}
                    classificationJourney={classificationJourney}
                    isAiCompleted={isAiCompleted}
                    isAiInProgress={isAiInProgress}
                    isAiFailed={isAiFailed}
                    isRetryingClassification={isRetryingClassification}
                    onRetryClassification={
                        onRetryClassification ? () => onRetryClassification(item) : undefined
                    }
                    onClose={() => setIsAiAnalysisOpen(false)}
                />
            ) : null}

            {isActionMenuOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 sm:absolute sm:z-30"
                    role="presentation"
                    onMouseDown={(event) =>
                    {
                        if (event.target === event.currentTarget) {
                            setIsActionMenuOpen(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-label="Portfolio actions"
                        className="w-full max-w-xl overflow-hidden rounded-[1.75rem] bg-surface text-center shadow-2xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        {actionItems.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                disabled={action.disabled}
                                onClick={() =>
                                {
                                    if (action.disabled) {
                                        return;
                                    }

                                    setIsActionMenuOpen(false);
                                    action.onSelect();
                                }}
                                className={`flex h-16 w-full items-center justify-center border-b border-border text-base transition disabled:cursor-not-allowed disabled:opacity-60 ${action.tone === "danger"
                                    ? "font-semibold text-red-500 hover:bg-red-50"
                                    : "font-medium text-foreground hover:bg-background"
                                    }`}
                            >
                                {action.label}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => setIsActionMenuOpen(false)}
                            className="flex h-16 w-full items-center justify-center text-base font-medium text-foreground transition hover:bg-background"
                        >
                            Cancel
                        </button>
                    </section>
                </div>
            ) : null}
        </div>
    );
};