import { create } from "zustand";

import { authToken } from "../lib/auth-token";
import type { AuthUser } from "../types/auth.types";

interface AuthState {
    accessToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isHydrating: boolean;
    hasHydrated: boolean;
    setAuth: (payload: { accessToken: string; user: AuthUser | null }) => void;
    setUser: (user: AuthUser | null) => void;
    startHydration: () => void;
    finishHydration: () => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isHydrating: true,
    hasHydrated: false,

    setAuth: ({ accessToken, user }) => {
        authToken.set(accessToken);

        set({
            accessToken,
            user,
            isAuthenticated: Boolean(accessToken),
            isHydrating: false,
            hasHydrated: true,
        });
    },

    setUser: (user) =>
        set((state) => ({
            user,
            isAuthenticated: Boolean(state.accessToken),
            isHydrating: false,
            hasHydrated: true,
        })),

    startHydration: () =>
        set({
            isHydrating: true,
            hasHydrated: false,
        }),

    finishHydration: () =>
        set({
            isHydrating: false,
            hasHydrated: true,
        }),

    clearAuth: () => {
        authToken.clear();

        set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isHydrating: false,
            hasHydrated: true,
        });
    },
}));
