import Link from "next/link";

import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";

export const PortfolioEmptyState = () =>
{
    return (
        <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
            <div className="space-y-6">
                <div className="space-y-3">
                    <Badge variant="neutral">Real portfolio persistence</Badge>

                    <div className="space-y-2">
                        <h2 className="font-serif text-3xl text-foreground">
                            Your portfolio is still empty.
                        </h2>

                        <p className="max-w-2xl text-sm leading-7 text-muted">
                            Upload your first real work so your photographer workspace starts
                            reflecting saved backend content instead of browser-local demo
                            data.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/profile"
                        className={buttonVariants({
                            variant: "secondary",
                            size: "lg",
                        })}
                    >
                        Review profile first
                    </Link>

                    <Link
                        href="/photographer/dashboard"
                        className={buttonVariants({
                            size: "lg",
                        })}
                    >
                        Back to dashboard
                    </Link>
                </div>

                <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Suggested first portfolio mix
                    </p>

                    <p className="mt-2 text-sm leading-7 text-muted">
                        Start with 3 to 6 real works, keep one strong featured image, and
                        choose categories that match the jobs you want clients to book you
                        for later.
                    </p>
                </div>
            </div>
        </div>
    );
};