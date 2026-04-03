import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";
import { buttonVariants } from "../../../components/ui/button";

export const PhotographerNotFound = () => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Photographer
          </p>
          <h2 className="font-display text-2xl text-foreground">
            Photographer not found
          </h2>
          <p className="text-sm text-muted">
            The profile you are looking for is unavailable right now.
          </p>
        </div>
        <Link href="/photographers" className={buttonVariants({ size: "sm" })}>
          Back to photographers
        </Link>
      </CardContent>
    </Card>
  );
};
