import { Badge } from "../../../components/ui/badge";
import type {
    PhotographerPortfolioItem,
    PortfolioItemClassificationStatus,
} from "../types/portfolio.types";

interface PortfolioItemCardProps
{
    item: PhotographerPortfolioItem;
    onOpen?: () => void;
}

type ClassificationStatusBadgeConfig = {
    label: string;
    centerLabel: string;
    variant: "neutral" | "accent" | "ai";
    className?: string;
};

const CLASSIFICATION_STATUS_BADGE: Record<
    PortfolioItemClassificationStatus,
    ClassificationStatusBadgeConfig
> = {
    not_requested: {
        label: "AI pending",
        centerLabel: "AI not started",
        variant: "neutral",
    },
    queued: {
        label: "Queued",
        centerLabel: "Waiting for AI",
        variant: "ai",
    },
    processing: {
        label: "Analyzing",
        centerLabel: "Analyzing image",
        variant: "ai",
    },
    completed: {
        label: "AI done",
        centerLabel: "Classification ready",
        variant: "accent",
    },
    failed: {
        label: "Retry",
        centerLabel: "Needs retry",
        variant: "neutral",
        className: "border border-border text-foreground",
    },
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

export const PortfolioItemCard = ({
    item,
    onOpen,
}: PortfolioItemCardProps) =>
{
    const statusConfig = CLASSIFICATION_STATUS_BADGE[item.classificationStatus];
    const primaryStyleLabel = item.detectedPrimaryStyle
        ? formatStyleLabel(item.detectedPrimaryStyle)
        : null;
    const primaryConfidence = formatConfidence(item.detectedPrimaryScore);

    return (
        <article className="group relative overflow-hidden bg-background">
            <button
                type="button"
                onClick={onOpen}
                className="relative block w-full cursor-pointer overflow-hidden text-left"
                aria-label={`Open ${item.title}`}
            >
                <div className="relative aspect-[4/5] overflow-hidden bg-background">
                    <img
                        src={item.coverAsset.previewUrl}
                        alt={item.title}
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-foreground/0 transition duration-300 group-hover:bg-foreground/70" />

                    <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                            {item.isFeatured ? (
                                <span className="rounded-full bg-surface/92 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                                    Featured
                                </span>
                            ) : null}

                            <Badge
                                variant={statusConfig.variant}
                                className={statusConfig.className}
                            >
                                {statusConfig.label}
                            </Badge>
                        </div>

                        {item.galleryAssets.length ? (
                            <span className="rounded-full bg-surface/92 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                                +{item.galleryAssets.length}
                            </span>
                        ) : null}
                    </div>

                    <div className="absolute inset-0 flex translate-y-3 flex-col items-center justify-center gap-4 px-6 text-center opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="space-y-2 text-white">
                            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/70">
                                AI classification
                            </p>

                            <p className="font-serif text-3xl leading-none">
                                {primaryStyleLabel ?? statusConfig.centerLabel}
                            </p>

                            <p className="text-sm font-medium text-white/80">
                                {primaryConfidence
                                    ? `${primaryConfidence} confidence`
                                    : "Open to inspect result"}
                            </p>
                        </div>
                    </div>
                </div>
            </button>
        </article>
    );
};