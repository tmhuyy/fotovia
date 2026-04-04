"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useAuthStore } from "../../../store/auth.store";

interface AuthenticatedRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

const ProtectedPageSkeleton = () => {
    return (
        <div className="min-h-[50vh]">
            <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
                <div className="space-y-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-border/60" />
                    <div className="h-12 w-72 animate-pulse rounded bg-border/60" />
                    <div className="h-5 w-[32rem] max-w-full animate-pulse rounded bg-border/50" />
                </div>

                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="h-80 animate-pulse rounded-[2rem] border border-border bg-surface/60" />
                    <div className="space-y-6">
                        <div className="h-[28rem] animate-pulse rounded-[2rem] border border-border bg-surface/60" />
                        <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-surface/60" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AuthenticatedRoute = ({
    children,
    redirectTo = "/sign-in",
}: AuthenticatedRouteProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

    useEffect(() => {
        if (!hasHydrated || isHydrating) return;
        if (isAuthenticated) return;

        const query = searchParams.toString();
        const nextPath = `${pathname}${query ? `?${query}` : ""}`;
        const target = `${redirectTo}?next=${encodeURIComponent(nextPath)}`;

        router.replace(target);
    }, [
        hasHydrated,
        isHydrating,
        isAuthenticated,
        pathname,
        redirectTo,
        router,
        searchParams,
    ]);

    if (!hasHydrated || isHydrating) {
        return <ProtectedPageSkeleton />;
    }

    if (!isAuthenticated) {
        return <ProtectedPageSkeleton />;
    }

    return <>{children}</>;
};
