"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    FormProvider,
    type SubmitErrorHandler,
    useForm,
} from "react-hook-form";
import { useState } from "react";

import { Button } from "../../../components/ui/button";
import { normalizeApiError } from "../../../services/api/error";
import { authService } from "../../../services/auth.service";
import { useAuthStore } from "../../../store/auth.store";

import { signInSchema, type SignInFormValues } from "../schemas/sign-in.schema";
import { AuthFormAlert } from "./auth-form-alert";
import { AuthTextField } from "./auth-text-field";
import { PasswordField } from "./password-field";
import { toast } from "sonner";

type FormAlertState = {
    title: string;
    description?: string;
} | null;

export const SignInForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formError, setFormError] = useState<FormAlertState>(null);

    const registered = searchParams.get("registered") === "1";
    const registeredEmail = searchParams.get("email");

    const { setAuth, setUser, clearAuth } = useAuthStore();

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

    useEffect(() => {
        if (!registeredEmail) return;

        if (!form.getValues("email")) {
            form.setValue("email", registeredEmail, {
                shouldValidate: true,
            });
        }
    }, [form, registeredEmail]);

    const onSubmit = async (values: SignInFormValues) => {
        setFormError(null);

        try {
            const response = await authService.signIn(values);

            setAuth({
                accessToken: response.accessToken,
                user: null,
            });

            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            router.push("/");
            router.refresh();
            toast.success("Sign In", {
                description: "You have been signed in successfully.",
            });
        } catch (error) {
            clearAuth();

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

                toast.error("We couldn’t sign you in with those details.", {
                    description:
                        "Check your email and password, then try again.",
                });

                return;
            }

            if (status === 429) {
                // setFormError({
                //     title: "Too many attempts.",
                //     description: "Please wait a moment and try again.",
                // });

                toast.error("Too many attempts.", {
                    description: "Please wait a moment and try again.",
                });
                return;
            }

            if (status && status >= 500) {
                // setFormError({
                //     title: "Something went wrong on our side.",
                //     description: "Please try again in a moment.",
                // });
                toast.error("Something went wrong on our side.", {
                    description: "Please try again in a moment.",
                });
                return;
            }

            // setFormError({
            //     title: "We couldn’t complete your sign in.",
            //     description: "Please check your connection and try again.",
            // });

            toast.error("We couldn’t complete your sign in.", {
                description: "Please check your connection and try again.",
            });
        }
    };

    const handleInvalidSubmit: SubmitErrorHandler<SignInFormValues> = () => {
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

                {registered ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-sm font-medium text-emerald-700">
                            Your account has been created.
                        </p>
                        <p className="mt-1 text-sm text-emerald-600">
                            Sign in to continue to Fotovia.
                        </p>
                    </div>
                ) : null}

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
                    {isSubmitting ? "Signing in..." : "Sign In"}
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
