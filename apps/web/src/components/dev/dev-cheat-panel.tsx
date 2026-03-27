"use client";

import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useMockSessionStore } from "../../store/mock-session.store";

const isDevCheatsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_DEV_CHEATS === "true"

export const DevCheatPanel = () => {
  if (!isDevCheatsEnabled) return null;

  const [isOpen, setIsOpen] = useState(true);
  const {
    isAuthenticated,
    role,
    user,
    signInAsClient,
    signInAsPhotographer,
    signOut,
  } = useMockSessionStore();

  const statusLabel = useMemo(() => {
    if (!isAuthenticated) return "Signed out";
    return role === "photographer"
      ? "Signed in - Photographer"
      : "Signed in - Client";
  }, [isAuthenticated, role]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-[18rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface/95 p-3 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Dev Cheat Panel
              </p>
              <p className="mt-1 text-xs text-foreground">
                {statusLabel}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 px-3 text-xs"
            >
              Hide
            </Button>
          </div>
          <div className="mt-3 space-y-1 text-xs text-muted">
            <p>
              Role: <span className="text-foreground">{role ?? "N/A"}</span>
            </p>
            <p>
              Name:{" "}
              <span className="text-foreground">{user?.fullName ?? "N/A"}</span>
            </p>
            <p>
              Email:{" "}
              <span className="text-foreground">{user?.email ?? "N/A"}</span>
            </p>
          </div>
          <div className="mt-3 grid gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={signInAsClient}
              disabled={isAuthenticated && role === "client"}
              className="w-full"
            >
              Sign in as client
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={signInAsPhotographer}
              disabled={isAuthenticated && role === "photographer"}
              className="w-full"
            >
              Sign in as photographer
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={signOut}
              disabled={!isAuthenticated}
              className={cn("w-full", !isAuthenticated && "opacity-60")}
            >
              Sign out
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="rounded-full px-4 text-xs"
        >
          Dev Cheats
        </Button>
      )}
    </div>
  );
};
