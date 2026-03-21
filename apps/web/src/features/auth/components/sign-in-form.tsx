"use client";

import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { AuthTextField } from "./auth-text-field";
import { PasswordField } from "./password-field";
import { signInSchema, type SignInFormValues } from "../schemas/sign-in.schema";

export const SignInForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    console.log("Sign in payload", values);
  };

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
