"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../../components/ui/button";
import type { AuthRole } from "../../../types/auth.types";
import type { ProfileData, ProfileUpdatePayload } from "../types/profile.types";
import {
    profileSchema,
    type ProfileFormValues,
} from "../schemas/profile.schema";
import { ProfileSection } from "./profile-section";
import { ProfileTextField, ProfileTextareaField } from "./profile-form-fields";

interface ProfileDetailsFormProps {
    role: AuthRole;
    profile: ProfileData;
    onSave: (payload: ProfileUpdatePayload) => Promise<void>;
}

type FormNotice = {
    variant: "success" | "error";
    message: string;
} | null;

export const ProfileDetailsForm = ({
    role,
    profile,
    onSave,
}: ProfileDetailsFormProps) => {
    const [notice, setNotice] = useState<FormNotice>(null);

    const defaultValues = useMemo<ProfileFormValues>(
        () => ({
            fullName: profile.fullName ?? "",
            phone: profile.phone ?? "",
            location: profile.location ?? "",
            bio: profile.bio ?? "",
            specialtiesText: profile.specialties.join(", "),
            pricePerHour:
                profile.pricePerHour !== null
                    ? String(profile.pricePerHour)
                    : "",
            experienceYears:
                profile.experienceYears !== null
                    ? String(profile.experienceYears)
                    : "",
        }),
        [profile],
    );

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues,
        mode: "onChange",
        reValidateMode: "onChange",
        shouldFocusError: true,
        criteriaMode: "firstError",
    });

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const handleSubmit = async (values: ProfileFormValues) => {
        setNotice(null);

        const payload: ProfileUpdatePayload = {
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            location: values.location.trim(),
            bio: values.bio.trim(),
            specialties: values.specialtiesText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            ...(values.pricePerHour.trim()
                ? { pricePerHour: Number(values.pricePerHour) }
                : {}),
            ...(values.experienceYears.trim()
                ? { experienceYears: Number(values.experienceYears) }
                : {}),
        };

        try {
            await onSave(payload);
            setNotice({
                variant: "success",
                message: "Profile updated successfully.",
            });
        } catch {
            setNotice({
                variant: "error",
                message: "We couldn’t save your profile right now.",
            });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                noValidate
                className="space-y-6"
            >
                <ProfileSection
                    title="Edit profile"
                    description="This form now saves to the real profile service instead of local mock state."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <AuthFieldWrapper>
                            <ProfileTextField
                                name="fullName"
                                label="Full name"
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />
                        </AuthFieldWrapper>

                        <AuthFieldWrapper>
                            <ProfileTextField
                                name="phone"
                                label="Phone"
                                placeholder="Add your phone number"
                                autoComplete="tel"
                            />
                        </AuthFieldWrapper>

                        <AuthFieldWrapper className="md:col-span-2">
                            <ProfileTextField
                                name="location"
                                label="Location"
                                placeholder="City, region, or studio base"
                                autoComplete="address-level2"
                            />
                        </AuthFieldWrapper>

                        <AuthFieldWrapper className="md:col-span-2">
                            <ProfileTextareaField
                                name="bio"
                                label="Bio"
                                placeholder="Write a short introduction"
                                helper="Keep this concise and clear."
                            />
                        </AuthFieldWrapper>

                        {role === "photographer" ? (
                            <>
                                <AuthFieldWrapper className="md:col-span-2">
                                    <ProfileTextareaField
                                        name="specialtiesText"
                                        label="Specialties"
                                        placeholder="Editorial, Wedding, Portrait"
                                        helper="Separate specialties with commas."
                                    />
                                </AuthFieldWrapper>

                                <AuthFieldWrapper>
                                    <ProfileTextField
                                        name="pricePerHour"
                                        label="Price per hour"
                                        placeholder="e.g. 250"
                                        helper="Enter a number only."
                                    />
                                </AuthFieldWrapper>

                                <AuthFieldWrapper>
                                    <ProfileTextField
                                        name="experienceYears"
                                        label="Experience years"
                                        placeholder="e.g. 4"
                                        helper="Enter a whole number."
                                    />
                                </AuthFieldWrapper>
                            </>
                        ) : null}
                    </div>

                    {notice ? (
                        <div
                            className={
                                notice.variant === "success"
                                    ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                                    : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            }
                        >
                            {notice.message}
                        </div>
                    ) : (
                        <p className="text-sm text-muted">
                            Changes here will update your real profile
                            foundation.
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="rounded-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                </ProfileSection>
            </form>
        </FormProvider>
    );
};

interface AuthFieldWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const AuthFieldWrapper = ({ children, className }: AuthFieldWrapperProps) => {
    return <div className={className}>{children}</div>;
};
