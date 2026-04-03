import type { ProfileData } from "../types/profile.types";
import { ProfileSection } from "./profile-section";

interface ProfileRoleHighlightsProps {
  profile: ProfileData;
}

export const ProfileRoleHighlights = ({ profile }: ProfileRoleHighlightsProps) => {
  if (profile.role === "client") {
    const savedList = profile.savedPhotographers
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return (
      <div className="space-y-6">
        <ProfileSection
          title="Saved photographers"
          description="Quick access to photographers you love."
        >
          <div className="space-y-2 text-sm">
            {savedList.length ? (
              savedList.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
                >
                  <span className="text-foreground">{item}</span>
                  <span className="text-xs text-muted">Saved</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">
                No saved photographers yet. Start exploring to build your list.
              </p>
            )}
          </div>
        </ProfileSection>
        <ProfileSection
          title="Booking preferences"
          description="Your preferred session style and timing."
        >
          <p className="text-sm text-muted">
            {profile.bookingPreferences ||
              "Add your booking preferences to guide recommendations."}
          </p>
        </ProfileSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileSection
        title="Portfolio preview"
        description="A glimpse of your featured work for clients."
      >
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`portfolio-${index}`}
              className="aspect-[4/3] rounded-2xl border border-border bg-background"
            />
          ))}
        </div>
      </ProfileSection>
      <ProfileSection
        title="Availability snapshot"
        description="How clients see your booking cadence."
      >
        <div className="space-y-2 text-sm">
          <p className="text-foreground">
            {profile.availability || "Add availability details for clients."}
          </p>
          <p className="text-muted">
            {profile.pricingTier || "Add a pricing teaser for your profile."}
          </p>
        </div>
      </ProfileSection>
    </div>
  );
};
