import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import type { ProfileData } from "../types/profile.types";

interface ProfileSummaryCardProps {
    profile: ProfileData;
}

const getInitials = (name: string) => {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const formatPrice = (value: number | null) => {
    if (value === null) return "Not set";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
};

export const ProfileSummaryCard = ({ profile }: ProfileSummaryCardProps) => {
    const badgeVariant = profile.role === "photographer" ? "accent" : "neutral";
    const badgeLabel =
        profile.role === "photographer" ? "Photographer" : "Client";

    return (
        <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
            <CardContent className="space-y-6 p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-background text-lg font-semibold text-foreground">
                        {getInitials(profile.fullName || "Fotovia User")}
                    </div>

                    <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-serif text-2xl text-foreground">
                                {profile.fullName || "Unnamed profile"}
                            </h2>
                            <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                        </div>

                        <p className="break-all text-sm text-muted">
                            {profile.email || "No email"}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="rounded-2xl border border-border bg-background px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            Location
                        </p>
                        <p className="mt-2 break-words text-sm text-foreground">
                            {profile.location || "Not set"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted">
                            Phone
                        </p>
                        <p className="mt-2 break-all text-sm text-foreground">
                            {profile.phone || "Not set"}
                        </p>
                    </div>

                    {profile.role === "photographer" ? (
                        <>
                            <div className="rounded-2xl border border-border bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                    Price per hour
                                </p>
                                <p className="mt-2 text-sm text-foreground">
                                    {formatPrice(profile.pricePerHour)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-border bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                    Experience
                                </p>
                                <p className="mt-2 text-sm text-foreground">
                                    {profile.experienceYears !== null
                                        ? `${profile.experienceYears} year(s)`
                                        : "Not set"}
                                </p>
                            </div>
                        </>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};
