import { Card, CardContent } from "../../../components/ui/card";
import type { ProfileData } from "../types/profile.types";
import { Badge } from "../../../components/ui/badge";

interface ProfileSummaryCardProps {
  profile: ProfileData;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const ProfileSummaryCard = ({ profile }: ProfileSummaryCardProps) => {
  const badgeVariant = profile.role === "photographer" ? "accent" : "neutral";
  const badgeLabel = profile.role === "photographer" ? "Photographer" : "Client";

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
            {getInitials(profile.fullName)}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-medium text-foreground">
              {profile.fullName}
            </p>
            <p className="text-sm text-muted">{profile.email}</p>
            <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          </div>
        </div>
        <div className="grid gap-3 text-sm text-muted">
          <div>
            <p className="text-xs uppercase tracking-[0.3em]">Location</p>
            <p className="text-sm text-foreground">
              {profile.location || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em]">Phone</p>
            <p className="text-sm text-foreground">
              {profile.phone || "Not set"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
