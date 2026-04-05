"use client";

import { ReactNode, useEffect } from "react";

import { authToken } from "../lib/auth-token";
import { sessionUserService } from "../services/session-user.service";
import { useAuthStore } from "../store/auth.store";

interface AuthSessionProviderProps {
    children: ReactNode;
}

export const AuthSessionProvider = ({ children }: AuthSessionProviderProps) => {
    const { setAuth, clearAuth, startHydration, finishHydration } =
        useAuthStore();

    useEffect(() => {
        let isMounted = true;

        const initializeSession = async () => {
            startHydration();

            const tokenAtStart = authToken.get();

            if (!tokenAtStart) {
                if (isMounted) {
                    clearAuth();
                    finishHydration();
                }

                return;
            }

            try {
                const user =
                    await sessionUserService.getSessionUser(tokenAtStart);

                if (!isMounted) return;

                const latestToken = authToken.get();

                if (latestToken && latestToken !== tokenAtStart) {
                    finishHydration();
                    return;
                }

                setAuth({
                    accessToken: tokenAtStart,
                    user,
                });
            } catch {
                if (!isMounted) return;

                const latestToken = authToken.get();

                if (!latestToken || latestToken === tokenAtStart) {
                    clearAuth();
                }
            } finally {
                if (isMounted) {
                    finishHydration();
                }
            }
        };

        void initializeSession();

        return () => {
            isMounted = false;
        };
    }, [setAuth, clearAuth, startHydration, finishHydration]);

    return <>{children}</>;
};
