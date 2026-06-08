import { useRef, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { assetService } from "../../../services/asset.service";
import type { ProfileData } from "../types/profile.types";

interface ProfileOverviewCardProps
{
    profile: ProfileData;
    isAvatarUploading: boolean;
    onEdit: () => void;
    onAvatarUpload: (file: File) => Promise<unknown>;
}

interface IconProps
{
    className?: string;
}

const CameraIcon = ({ className = "h-5 w-5" }: IconProps) =>
{
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
            <path d="M12 15.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
        </svg>
    );
};

const getInitials = (name: string) =>
{
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const formatPrice = (value: number | null) =>
{
    if (value === null) return "Not set";

    return `${new Intl.NumberFormat("vi-VN").format(value)} VND / hour`;
};

const formatExperience = (value: number | null) =>
{
    if (value === null) return "Not set";
    if (value < 1) return "<1 year";
    if (value <= 3) return "1-3 years";
    if (value <= 5) return ">3 years";

    return ">5 years";
};

const displayText = (value: string | null | undefined) =>
{
    const normalizedValue = value?.trim();

    return normalizedValue && normalizedValue.length > 0
        ? normalizedValue
        : "Not set";
};

export const ProfileOverviewCard = ({
    profile,
    isAvatarUploading,
    onEdit,
    onAvatarUpload,
}: ProfileOverviewCardProps) =>
{
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const isPhotographer = profile.role === "photographer";
    const roleLabel = isPhotographer ? "Photographer" : "Client";
    const roleVariant = isPhotographer ? "accent" : "neutral";

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) =>
    {
        const file = event.target.files?.[0] ?? null;
        const validation = assetService.validateImageFile(file);

        if (!validation.isValid || !file) {
            toast.error("Avatar file is not valid", {
                description: validation.message,
            });

            if (avatarInputRef.current) {
                avatarInputRef.current.value = "";
            }

            return;
        }

        try {
            await onAvatarUpload(file);

            toast.success("Avatar updated", {
                description: "Your profile photo has been updated.",
            });
        } catch {
            toast.error("We couldn’t update your avatar", {
                description: "Please try again in a moment.",
            });
        } finally {
            if (avatarInputRef.current) {
                avatarInputRef.current.value = "";
            }
        }
    };

    return (
        <section className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-surface px-5 py-8 shadow-[0_24px_70px_rgba(23,23,23,0.08)] sm:px-8 sm:py-10 lg:px-12">
            <div className="flex flex-col items-center text-center">
                <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[6px] border-surface bg-background text-2xl font-semibold text-foreground shadow-lg">
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={`${profile.fullName || "Fotovia user"} avatar`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            getInitials(profile.fullName || "Fotovia User")
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isAvatarUploading}
                        className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Change profile avatar"
                    >
                        <CameraIcon className="h-5 w-5" />
                    </button>

                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept={assetService.acceptedImageMimeTypes.join(",")}
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isAvatarUploading}
                    />
                </div>

                <div className="mt-5 space-y-2">
                    <h1 className="font-display text-4xl tracking-[-0.04em] text-foreground">
                        {profile.fullName || "Unnamed profile"}
                    </h1>

                    <div className="flex justify-center">
                        <Badge variant={roleVariant}>{roleLabel}</Badge>
                    </div>

                    <p className="break-all text-sm text-muted">
                        {profile.email || "No email"}
                    </p>
                </div>
            </div>

            <div className="mx-auto mt-8 max-w-3xl border-t border-border pt-8">
                <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                    <ProfileInfoItem label="Full name">
                        {displayText(profile.fullName)}
                    </ProfileInfoItem>

                    <ProfileInfoItem label="Email">
                        {displayText(profile.email)}
                    </ProfileInfoItem>

                    <ProfileInfoItem label="Phone number">
                        {displayText(profile.phone)}
                    </ProfileInfoItem>

                    <ProfileInfoItem label="Location">
                        {displayText(profile.location)}
                    </ProfileInfoItem>

                    <ProfileInfoItem className="md:col-span-2" label="Bio">
                        {displayText(profile.bio)}
                    </ProfileInfoItem>

                    {isPhotographer ? (
                        <>
                            <ProfileInfoItem label="Price per hour">
                                {formatPrice(profile.pricePerHour)}
                            </ProfileInfoItem>

                            <ProfileInfoItem label="Experience">
                                {formatExperience(profile.experienceYears)}
                            </ProfileInfoItem>
                        </>
                    ) : null}
                </div>

                <Button
                    type="button"
                    onClick={onEdit}
                    className="mt-8 w-full cursor-pointer rounded-2xl bg-foreground py-6 text-base font-semibold text-background hover:opacity-90"
                >
                    Update information
                </Button>
            </div>
        </section>
    );
};

interface ProfileInfoItemProps
{
    label: string;
    children: ReactNode;
    className?: string;
}

const ProfileInfoItem = ({
    label,
    children,
    className = "",
}: ProfileInfoItemProps) =>
{
    return (
        <div className={className}>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
                {label}
            </p>

            <div className="mt-2 break-words text-base font-medium leading-7 text-foreground">
                {children}
            </div>
        </div>
    );
};