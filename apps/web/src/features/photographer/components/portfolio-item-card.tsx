import type {
    PhotographerPortfolioItem,
    PortfolioItemClassificationStatus,
} from "../types/portfolio.types";

interface PortfolioItemCardProps
{
    item: PhotographerPortfolioItem;
    onOpen?: () => void;
}

type ClassificationStatusConfig = {
    label: string;
    centerLabel: string;
    dotClassName: string;
};

const CLASSIFICATION_STATUS: Record<
    PortfolioItemClassificationStatus,
    ClassificationStatusConfig
> = {
    not_requested: {
        label: "AI pending",
        centerLabel: "AI not started",
        dotClassName: "bg-muted",
    },
    queued: {
        label: "Queued",
        centerLabel: "Waiting for AI",
        dotClassName: "bg-ai",
    },
    processing: {
        label: "Analyzing",
        centerLabel: "Analyzing image",
        dotClassName: "bg-ai animate-pulse",
    },
    completed: {
        label: "AI done",
        centerLabel: "Classification ready",
        dotClassName: "bg-white",
    },
    failed: {
        label: "Needs retry",
        centerLabel: "Needs retry",
        dotClassName: "bg-red-500",
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
    const statusConfig = CLASSIFICATION_STATUS[item.classificationStatus];
    const primaryStyleLabel = item.detectedPrimaryStyle
        ? formatStyleLabel(item.detectedPrimaryStyle)
        : null;
    const primaryConfidence = formatConfidence(item.detectedPrimaryScore);

    return (
        <article className="group relative overflow-hidden bg-border/40">
            <button
                type="button"
                onClick={onOpen}
                className="relative block w-full cursor-pointer overflow-hidden text-left"
                aria-label={`Open ${item.title}`}
            >
                <div className="relative aspect-[3/4] overflow-hidden bg-border/40">
                    <img
                        src={item.coverAsset.previewUrl}
                        alt={item.title}
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />

                    <div className="absolute inset-0 bg-foreground/0 transition duration-200 group-hover:bg-foreground/55" />

                    <div className="absolute right-1.5 top-1.5 flex items-center gap-1.5 sm:right-2 sm:top-2">
                        {item.galleryAssets.length > 0 ? (
                            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
                                +{item.galleryAssets.length}
                            </span>
                        ) : null}

                        {/* {item.isFeatured ? (
                            <span className="text-sm leading-none text-white drop-shadow">
                                ★
                            </span>
                        ) : null}

                        <span
                            className={`h-2.5 w-2.5 rounded-full shadow-sm ${statusConfig.dotClassName}`}
                            aria-label={statusConfig.label}
                        /> */}
                    </div>

                    <div className="absolute inset-0 hidden translate-y-2 flex-col items-center justify-center gap-2 px-4 text-center opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
                        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
                            AI classification
                        </p>

                        <p className="font-serif text-xl leading-none text-white">
                            {primaryStyleLabel ?? statusConfig.centerLabel}
                        </p>

                        <p className="text-xs font-medium text-white/80">
                            {primaryConfidence
                                ? `${primaryConfidence} confidence`
                                : "Open to inspect"}
                        </p>
                    </div>
                </div>
            </button>
        </article>
    );
};