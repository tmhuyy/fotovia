import Link from "next/link";

import { Badge } from "../../../components/ui/badge";
import { Button, buttonVariants } from "../../../components/ui/button";

interface PortfolioEmptyStateProps {
    onLoadSamples: () => void;
}

export const PortfolioEmptyState = ({
    onLoadSamples,
}: PortfolioEmptyStateProps) => {
    return (
        <div className="rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm md:p-8">
            <Badge variant="accent">Portfolio foundation</Badge>

            <h2 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">
                Your portfolio is still empty.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Add your first portfolio work so future discovery, photographer
                detail, and AI-assisted matching flows can start building on
                real creative samples.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" onClick={onLoadSamples}>
                    Load sample works
                </Button>

                <Link
                    href="/profile"
                    className={buttonVariants({
                        size: "lg",
                        variant: "secondary",
                    })}
                >
                    Review profile first
                </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-border bg-background px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Suggested first portfolio mix
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                    Start with 3 to 6 works that show your best visual
                    direction, your key specialties, and at least one featured
                    image that feels like your signature.
                </p>
            </div>
        </div>
    );
};
