import { Card, CardContent, CardHeader } from "../../../components/ui/card";

interface PhotographerDetailSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const PhotographerDetailSection = ({
  title,
  description,
  children,
}: PhotographerDetailSectionProps) => {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <h2 className="text-xl font-medium text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
