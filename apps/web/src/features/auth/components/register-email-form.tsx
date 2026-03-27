"use client";

import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { AuthTextField } from "./auth-text-field";
import { RoleSelector } from "./role-selector";
import {
  registerEmailSchema,
  type RegisterEmailFormValues,
} from "../schemas/register-email.schema";
import { authService } from "../../../services/auth.service";

export const RegisterEmailForm = () => {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const form = useForm<RegisterEmailFormValues>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: {
      role: "client",
      email: "",
    },
  });

  const onSubmit = async (values: RegisterEmailFormValues) => {
    setFormError(null);
    setFormSuccess(null);
    try {
      await authService.registerEmail(values.email, values.role);
      setFormSuccess("Check your inbox for the sign-up link.");
    } catch {
      setFormError("We couldn't send the email link. Please try again.");
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <RoleSelector />
        <AuthTextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@fotovia.com"
          autoComplete="email"
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
          {isSubmitting ? "Sending link..." : "Send Sign-up Link"}
        </Button>
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
