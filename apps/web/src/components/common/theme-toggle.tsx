"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "../../lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition hover:bg-background",
        className
      )}
      aria-label="Toggle theme"
    >
      <span className="h-2 w-2 rounded-full bg-accent" />
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
};
