import { AuthCard } from "../../../features/auth/components/auth-card";
import { AuthFormHeader } from "../../../features/auth/components/auth-form-header";
import { RegisterEmailForm } from "../../../features/auth/components/register-email-form";

export default function RegisterEmailPage() {
  return (
    <AuthCard>
      <AuthFormHeader
        title="Start with your email"
        description="Choose your role and we'll send a secure sign-up link to continue."
      />
      <RegisterEmailForm />
    </AuthCard>
  );
}
