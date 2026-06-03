import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface ContainerProps
{
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) =>
{
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
};