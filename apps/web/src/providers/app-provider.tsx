"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./query-provider";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return <QueryProvider>{children}</QueryProvider>;
};
