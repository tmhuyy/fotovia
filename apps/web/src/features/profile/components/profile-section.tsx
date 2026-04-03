import { Card, CardContent, CardHeader } from "../../../components/ui/card";

interface ProfileSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const ProfileSection = ({
  title,
  description,
  children,
}: ProfileSectionProps) => {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
