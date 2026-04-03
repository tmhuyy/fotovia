import { ReactNode } from "react";
import { AuthShell } from "../../features/auth/components/auth-shell";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthShell>{children}</AuthShell>;
}
