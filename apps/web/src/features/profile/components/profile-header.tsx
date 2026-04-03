import { Badge } from "../../../components/ui/badge";

interface ProfileHeaderProps {
  title: string;
  subtitle: string;
  roleLabel: string;
  roleVariant?: "neutral" | "accent" | "ai";
}

export const ProfileHeader = ({
  title,
  subtitle,
  roleLabel,
  roleVariant = "neutral",
}: ProfileHeaderProps) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          Account Overview
        </p>
        <h1 className="font-display text-3xl text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-muted md:text-base">{subtitle}</p>
      </div>
      <Badge variant={roleVariant}>{roleLabel}</Badge>
    </div>
  );
};
