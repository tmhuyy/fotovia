"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    FormProvider,
    type SubmitErrorHandler,
    useForm,
} from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "../../../components/ui/button";
import { normalizeApiError } from "../../../services/api/error";
import { authService } from "../../../services/auth.service";
import type { AuthRole } from "../../../types/auth.types";

import { signUpSchema, type SignUpFormValues } from "../schemas/sign-up.schema";
import { AuthFormAlert } from "./auth-form-alert";
import { AuthTextField } from "./auth-text-field";
import { PasswordField } from "./password-field";
import { RoleSelector } from "./role-selector";

type FormAlertState = {
    title: string;
    description?: string;
} | null;

export const SignUpForm = () => {
    const [formError, setFormError] = useState<FormAlertState>(null);

    const router = useRouter();
    const pathname = usePathname();
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
        mode: "onChange",
        reValidateMode: "onChange",
        shouldFocusError: true,
        criteriaMode: "firstError",
    });

    const roleParam = searchParams.get("role");
    const searchString = useMemo(() => searchParams.toString(), [searchParams]);
    const normalizedRole: AuthRole =
        roleParam === "photographer" ? "photographer" : "client";
    const isRoleValid = roleParam === "client" || roleParam === "photographer";

    const updateRoleParam = useCallback(
        (nextRole: AuthRole) => {
            if (roleParam === nextRole) return;

            const params = new URLSearchParams(searchString);
            params.set("role", nextRole);

            router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
            });
        },
        [pathname, roleParam, router, searchString],
    );

    useEffect(() => {
        if (!isRoleValid) {
            updateRoleParam("client");
            return;
        }

        if (form.getValues("role") !== normalizedRole) {
            form.setValue("role", normalizedRole, { shouldValidate: true });
        }
    }, [form, isRoleValid, normalizedRole, updateRoleParam]);

    const onSubmit = async (values: SignUpFormValues) => {
        setFormError(null);

        try {
            await authService.signUp({
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                role: values.role,
            });

            const params = new URLSearchParams({
                registered: "1",
                email: values.email,
            });

            router.push(`/sign-in?${params.toString()}`);
        } catch (error) {
            const { status } = normalizeApiError(
                error,
                "We couldn’t create your account right now.",
            );

            if (status === 409) {
                setFormError({
                    title: "This email is already in use.",
                    description:
                        "Try signing in instead, or use another email address.",
                });
                return;
            }

            if (status === 400) {
                setFormError({
                    title: "We couldn’t create your account.",
                    description: "Please review your details and try again.",
                });
                return;
            }

            if (status && status >= 500) {
                setFormError({
                    title: "Something went wrong on our side.",
                    description: "Please try again in a moment.",
                });
                return;
            }

            setFormError({
                title: "We couldn’t create your account.",
                description: "Please check your connection and try again.",
            });
        }
    };

    const handleInvalidSubmit: SubmitErrorHandler<SignUpFormValues> = () => {
        setFormError(null);
    };

    const { isSubmitting } = form.formState;

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, handleInvalidSubmit)}
                noValidate
                className="space-y-6"
            >
                <div className="space-y-5">
                    <RoleSelector onRoleChange={updateRoleParam} />

                    <AuthTextField
                        name="fullName"
                        label="Full name"
                        autoComplete="name"
                        placeholder="Enter your full name"
                    />

                    <AuthTextField
                        name="email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                    />

                    <PasswordField
                        name="password"
                        label="Password"
                        autoComplete="new-password"
                        placeholder="Create a password"
                    />

                    <PasswordField
                        name="confirmPassword"
                        label="Confirm password"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                    />
                </div>

                {formError ? (
                    <AuthFormAlert
                        title={formError.title}
                        description={formError.description}
                    />
                ) : null}

                <Button
                    type="submit"
                    className="h-14 w-full rounded-full text-base font-medium"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted">
                    Already have an account?{" "}
                    <Link
                        href="/sign-in"
                        className="font-medium text-foreground transition hover:text-accent"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </FormProvider>
    );
};
