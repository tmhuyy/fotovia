import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-brand-background text-brand-muted",
        accent: "bg-brand-accent/20 text-brand-primary",
        ai: "bg-brand-ai/20 text-brand-primary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
};
