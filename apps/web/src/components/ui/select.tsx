import * as React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
