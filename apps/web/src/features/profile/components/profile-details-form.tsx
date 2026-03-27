"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/button";
import { ProfileSection } from "./profile-section";
import { profileSchema, type ProfileFormValues } from "../schemas/profile.schema";
import { ProfileTextField, ProfileTextareaField } from "./profile-form-fields";
import type { ProfileData } from "../types/profile.types";
import type { AuthRole } from "../../../types/auth.types";

interface ProfileDetailsFormProps {
  role: AuthRole;
  profile: ProfileData;
  onSave: (profile: ProfileData) => void;
}

export const ProfileDetailsForm = ({
  role,
  profile,
  onSave,
}: ProfileDetailsFormProps) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const defaultValues = useMemo<ProfileFormValues>(() => {
    const { role: _role, ...values } = profile;
    return values;
  }, [profile]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setStatusMessage(null);
    await new Promise((resolve) => setTimeout(resolve, 250));
    onSave({ ...profile, ...values, role });
    setStatusMessage("Profile updated. Changes are saved locally.");
  };

  const { isSubmitting } = form.formState;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProfileSection
          title="Profile details"
          description="Keep your contact details current for seamless bookings."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileTextField
              name="fullName"
              label={role === "photographer" ? "Studio or display name" : "Full name"}
              placeholder={role === "photographer" ? "Studio Reverie" : "Your name"}
              autoComplete="name"
            />
            <ProfileTextField
              name="email"
              label="Email"
              type="email"
              placeholder="you@fotovia.com"
              autoComplete="email"
            />
            <ProfileTextField
              name="phone"
              label="Phone"
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
            />
            <ProfileTextField
              name="location"
              label="Location"
              placeholder="City, State"
              autoComplete="address-level2"
            />
          </div>
          <div className="mt-4">
            <ProfileTextareaField
              name="bio"
              label="About"
              placeholder="Share a short introduction that sets your tone."
              helper="Keep it concise and premium."
            />
          </div>
        </ProfileSection>

        {role === "client" ? (
          <ProfileSection
            title="Client preferences"
            description="Personalize your discovery and booking experience."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileTextField
                name="preferredStyles"
                label="Preferred styles"
                placeholder="Editorial, Portrait, Lifestyle"
                helper="Comma-separated is fine."
              />
              <ProfileTextField
                name="savedPhotographers"
                label="Saved photographers"
                placeholder="Studio Reverie, Maison Noir"
              />
            </div>
            <div className="mt-4">
              <ProfileTextareaField
                name="bookingPreferences"
                label="Booking preferences"
                placeholder="Session timing, location, or creative notes."
              />
            </div>
          </ProfileSection>
        ) : (
          <ProfileSection
            title="Photographer profile"
            description="Showcase what makes your studio distinct."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileTextField
                name="studioName"
                label="Studio name"
                placeholder="Studio Reverie"
              />
              <ProfileTextField
                name="serviceLocation"
                label="Service location"
                placeholder="Los Angeles, CA + Travel"
              />
              <ProfileTextField
                name="specialties"
                label="Specialties"
                placeholder="Editorial, Bridal, Cinematic"
                helper="Comma-separated is fine."
              />
              <ProfileTextField
                name="pricingTier"
                label="Pricing teaser"
                placeholder="Starting at $450 per session"
              />
            </div>
            <div className="mt-4">
              <ProfileTextareaField
                name="availability"
                label="Availability notes"
                placeholder="Availability windows, booking cadence, or lead time."
              />
            </div>
          </ProfileSection>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {statusMessage ? (
            <p className="text-xs text-muted">{statusMessage}</p>
          ) : (
            <p className="text-xs text-muted">
              Changes are stored locally for now.
            </p>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
