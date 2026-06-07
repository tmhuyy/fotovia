"use client";

interface BookingPaginationProps
{
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const getVisiblePages = (page: number, totalPages: number): number[] =>
{
    const pages = new Set<number>();

    pages.add(1);
    pages.add(totalPages);
    pages.add(page);

    if (page > 1) {
        pages.add(page - 1);
    }

    if (page < totalPages) {
        pages.add(page + 1);
    }

    return Array.from(pages)
        .filter((item) => item >= 1 && item <= totalPages)
        .sort((a, b) => a - b);
};

export const BookingPagination = ({
    page,
    totalPages,
    onPageChange,
}: BookingPaginationProps) =>
{
    if (totalPages <= 1) {
        return null;
    }

    const pages = getVisiblePages(page, totalPages);

    return (
        <nav className="flex items-center justify-center gap-2 pt-4">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
                ←
            </button>

            {pages.map((item, index) =>
            {
                const previous = pages[index - 1];
                const shouldShowGap =
                    typeof previous === "number" && item - previous > 1;

                return (
                    <div key={item} className="flex items-center gap-2">
                        {shouldShowGap ? (
                            <span className="px-1 text-sm text-muted">
                                ...
                            </span>
                        ) : null}

                        <button
                            type="button"
                            onClick={() => onPageChange(item)}
                            className={[
                                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition",
                                item === page
                                    ? "bg-accent text-white"
                                    : "border border-border bg-surface text-foreground hover:border-accent hover:text-accent",
                            ].join(" ")}
                        >
                            {item}
                        </button>
                    </div>
                );
            })}

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
                →
            </button>
        </nav>
    );
};