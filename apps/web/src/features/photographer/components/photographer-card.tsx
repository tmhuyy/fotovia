import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { buttonVariants } from "../../../components/ui/button";
import type { PhotographerProfile } from "../types/photographer.types";

interface PhotographerCardProps {
  photographer: PhotographerProfile;
}

export const PhotographerCard = ({ photographer }: PhotographerCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-background to-surface">
        <div className="h-full w-full rounded-b-none border-b border-border bg-background/40" />
      </div>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-medium text-foreground">
              {photographer.name}
            </p>
            <p className="text-sm text-muted">{photographer.specialty}</p>
          </div>
          <Badge variant="accent">{photographer.location}</Badge>
        </div>
        <p className="text-sm text-muted">{photographer.bio}</p>
        <div className="flex flex-wrap gap-2">
          {photographer.styles.slice(0, 3).map((style) => (
            <span
              key={style}
              className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted"
            >
              {style}
            </span>
          ))}
          {photographer.tags.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {photographer.rating.toFixed(1)} rating · {photographer.reviewCount} reviews
          </span>
          <span>From ${photographer.startingPrice}</span>
        </div>
        <Link
          href={`/photographers/${photographer.id}`}
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          View profile
        </Link>
      </CardContent>
    </Card>
  );
};
