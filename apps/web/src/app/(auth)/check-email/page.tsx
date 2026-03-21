import Link from "next/link";
import { AuthCard } from "../../../features/auth/components/auth-card";
import { AuthFormHeader } from "../../../features/auth/components/auth-form-header";

export default function CheckEmailPage() {
  return (
    <AuthCard>
      <AuthFormHeader
        title="Check your inbox"
        description="We sent a secure link to complete your registration. It may take a minute to arrive."
      />
      <div className="space-y-4 text-center">
        <p className="text-sm text-brand-muted">
          Didn't receive the email? Verify your address or try again from the
          sign-up page.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-primary text-sm font-medium text-brand-surface transition-colors hover:bg-brand-primary/90"
        >
          Back to Sign In
        </Link>
      </div>
    </AuthCard>
  );
}
