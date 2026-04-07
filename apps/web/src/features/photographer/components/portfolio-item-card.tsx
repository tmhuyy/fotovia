import type { ReactNode } from "react";

import { Badge } from "../../../components/ui/badge";
import { assetService } from "../../../services/asset.service";
import type {
    PhotographerPortfolioItem,
    PortfolioItemClassificationStatus,
    PortfolioStyleDistributionEntry,
} from "../types/portfolio.types";

interface PortfolioItemCardProps
{
    item: PhotographerPortfolioItem;
    actions?: ReactNode;
}

type ClassificationStatusBadgeConfig = {
    label: string;
    variant: "neutral" | "accent" | "ai";
    className?: string;
};

const CLASSIFICATION_STATUS_BADGE: Record<
    PortfolioItemClassificationStatus,
    ClassificationStatusBadgeConfig
> = {
    not_requested: {
        label: "Not requested",
        variant: "neutral",
    },
    queued: {
        label: "Queued",
        variant: "ai",
    },
    processing: {
        label: "Processing",
        variant: "ai",
    },
    completed: {
        label: "Completed",
        variant: "accent",
    },
    failed: {
        label: "Failed",
        variant: "neutral",
        className: "border border-border text-foreground",
    },
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
        .map(
            (part) =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join(" ");
};

const formatConfidence = (value: number | null) =>
{
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
    }

    return `${Math.round(value * 100)}% confidence`;
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

export const PortfolioItemCard = ({
    item,
    actions,
}: PortfolioItemCardProps) =>
{
    const isLocalPreview = item.coverAsset.source === "local-preview";
    const statusConfig = CLASSIFICATION_STATUS_BADGE[item.classificationStatus];
    const primaryStyleLabel = item.detectedPrimaryStyle
        ? formatStyleLabel(item.detectedPrimaryStyle)
        : null;
    const primaryConfidence = formatConfidence(item.detectedPrimaryScore);
    const secondaryStyles = resolveSecondaryStyles(item);

    return (
        <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <div className="aspect-[4/3] overflow-hidden bg-brand-background">
                <img
                    src={item.coverAsset.previewUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="space-y-4 p-6">
                <div className="flex flex-wrap gap-2">
                    {item.isFeatured ? <Badge variant="accent">Featured</Badge> : null}

                    <Badge
                        variant={statusConfig.variant}
                        className={statusConfig.className}
                    >
                        AI {statusConfig.label}
                    </Badge>

                    {primaryStyleLabel ? (
                        <Badge variant="ai">Style · {primaryStyleLabel}</Badge>
                    ) : null}

                    {isLocalPreview ? <Badge variant="neutral">Local preview</Badge> : null}

                    {item.galleryAssets.length ? (
                        <Badge variant="neutral">
                            +{item.galleryAssets.length} gallery
                        </Badge>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <h3 className="font-serif text-2xl text-foreground">{item.title}</h3>

                    <p className="text-sm text-muted">
                        Added {formatCreatedAt(item.createdAt)}
                    </p>
                </div>

                <p className="text-sm leading-7 text-muted">{item.description}</p>

                <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            AI style result
                        </p>

                        <Badge
                            variant={statusConfig.variant}
                            className={statusConfig.className}
                        >
                            {statusConfig.label}
                        </Badge>
                    </div>

                    {item.classificationStatus === "completed" && primaryStyleLabel ? (
                        <div className="mt-3 space-y-3">
                            <div>
                                <p className="text-sm text-muted">Primary style</p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {primaryStyleLabel}
                                </p>

                                {primaryConfidence ? (
                                    <p className="mt-1 text-sm text-muted">
                                        {primaryConfidence}
                                    </p>
                                ) : null}
                            </div>

                            {secondaryStyles.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted">
                                        Secondary signals
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {secondaryStyles.map((style) => (
                                            <Badge key={style.label} variant="ai">
                                                {formatStyleLabel(style.label)}
                                                {style.score !== null
                                                    ? ` · ${Math.round(style.score * 100)}%`
                                                    : ""}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {item.classificationStatus === "queued" ||
                        item.classificationStatus === "processing" ? (
                        <p className="mt-3 text-sm leading-6 text-muted">
                            Fotovia is analyzing the cover image and gallery now.
                            This workspace refreshes automatically while the job runs.
                        </p>
                    ) : null}

                    {item.classificationStatus === "failed" ? (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm leading-6 text-muted">
                                The last AI run did not finish successfully. Retry the
                                classification to queue another attempt.
                            </p>

                            {item.classificationError ? (
                                <p className="text-sm leading-6 text-foreground">
                                    {item.classificationError}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    {item.classificationStatus === "not_requested" ? (
                        <p className="mt-3 text-sm leading-6 text-muted">
                            AI classification has not been requested for this item yet.
                        </p>
                    ) : null}
                </div>

                <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Cover image metadata
                    </p>

                    <p className="mt-2 text-sm font-medium text-foreground">
                        {item.coverAsset.fileName}
                    </p>

                    <p className="mt-1 text-sm text-muted">
                        {item.coverAsset.mimeType} ·{" "}
                        {assetService.formatFileSize(item.coverAsset.sizeInBytes)}
                    </p>
                </div>

                {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
        </div>
    );
};