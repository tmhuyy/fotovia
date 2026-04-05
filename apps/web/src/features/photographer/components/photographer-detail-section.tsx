import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";

interface PhotographerDetailSectionProps
{
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export const PhotographerDetailSection = ({
  eyebrow,
  title,
  description,
  children,
}: PhotographerDetailSectionProps) =>
{
  return (
    <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
      <CardHeader className="space-y-3 px-8 pt-8">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {eyebrow}
          </p>
        ) : null}

        <div className="space-y-2">
          <h2 className="font-serif text-3xl text-foreground">{title}</h2>

          {description ? (
            <p className="text-sm leading-7 text-muted">{description}</p>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">{children}</CardContent>
    </Card>
  );
};