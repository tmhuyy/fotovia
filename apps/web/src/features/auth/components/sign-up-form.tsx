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

export const SignUpForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
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
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    console.log("Sign up payload", values);
  };

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
