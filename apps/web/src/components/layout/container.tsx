import { ReactNode } from "react";

import { cn } from "../../lib/utils";

interface ContainerProps
{
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

const containerSizeClassNames: Record<
  NonNullable<ContainerProps["size"]>,
  string
> = {
  default: "max-w-[1180px]",
  narrow: "max-w-[960px]",
  wide: "max-w-[1280px]",
};

export const Container = ({
  children,
  className,
  size = "default",
}: ContainerProps) =>
{
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        containerSizeClassNames[size],
        className,
      )}
    >
      {children}
    </div>
  );
};