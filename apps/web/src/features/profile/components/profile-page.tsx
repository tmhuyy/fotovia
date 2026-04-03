"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import { useMockSessionStore } from "../../../store/mock-session.store";
import { buildMockProfile } from "../data/mock-profile";
import type { ProfileData } from "../types/profile.types";
import { ProfileHeader } from "./profile-header";
import { ProfileSummaryCard } from "./profile-summary-card";
import { ProfileDetailsForm } from "./profile-details-form";
import { ProfileRoleHighlights } from "./profile-role-highlights";
import { ProfileSignedOut } from "./profile-signed-out";

export const ProfilePage = () => {
  const { isAuthenticated, role, user } = useMockSessionStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const resolvedRole = useMemo(() => {
    if (!isAuthenticated) return null;
    return role ?? "client";
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (!isAuthenticated || !resolvedRole) {
      setProfile(null);
      return;
    }

    setProfile(buildMockProfile({ role: resolvedRole, user }));
  }, [isAuthenticated, resolvedRole, user]);

  const headerCopy = useMemo(() => {
    if (resolvedRole === "photographer") {
      return {
        title: "Your photographer profile",
        subtitle:
          "Present your studio, specialties, and availability with a premium touch.",
        label: "Photographer account",
        variant: "accent" as const,
      };
    }

    return {
      title: "Your client profile",
      subtitle:
        "Manage your booking preferences and keep your details up to date.",
      label: "Client account",
      variant: "neutral" as const,
    };
  }, [resolvedRole]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Section className="pt-10">
          <Container className="space-y-8">
            {profile && resolvedRole ? (
              <>
                <ProfileHeader
                  title={headerCopy.title}
                  subtitle={headerCopy.subtitle}
                  roleLabel={headerCopy.label}
                  roleVariant={headerCopy.variant}
                />
                <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                  <div className="space-y-6">
                    <ProfileSummaryCard profile={profile} />
                    <ProfileRoleHighlights profile={profile} />
                  </div>
                  <div className="space-y-6">
                    <ProfileDetailsForm
                      role={resolvedRole}
                      profile={profile}
                      onSave={setProfile}
                    />
                  </div>
                </div>
              </>
            ) : (
              <ProfileSignedOut />
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
};
