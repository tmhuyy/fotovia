import type { AuthRole } from "../../../types/auth.types";

const DEFAULT_POST_AUTH_ROUTE_BY_ROLE: Record<AuthRole, string> = {
    client: "/",
    photographer: "/photographer/dashboard",
};

const DISALLOWED_POST_AUTH_PATHS = new Set([
    "/sign-in",
    "/sign-up",
    "/register-email",
    "/check-email",
]);

export const getSafeInternalRoute = (candidate?: string | null) => {
    if (
        !candidate ||
        !candidate.startsWith("/") ||
        candidate.startsWith("//")
    ) {
        return null;
    }

    const pathname = candidate.split("?")[0] ?? candidate;

    if (DISALLOWED_POST_AUTH_PATHS.has(pathname)) {
        return null;
    }

    return candidate;
};

export const getDefaultPostAuthRoute = (role?: AuthRole) => {
    if (!role) return "/";
    return DEFAULT_POST_AUTH_ROUTE_BY_ROLE[role] ?? "/";
};

export const resolvePostAuthRoute = ({
    nextPath,
    role,
}: {
    nextPath?: string | null;
    role?: AuthRole;
}) => {
    return getSafeInternalRoute(nextPath) ?? getDefaultPostAuthRoute(role);
};
