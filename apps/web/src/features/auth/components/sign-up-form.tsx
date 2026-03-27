"use client";

import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { AuthTextField } from "./auth-text-field";
import { PasswordField } from "./password-field";
import { RoleSelector } from "./role-selector";
import { signUpSchema, type SignUpFormValues } from "../schemas/sign-up.schema";
import { authService } from "../../../services/auth.service";
import { useAuthStore } from "../../../store/auth.store";

export const SignUpForm = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "client",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "client" || role === "photographer") {
      form.setValue("role", role);
    }
  }, [searchParams, form]);

  const onSubmit = async (values: SignUpFormValues) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      const response = await authService.signUp(values);
      setAuth({ accessToken: response.accessToken, user: response.user });
      setFormSuccess("Account created. You're ready to continue.");
    } catch {
      setFormError("We couldn't create your account. Please try again.");
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <RoleSelector />
        <AuthTextField
          name="fullName"
          label="Full name"
          placeholder="Your name"
          autoComplete="name"
        />
        <AuthTextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@fotovia.com"
          autoComplete="email"
        />
        <PasswordField
          name="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
        />
        <PasswordField
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />
        {formError ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-3 text-xs text-accent">
            {formError}
          </p>
        ) : null}
        {formSuccess ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted">
            {formSuccess}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
        <p className="text-center text-xs text-muted">
          Prefer a sign-up link?{" "}
          <Link href="/register-email" className="font-medium text-foreground">
            Email me a link
          </Link>
        </p>
        <p className="text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-foreground">
            Sign in
          </Link>
        </p>
      </form>
    </FormProvider>
  );
};
