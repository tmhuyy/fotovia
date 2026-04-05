"use client";

import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Section } from "../../../components/common/section";
import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { normalizeApiError } from "../../../services/api/error";
import { assetService } from "../../../services/asset.service";
import { profileService } from "../../../services/profile.service";
import { useAuthStore } from "../../../store/auth.store";
import type { ProfileUpdatePayload } from "../types/profile.types";
import { ProfileAvatarUploader } from "./profile-avatar-uploader";
import { ProfileDetailsForm } from "./profile-details-form";
import { ProfileEmptyState } from "./profile-empty-state";
import { ProfileHeader } from "./profile-header";
import { ProfileRoleHighlights } from "./profile-role-highlights";
import { ProfileSignedOut } from "./profile-signed-out";
import { ProfileSummaryCard } from "./profile-summary-card";

const resolveErrorMessage = (error: unknown, fallbackMessage: string) =>
{
    const normalized = normalizeApiError(error, fallbackMessage);

    if (normalized.status || normalized.message !== fallbackMessage) {
        return normalized.message;
    }

    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }

    return fallbackMessage;
};

const ProfilePageSkeleton = () =>
{
    return (
        <>
            <Navbar />
            <main className="pb-16 pt-10">
                <Container className="space-y-8">
                    <div className="space-y-4">
                        <div className="h-5 w-28 animate-pulse rounded bg-border/60" />
                        <div className="h-12 w-80 animate-pulse rounded bg-border/60" />
                        <div className="h-6 w-[32rem] max-w-full animate-pulse rounded bg-border/50" />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <div className="h-80 animate-pulse rounded-[2rem] border border-border bg-surface/60" />

                        <div className="space-y-6">
                            <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-surface/60" />
                            <div className="h-[28rem] animate-pulse rounded-[2rem] border border-border bg-surface/60" />
                            <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-surface/60" />
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
};

export const ProfilePage = () =>
{
    const queryClient = useQueryClient();
    const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

    const authEmail = user?.email ?? "";
    const authRole = user?.role ?? "client";
    const queryKey = ["my-profile", user?.id ?? "anonymous"] as const;

    const profileQuery = useQuery({
        queryKey,
        queryFn: () => profileService.getMyProfile(authEmail),
        enabled: hasHydrated && !isHydrating && isAuthenticated,
        retry: false,
    });

    const createProfileMutation = useMutation({
        mutationFn: () =>
            profileService.createMyProfile(
                {
                    role: authRole,
                },
                authEmail,
            ),
        onSuccess: (profile) =>
        {
            queryClient.setQueryData(queryKey, profile);

            toast.success("Profile foundation created", {
                description: "You can now continue editing your profile details.",
            });
        },
        onError: () =>
        {
            toast.error("We couldn’t create your profile", {
                description: "Please try again in a moment.",
            });
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: (payload: ProfileUpdatePayload) =>
            profileService.updateMyProfile(payload, authEmail),
        onSuccess: (profile) =>
        {
            queryClient.setQueryData(queryKey, profile);
        },
    });

    const updateAvatarMutation = useMutation({
        mutationFn: async (file: File) =>
        {
            const uploadSession = await assetService.createUploadSession({
                purpose: "AVATAR",
                visibility: "PUBLIC",
                resourceType: "IMAGE",
                originalFilename: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
            });

            await assetService.uploadToSignedUrl({
                bucketName: uploadSession.asset.bucketName,
                path: uploadSession.uploadData.path,
                token: uploadSession.uploadData.token,
                signedUrl: uploadSession.uploadData.signedUrl,
                file,
                contentType: file.type,
            });

            const confirmedUpload = await assetService.confirmUploadSession(
                uploadSession.uploadSession.id,
                {
                    metadataJson: {
                        source: "web-profile-avatar-upload",
                        originalFilename: file.name,
                    },
                },
            );

            return profileService.updateMyAvatar(
                {
                    assetId: confirmedUpload.asset.id,
                },
                authEmail,
            );
        },
        onSuccess: (profile) =>
        {
            queryClient.setQueryData(queryKey, profile);

            toast.success("Avatar updated", {
                description: "Your new profile photo is now connected to your account.",
            });
        },
        onError: (error) =>
        {
            toast.error("We couldn’t update your avatar", {
                description: resolveErrorMessage(
                    error,
                    "Please try again in a moment.",
                ),
            });
        },
    });

    const profileError = profileQuery.error
        ? normalizeApiError(
            profileQuery.error,
            "We couldn’t load your profile right now.",
        )
        : null;

    const isProfileMissing = profileError?.status === 404;
    const resolvedRole = profileQuery.data?.role ?? authRole;

    const headerCopy = useMemo(() =>
    {
        if (resolvedRole === "photographer") {
            return {
                title: "Your photographer profile",
                subtitle:
                    "Manage the real profile foundation that clients will build trust around later.",
                roleLabel: "Photographer account",
                roleVariant: "accent" as const,
            };
        }

        return {
            title: "Your client profile",
            subtitle:
                "Keep your core profile details ready for future booking and recommendation flows.",
            roleLabel: "Client account",
            roleVariant: "neutral" as const,
        };
    }, [resolvedRole]);

    if (!hasHydrated || isHydrating) {
        return <ProfilePageSkeleton />;
    }

    if (!isAuthenticated) {
        return (
            <>
                <Navbar />
                <ProfileSignedOut />
                <Footer />
            </>
        );
    }

    if (profileQuery.isLoading) {
        return <ProfilePageSkeleton />;
    }

    if (isProfileMissing) {
        return (
            <>
                <Navbar />
                <main className="pb-16 pt-10">
                    <Container className="space-y-8">
                        <Section className="space-y-8">
                            <ProfileHeader
                                title={headerCopy.title}
                                subtitle={headerCopy.subtitle}
                                roleLabel={headerCopy.roleLabel}
                                roleVariant={headerCopy.roleVariant}
                            />

                            <ProfileEmptyState
                                role={authRole}
                                isCreating={createProfileMutation.isPending}
                                onCreate={() => createProfileMutation.mutate()}
                            />
                        </Section>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    if (profileQuery.isError || !profileQuery.data) {
        return (
            <>
                <Navbar />
                <main className="pb-16 pt-10">
                    <Container>
                        <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                            <CardContent className="space-y-4 p-8">
                                <div className="space-y-2">
                                    <h1 className="font-serif text-3xl text-foreground">
                                        We couldn’t load your profile
                                    </h1>

                                    <p className="text-sm leading-6 text-muted">
                                        {profileError?.message ?? "Please try again in a moment."}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    className="rounded-full"
                                    onClick={() => profileQuery.refetch()}
                                >
                                    Try again
                                </Button>
                            </CardContent>
                        </Card>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    const profile = profileQuery.data;

    return (
        <>
            <Navbar />
            <main className="pb-16 pt-10">
                <Container className="space-y-8">
                    <Section className="space-y-8">
                        <ProfileHeader
                            title={headerCopy.title}
                            subtitle={headerCopy.subtitle}
                            roleLabel={headerCopy.roleLabel}
                            roleVariant={headerCopy.roleVariant}
                        />

                        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                            <ProfileSummaryCard profile={profile} />

                            <div className="space-y-6">
                                <ProfileAvatarUploader
                                    profile={profile}
                                    isUploading={updateAvatarMutation.isPending}
                                    onUpload={async (file) => { await updateAvatarMutation.mutateAsync(file); }}
                                />

                                <ProfileDetailsForm
                                    role={profile.role}
                                    profile={profile}
                                    onSave={async (payload) =>
                                        updateProfileMutation.mutateAsync(payload)
                                    }
                                />

                                <ProfileRoleHighlights profile={profile} />
                            </div>
                        </div>
                    </Section>
                </Container>
            </main>
            <Footer />
        </>
    );
};