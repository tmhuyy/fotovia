import { AuthCard } from "../../../features/auth/components/auth-card";
import { AuthFormHeader } from "../../../features/auth/components/auth-form-header";
import { SignUpForm } from "../../../features/auth/components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthCard>
      <AuthFormHeader
        title="Create your account"
        description="Join Fotovia to book photographers and save your favorites."
      />
      <SignUpForm />
    </AuthCard>
  );
}
