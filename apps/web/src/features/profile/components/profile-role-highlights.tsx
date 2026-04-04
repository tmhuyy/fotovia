import type { ProfileData } from "../types/profile.types";
import { ProfileSection } from "./profile-section";

interface ProfileRoleHighlightsProps {
    profile: ProfileData;
}

export const ProfileRoleHighlights = ({
    profile,
}: ProfileRoleHighlightsProps) => {
    if (profile.role === "client") {
        return (
            <ProfileSection
                title="Client profile notes"
                description="This phase focuses on the real profile foundation. Saved photographers and booking preferences can be layered in later."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-background px-4 py-4">
                        <p className="text-sm font-medium text-foreground">
                            Bio
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            {profile.bio ||
                                "Add a short note about your photography style or preferences."}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background px-4 py-4">
                        <p className="text-sm font-medium text-foreground">
                            Location
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                            {profile.location ||
                                "Set your location to improve future booking flows."}
                        </p>
                    </div>
                </div>
            </ProfileSection>
        );
    }

    return (
        <ProfileSection
            title="Photographer profile highlights"
            description="This section now reflects real photographer-oriented fields already supported by the backend profile foundation."
        >
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background px-4 py-4">
                    <p className="text-sm font-medium text-foreground">
                        Specialties
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                        {profile.specialties.length
                            ? profile.specialties.join(", ")
                            : "Add specialties to help clients understand your niche."}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-4">
                    <p className="text-sm font-medium text-foreground">
                        Experience
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                        {profile.experienceYears !== null
                            ? `${profile.experienceYears} year(s) listed`
                            : "Add experience years to build trust."}
                    </p>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-4">
                    <p className="text-sm font-medium text-foreground">
                        Rate foundation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                        {profile.pricePerHour !== null
                            ? `Current listed rate: ${profile.pricePerHour}`
                            : "Add a base hourly rate to support future booking and discovery flows."}
                    </p>
                </div>
            </div>
        </ProfileSection>
    );
};
