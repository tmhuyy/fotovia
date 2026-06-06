"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import
{
    FormProvider,
    type SubmitErrorHandler,
    useForm,
} from "react-hook-form";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import { normalizeApiError } from "../../../services/api/error";
import { authService } from "../../../services/auth.service";
import { sessionUserService } from "../../../services/session-user.service";
import { useAuthStore } from "../../../store/auth.store";

import { signInSchema, type SignInFormValues } from "../schemas/sign-in.schema";
import
{
    getSafeInternalRoute,
    resolvePostAuthRoute,
} from "../lib/get-default-post-auth-route";
import { AuthFormAlert } from "./auth-form-alert";
import { AuthTextField } from "./auth-text-field";
import { PasswordField } from "./password-field";

type FormAlertState = {
    title: string;
    description?: string;
} | null;

const BOOKING_BRIEF_DRAFT_STORAGE_KEY = "fotovia.bookingBriefDraft";
const PENDING_BOOKING_DRAFT_MAX_AGE_MS = 1000 * 60 * 60;

const readPendingBookingReturnTo = () =>
{
    if (typeof window === "undefined") {
        return null;
    }

    const storedValue = window.sessionStorage.getItem(
        BOOKING_BRIEF_DRAFT_STORAGE_KEY,
    );

    if (!storedValue) {
        return null;
    }

    try {
        const parsedValue = JSON.parse(storedValue) as {
            intent?: unknown;
            returnTo?: unknown;
            savedAt?: unknown;
        };

        if (parsedValue.intent !== "send-booking-request") {
            return null;
        }

        if (typeof parsedValue.returnTo !== "string") {
            return null;
        }

        const safeReturnTo = getSafeInternalRoute(parsedValue.returnTo);

        if (!safeReturnTo) {
            return null;
        }

        if (typeof parsedValue.savedAt === "string") {
            const savedAtTime = new Date(parsedValue.savedAt).getTime();
            const isExpired =
                Number.isFinite(savedAtTime) &&
                Date.now() - savedAtTime > PENDING_BOOKING_DRAFT_MAX_AGE_MS;

            if (isExpired) {
                return null;
            }
        }

        return safeReturnTo;
    } catch {
        return null;
    }
};

export const SignInForm = () =>
{
    const searchParams = useSearchParams();

    const nextPath = searchParams.get("next");
    const safeNextPath = useMemo(
        () => getSafeInternalRoute(nextPath),
        [nextPath],
    );

    const signUpHref = useMemo(() =>
    {
        if (!safeNextPath) return "/sign-up";
        return `/sign-up?next=${encodeURIComponent(safeNextPath)}`;
    }, [safeNextPath]);

    const [formError, setFormError] = useState<FormAlertState>(null);

    const registered = searchParams.get("registered") === "1";
    const registeredEmail = searchParams.get("email");

    const { setAuth, clearAuth } = useAuthStore();

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

    useEffect(() =>
    {
        if (!registeredEmail) return;

        if (!form.getValues("email")) {
            form.setValue("email", registeredEmail, {
                shouldValidate: true,
            });
        }
    }, [form, registeredEmail]);

    const onSubmit = async (values: SignInFormValues) =>
    {
        setFormError(null);

        try {
            const response = await authService.signIn(values);

            const sessionUser = await sessionUserService.getSessionUser(
                response.accessToken,
            );

            setAuth({
                accessToken: response.accessToken,
                user: sessionUser,
            });

            const pendingBookingReturnTo = readPendingBookingReturnTo();

            const redirectAfterSignIn = resolvePostAuthRoute({
                nextPath: safeNextPath ?? pendingBookingReturnTo,
                role: sessionUser?.role,
            });

            toast.success("Sign In", {
                description: "You have been signed in successfully.",
            });

            window.location.assign(redirectAfterSignIn);
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
                toast.error("Too many attempts.", {
                    description: "Please wait a moment and try again.",
                });
                return;
            }

            if (status && status >= 500) {
                toast.error("Something went wrong on our side.", {
                    description: "Please try again in a moment.",
                });
                return;
            }

            toast.error("We couldn’t complete your sign in.", {
                description: "Please check your connection and try again.",
            });
        }
    };

    const handleInvalidSubmit: SubmitErrorHandler<SignInFormValues> = () =>
    {
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
                    className="h-14 w-full rounded-full text-base font-medium cursor-pointer"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>

                <p className="text-center text-sm text-muted">
                    New to Fotovia?{" "}
                    <Link
                        href={signUpHref}
                        className="font-medium text-foreground transition hover:text-accent"
                    >
                        Create an account
                    </Link>
                </p>
            </form>
        </FormProvider>
    );
};