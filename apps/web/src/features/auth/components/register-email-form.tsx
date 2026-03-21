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

export const RegisterEmailForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<RegisterEmailFormValues>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: {
      role: "client",
      email: "",
    },
  });

  const onSubmit = async (values: RegisterEmailFormValues) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    console.log("Register email payload", values);
  };

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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending link..." : "Send Sign-up Link"}
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
