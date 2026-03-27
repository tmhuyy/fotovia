import type { AuthRole, AuthUser } from "../../../types/auth.types";
import type { ProfileData } from "../types/profile.types";

const baseProfile: Record<AuthRole, Omit<ProfileData, "role" | "fullName" | "email">> = {
  client: {
    phone: "+1 (555) 210-4487",
    location: "Austin, TX",
    bio: "I love editorial-style portraits and thoughtful storytelling sessions.",
    preferredStyles: "Editorial, Portrait, Lifestyle",
    bookingPreferences: "Weekend mornings, natural light, and studio options.",
    savedPhotographers: "Studio Reverie, Maison Noir, Northlight",
    studioName: "",
    specialties: "",
    serviceLocation: "",
    pricingTier: "",
    availability: "",
  },
  photographer: {
    phone: "+1 (555) 884-3391",
    location: "Los Angeles, CA",
    bio: "Fashion-forward portrait and editorial photographer with a cinematic edge.",
    preferredStyles: "",
    bookingPreferences: "",
    savedPhotographers: "",
    studioName: "Studio Reverie",
    specialties: "Editorial, Bridal, Cinematic",
    serviceLocation: "Los Angeles, CA + Travel",
    pricingTier: "Starting at $450 per session",
    availability: "2-3 sessions per week, weekday mornings preferred.",
  },
};

export const buildMockProfile = ({
  role,
  user,
}: {
  role: AuthRole;
  user: AuthUser | null;
}): ProfileData => {
  const defaults = baseProfile[role];

  return {
    role,
    fullName: user?.fullName ?? (role === "photographer" ? "Studio Reverie" : "Avery Park"),
    email: user?.email ?? (role === "photographer" ? "hello@reverie.studio" : "avery@fotovia.test"),
    ...defaults,
  };
};
