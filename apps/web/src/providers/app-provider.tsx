"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

import { DevCheatPanel } from "../components/dev/dev-cheat-panel";
import { AuthSessionProvider } from "./auth-session-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    return (
        <QueryProvider>
            <ThemeProvider>
                <AuthSessionProvider>
                    {children}
                    <DevCheatPanel />
                    <Toaster
                        position="top-right"
                        closeButton
                        richColors
                        toastOptions={{
                            className: "rounded-2xl",
                        }}
                    />
                </AuthSessionProvider>
            </ThemeProvider>
        </QueryProvider>
    );
};
