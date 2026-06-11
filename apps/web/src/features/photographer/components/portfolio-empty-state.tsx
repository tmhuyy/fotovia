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
            </div>
        </div>
    );
};