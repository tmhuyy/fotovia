"use client";

import { ReactNode, useEffect } from "react";
import { authToken } from "../lib/auth-token";
import { authService } from "../services/auth.service";
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

            const token = authToken.get();

            if (!token) {
                if (isMounted) {
                    clearAuth();
                    finishHydration();
                }
                return;
            }

            try {
                const user = await authService.getCurrentUser();

                if (isMounted) {
                    setAuth({
                        accessToken: token,
                        user,
                    });
                }
            } catch {
                if (isMounted) {
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
