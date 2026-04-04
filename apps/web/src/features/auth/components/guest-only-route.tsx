"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../../../store/auth.store";

interface GuestOnlyRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

const AuthPageSkeleton = () => {
    return (
        <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
            <div className="space-y-6">
                <div className="space-y-3 text-center">
                    <div className="mx-auto h-10 w-56 animate-pulse rounded-xl bg-border/60" />
                    <div className="mx-auto h-5 w-72 animate-pulse rounded-xl bg-border/50" />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="h-4 w-20 animate-pulse rounded bg-border/50" />
                        <div className="h-12 w-full animate-pulse rounded-2xl bg-border/50" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-border/50" />
                        <div className="h-12 w-full animate-pulse rounded-2xl bg-border/50" />
                    </div>

                    <div className="h-14 w-full animate-pulse rounded-full bg-border/60" />
                </div>
            </div>
        </div>
    );
};

export const GuestOnlyRoute = ({
    children,
    redirectTo = "/",
}: GuestOnlyRouteProps) => {
    const router = useRouter();
    const { isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

    useEffect(() => {
        if (!hasHydrated || isHydrating) return;

        if (isAuthenticated) {
            router.replace(redirectTo);
        }
    }, [hasHydrated, isHydrating, isAuthenticated, redirectTo, router]);

    if (!hasHydrated || isHydrating) {
        return <AuthPageSkeleton />;
    }

    if (isAuthenticated) {
        return <AuthPageSkeleton />;
    }

    return <>{children}</>;
};
