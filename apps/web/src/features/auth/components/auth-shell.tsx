import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "../../../components/common/theme-toggle";

interface AuthShellProps {
  children: ReactNode;
}

export const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-xl text-foreground">
              Fotovia
            </Link>
            <p className="hidden text-xs uppercase tracking-[0.3em] text-muted md:block">
              Premium Photography Booking
            </p>
          </div>
          <ThemeToggle className="px-2 py-1 text-[10px] sm:text-xs" />
        </header>
        <main className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <footer className="text-center text-xs text-muted sm:text-left">
          (c) 2026 Fotovia. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
