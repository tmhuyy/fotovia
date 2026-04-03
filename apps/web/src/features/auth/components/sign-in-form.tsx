"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FormProvider,
    type SubmitErrorHandler,
    useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Button } from "../../../components/ui/button";
import { authService } from "../../../services/auth.service";
import { normalizeApiError } from "../../../services/api/error";
import { useAuthStore } from "../../../store/auth.store";

import { signInSchema, type SignInFormValues } from "../schemas/sign-in.schema";
import { AuthTextField } from "./auth-text-field";
import { PasswordField } from "./password-field";
import { AuthFormAlert } from "./auth-form-alert";

type FormAlertState = {
    title: string;
    description?: string;
} | null;

export const SignInForm = () => {
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const [formError, setFormError] = useState<FormAlertState>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange",
        reValidateMode: "onChange",
        shouldFocusError: true,
        criteriaMode: "firstError",
    });

    const handleValidSubmit = async (values: SignInFormValues) => {
        setFormError(null);
        setIsSigningIn(true);

        try {
            const response = await authService.signIn(values);

            setAuth({
                accessToken: response.accessToken,
                user: response.user,
            });

            router.push("/");
            router.refresh();
        } catch (error) {
            const { status } = normalizeApiError(
                error,
                "Unable to sign in right now. Please try again.",
            );

            if (status === 401) {
                setFormError({
                    title: "We couldn’t sign you in with those details.",
                    description:
                        "Check your email and password, then try again.",
                });
                return;
            }

            if (status === 429) {
                setFormError({
                    title: "Too many attempts.",
                    description: "Please wait a moment and try again.",
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
                title: "We couldn’t complete your sign in.",
                description: "Please check your connection and try again.",
            });
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleInvalidSubmit = () => {
        setFormError(null);
    };

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(
                    handleValidSubmit,
                    handleInvalidSubmit,
                )}
                noValidate
                className="space-y-6"
            >
                <div className="space-y-5">
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
                        autoComplete="current-password"
                        placeholder="Enter your password"
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
                    disabled={isSigningIn}
                >
                    {isSigningIn ? "Signing in..." : "Sign In"}
                </Button>

                <p className="text-center text-sm text-muted">
                    New to Fotovia?{" "}
                    <Link
                        href="/sign-up"
                        className="font-medium text-foreground transition hover:text-accent"
                    >
                        Create an account
                    </Link>
                </p>
            </form>
        </FormProvider>
    );
};
