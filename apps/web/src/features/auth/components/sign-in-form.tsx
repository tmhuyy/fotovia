"use client";

import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { AuthTextField } from "./auth-text-field";
import { PasswordField } from "./password-field";
import { signInSchema, type SignInFormValues } from "../schemas/sign-in.schema";
import { authService } from "../../../services/auth.service";
import { useAuthStore } from "../../../store/auth.store";
import { normalizeApiError } from "../../../services/api/error";

export const SignInForm = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      const response = await authService.signIn(values);
      setAuth({ accessToken: response.accessToken, user: response.user });
      setFormSuccess("You're signed in. Welcome back.");
    } catch (error) {
      const { status } = normalizeApiError(
        error,
        "Unable to sign in. Please check your details and try again."
      );
      if (status === 401) {
        setFormError("Invalid email or password.");
        return;
      }
      setFormError("Unable to sign in. Please check your details and try again.");
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
          placeholder="Enter your password"
          autoComplete="current-password"
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
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
        <p className="text-center text-xs text-muted">
          New to Fotovia?{" "}
          <Link href="/sign-up" className="font-medium text-foreground">
            Create an account
          </Link>
        </p>
      </form>
    </FormProvider>
  );
};
