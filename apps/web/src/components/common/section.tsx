import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {}

export const Section = ({ className, ...props }: SectionProps) => {
  return (
    <section
      className={cn("py-16 sm:py-20 md:py-24", className)}
      {...props}
    />
  );
};
