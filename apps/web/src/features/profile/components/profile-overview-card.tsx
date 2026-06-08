import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import type { ProfileData } from "../types/profile.types";

interface ProfileOverviewCardProps
{
    profile: ProfileData;
    onEdit: () => void;
}

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

    return `${value} year${value > 1 ? "s" : ""}`;
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
    onEdit,
}: ProfileOverviewCardProps) =>
{
    const isPhotographer = profile.role === "photographer";
    const roleLabel = isPhotographer ? "Photographer" : "Client";
    const roleVariant = isPhotographer ? "accent" : "neutral";

    return (
        <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_24px_70px_rgba(23,23,23,0.08)]">
            <div className="relative h-44 overflow-hidden bg-brand-accent/70 sm:h-56">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.65),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_30%)]" />

                {/* <div className="absolute bottom-5 right-5 rounded-full border border-white/60 bg-surface/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted shadow-sm">
                    {roleLabel} account
                </div> */}
            </div>

            <div className="px-5 pb-8 sm:px-8 lg:px-12">
                <div className="-mt-16 flex flex-col items-center text-center">
                    <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[6px] border-surface bg-background text-3xl font-semibold text-foreground shadow-lg">
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

                    <div className="mt-4 space-y-2">
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
                    <div className="grid gap-6 md:grid-cols-2">
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

                                <ProfileInfoItem
                                    className="md:col-span-2"
                                    label="Specialties"
                                >
                                    {profile.specialties.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {profile.specialties.map((item) => (
                                                <span
                                                    key={item}
                                                    className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted"
                                                >
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        "Not set"
                                    )}
                                </ProfileInfoItem>
                            </>
                        ) : null}
                    </div>

                    <Button
                        type="button"
                        onClick={onEdit}
                        className="mt-8 w-full rounded-2xl bg-foreground py-6 text-base font-semibold text-background hover:opacity-90"
                    >
                        Update information
                    </Button>
                </div>
            </div>
        </section>
    );
};

interface ProfileInfoItemProps
{
    label: string;
    children: React.ReactNode;
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