"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthSessionProvider } from "./auth-session-provider";
import { DevCheatPanel } from "../components/dev/dev-cheat-panel";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthSessionProvider>
          {children}
          <DevCheatPanel />
        </AuthSessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};
