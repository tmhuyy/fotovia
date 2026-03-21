import { ReactNode } from "react";
import { Card, CardContent } from "../../../components/ui/card";

interface AuthCardProps {
  children: ReactNode;
}

export const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-6 p-8">{children}</CardContent>
    </Card>
  );
};
