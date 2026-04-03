import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", ...props }, ref) => {
        const isInvalid =
            props["aria-invalid"] === true || props["aria-invalid"] === "true";

        return (
            <input
                ref={ref}
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-2xl border bg-surface px-4 text-base text-foreground shadow-sm transition-colors",
                    "placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
                    "focus-visible:outline-none focus-visible:ring-2",
                    isInvalid
                        ? "border-red-500 focus-visible:ring-red-400"
                        : "border-border focus-visible:ring-accent/30",
                    className,
                )}
                {...props}
            />
        );
    },
);

Input.displayName = "Input";
