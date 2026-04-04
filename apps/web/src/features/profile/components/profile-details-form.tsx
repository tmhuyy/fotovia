"use client";

import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
    onSave: (payload: ProfileUpdatePayload) => Promise<unknown>;
}

export const ProfileDetailsForm = ({
    role,
    profile,
    onSave,
}: ProfileDetailsFormProps) => {
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

            toast.success("Profile updated", {
                description:
                    "Your latest changes have been saved successfully.",
            });
        } catch {
            toast.error("We couldn’t save your profile", {
                description: "Please try again in a moment.",
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
                    description="Update your profile foundation without leaving this page."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <FieldWrapper>
                            <ProfileTextField
                                name="fullName"
                                label="Full name"
                                placeholder="Enter your full name"
                                autoComplete="name"
                            />
                        </FieldWrapper>

                        <FieldWrapper>
                            <ProfileTextField
                                name="phone"
                                label="Phone"
                                placeholder="Add your phone number"
                                autoComplete="tel"
                            />
                        </FieldWrapper>

                        <FieldWrapper className="md:col-span-2">
                            <ProfileTextField
                                name="location"
                                label="Location"
                                placeholder="City, region, or studio base"
                                autoComplete="address-level2"
                            />
                        </FieldWrapper>

                        <FieldWrapper className="md:col-span-2">
                            <ProfileTextareaField
                                name="bio"
                                label="Bio"
                                placeholder="Write a short introduction"
                                // helper="Keep this concise and clear."
                            />
                        </FieldWrapper>

                        {role === "photographer" ? (
                            <>
                                <FieldWrapper className="md:col-span-2">
                                    <ProfileTextareaField
                                        name="specialtiesText"
                                        label="Specialties"
                                        placeholder="Editorial, Wedding, Portrait"
                                        helper="Separate specialties with commas."
                                    />
                                </FieldWrapper>

                                <FieldWrapper>
                                    <ProfileTextField
                                        name="pricePerHour"
                                        label="Price per hour"
                                        placeholder="e.g. 250"
                                        helper="Enter a number only."
                                    />
                                </FieldWrapper>

                                <FieldWrapper>
                                    <ProfileTextField
                                        name="experienceYears"
                                        label="Experience years"
                                        placeholder="e.g. 4"
                                        helper="Enter a whole number."
                                    />
                                </FieldWrapper>
                            </>
                        ) : null}
                    </div>


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

interface FieldWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const FieldWrapper = ({ children, className }: FieldWrapperProps) => {
    return <div className={className}>{children}</div>;
};
