import { AuthCard } from "../../../features/auth/components/auth-card";
import { AuthFormHeader } from "../../../features/auth/components/auth-form-header";
import { SignInForm } from "../../../features/auth/components/sign-in-form";

export default function SignInPage() {
  return (
    <AuthCard>
      <AuthFormHeader
        title="Welcome back"
        description="Sign in to manage bookings and connect with photographers."
      />
      <SignInForm />
    </AuthCard>
  );
}
