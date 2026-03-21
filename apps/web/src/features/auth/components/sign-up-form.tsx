"use client";

import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { AuthTextField } from "./auth-text-field";
import { PasswordField } from "./password-field";
import { signUpSchema, type SignUpFormValues } from "../schemas/sign-up.schema";

export const SignUpForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    console.log("Sign up payload", values);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
        <p className="text-center text-xs text-brand-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-brand-primary">
            Sign in
          </Link>
        </p>
      </form>
    </FormProvider>
  );
};
