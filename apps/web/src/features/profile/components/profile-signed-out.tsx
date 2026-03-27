import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/card";
import { buttonVariants } from "../../../components/ui/button";

export const ProfileSignedOut = () => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Profile
          </p>
          <h2 className="font-display text-2xl text-foreground">
            Sign in to view your profile
          </h2>
          <p className="text-sm text-muted">
            Access your account details, preferences, and saved photographers.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/sign-in" className={buttonVariants({ size: "sm" })}>
            Sign in
          </Link>
          <Link
            href="/sign-up?role=client"
            className={buttonVariants({ size: "sm", variant: "secondary" })}
          >
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
