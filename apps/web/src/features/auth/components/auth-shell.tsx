import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
}

export const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-brand-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-brand-primary">
            Fotovia
          </Link>
          <p className="hidden text-xs uppercase tracking-[0.3em] text-brand-muted md:block">
            Premium Photography Booking
          </p>
        </header>
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <footer className="text-xs text-brand-muted">
          (c) 2026 Fotovia. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
