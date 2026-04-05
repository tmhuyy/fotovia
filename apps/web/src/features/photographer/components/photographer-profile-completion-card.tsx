import Link from "next/link";

import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import type { PhotographerProfileCompletion } from "../../profile/lib/get-profile-completion";

interface PhotographerProfileCompletionCardProps {
    completion: PhotographerProfileCompletion;
    isLoading: boolean;
    isProfileMissing: boolean;
    errorMessage?: string;
}

const CompletionSkeleton = () => {
    return (
        <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm md:p-8">
            <div className="h-6 w-40 animate-pulse rounded bg-border/60" />
            <div className="mt-4 h-10 w-72 animate-pulse rounded bg-border/60" />
            <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-border/60" />
            <div className="mt-8 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-16 animate-pulse rounded-2xl bg-background"
                    />
                ))}
            </div>
        </div>
    );
};

export const PhotographerProfileCompletionCard = ({
    completion,
    isLoading,
    isProfileMissing,
    errorMessage,
}: PhotographerProfileCompletionCardProps) => {
    if (isLoading) {
        return <CompletionSkeleton />;
    }

    if (errorMessage && !isProfileMissing) {
        return (
            <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm md:p-8">
                <Badge variant="accent">Profile completion</Badge>

                <h2 className="mt-4 text-2xl font-semibold text-foreground">
                    We couldn’t read your profile progress right now.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                    {errorMessage}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/profile"
                        className={buttonVariants({ size: "lg" })}
                    >
                        Open profile
                    </Link>
                </div>
            </div>
        );
    }

    if (isProfileMissing) {
        return (
            <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm md:p-8">
                <Badge variant="accent">Profile completion</Badge>

                <h2 className="mt-4 text-2xl font-semibold text-foreground">
                    Your photographer profile foundation is not ready yet.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                    Create your real profile first, then this workspace can
                    track what is complete and what still needs attention.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/profile"
                        className={buttonVariants({ size: "lg" })}
                    >
                        Create profile foundation
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <Badge variant="accent">Profile completion</Badge>

                    <h2 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">
                        {completion.isComplete
                            ? "Your profile foundation is ready."
                            : `${completion.completionPercentage}% complete`}
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                        {completion.isComplete
                            ? "Your core photographer profile is in a strong state for future portfolio and booking phases."
                            : `You have completed ${completion.completedCount} of ${completion.totalCount} profile areas. Finish the missing details so later marketplace flows have a stronger foundation.`}
                    </p>
                </div>

                <Link
                    href="/profile"
                    className={buttonVariants({
                        size: "lg",
                        variant: completion.isComplete ? "secondary" : undefined,
                    })}
                >
                    {completion.isComplete
                        ? "Review profile"
                        : "Complete profile"}
                </Link>
            </div>

            <div className="mt-6">
                <div className="h-3 w-full overflow-hidden rounded-full bg-background">
                    <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${completion.completionPercentage}%` }}
                    />
                </div>
            </div>

            <div className="mt-8 grid gap-3">
                {completion.items.map((item) => (
                    <div
                        key={item.key}
                        className="flex items-start gap-4 rounded-2xl border border-border bg-background px-4 py-4"
                    >
                        <div
                            className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                item.isComplete
                                    ? "bg-accent text-background"
                                    : "border border-border bg-surface text-muted"
                            }`}
                        >
                            {item.isComplete ? "✓" : "•"}
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                                {item.label}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-muted">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {!completion.isComplete ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Missing now
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                        {completion.missingItems
                            .map((item) => item.label)
                            .join(", ")}
                        .
                    </p>
                </div>
            ) : null}
        </div>
    );
};
