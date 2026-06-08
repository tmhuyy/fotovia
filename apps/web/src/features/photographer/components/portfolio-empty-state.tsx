import Link from "next/link";

import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";

export const PortfolioEmptyState = () =>
{
    return (
        <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
            <div className="space-y-6">
                <div className="space-y-3">
                    <Badge variant="neutral">Start your portfolio</Badge>

                    <div className="space-y-2">
                        <h2 className="font-serif text-3xl text-foreground">
                            Your portfolio is empty.
                        </h2>

                        <p className="max-w-2xl text-sm leading-7 text-muted">
                            Upload your first work so clients can understand your
                            photography style. Fotovia will analyze your cover and
                            gallery images, then suggest style tags automatically.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/photographer/portfolio/new"
                        className={buttonVariants({
                            size: "lg",
                        })}
                    >
                        Add first work
                    </Link>

                    <Link
                        href="/profile"
                        className={buttonVariants({
                            variant: "secondary",
                            size: "lg",
                        })}
                    >
                        Edit profile
                    </Link>
                </div>

                <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Suggested first upload
                    </p>

                    <p className="mt-2 text-sm leading-7 text-muted">
                        Start with one strong cover image and a small gallery of 3
                        to 6 photos. Choose work that shows the type of booking you
                        want clients to request.
                    </p>
                </div>
            </div>
        </div>
    );
};