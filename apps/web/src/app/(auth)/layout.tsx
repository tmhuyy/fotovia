import { ReactNode } from "react";

import { AuthShell } from "../../features/auth/components/auth-shell";
import { GuestOnlyRoute } from "../../features/auth/components/guest-only-route";

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <AuthShell>
            <GuestOnlyRoute>{children}</GuestOnlyRoute>
        </AuthShell>
    );
}
