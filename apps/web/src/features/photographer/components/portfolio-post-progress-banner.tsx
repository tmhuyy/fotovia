import { Button } from "../../../components/ui/button";
import type { PortfolioPostJob } from "../store/portfolio-post.store";

interface PortfolioPostProgressBannerProps
{
    job: PortfolioPostJob;
    onDismiss?: () => void;
}

const statusCopy = {
    uploading: "Uploading",
    saving: "Posting",
    completed: "Posted",
    failed: "Failed",
} satisfies Record<PortfolioPostJob["status"], string>;

export const PortfolioPostProgressBanner = ({
    job,
    onDismiss,
}: PortfolioPostProgressBannerProps) =>
{
    const isFailed = job.status === "failed";
    const isCompleted = job.status === "completed";

    return (
        <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-ai/15 px-3 py-1 text-xs font-medium text-foreground">
                            {statusCopy[job.status]}
                        </span>

                        <span className="text-xs uppercase tracking-[0.2em] text-muted">
                            Portfolio post
                        </span>
                    </div>

                    <div>
                        <p className="font-serif text-2xl text-foreground">
                            {job.operation === "update"
                                ? `Updating collection for ${job.authorName}`
                                : `Posting to ${job.authorName}`}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-muted">
                            {isFailed ? job.error ?? job.message : job.message}
                        </p>
                    </div>
                </div>

                {isFailed && onDismiss ? (
                    <Button
                        type="button"
                        variant="secondary"
                        className="rounded-full"
                        onClick={onDismiss}
                    >
                        Dismiss
                    </Button>
                ) : null}
            </div>

            <div className="h-1.5 bg-border/70">
                <div
                    className={`h-full rounded-r-full transition-all duration-500 ${isFailed
                        ? "bg-foreground/40"
                        : isCompleted
                            ? "bg-foreground"
                            : "bg-ai"
                        }`}
                    style={{
                        width: `${job.progress}%`,
                    }}
                />
            </div>
        </section>
    );
};