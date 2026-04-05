import type { AuthRole } from "../../../types/auth.types";

export interface ProfileData {
    id: string;
    userId: string;
    role: AuthRole;
    fullName: string;
    email: string;
    avatarAssetId: string | null;
    avatarUrl: string | null;
    phone: string;
    location: string;
    bio: string;
    specialties: string[];
    pricePerHour: number | null;
    experienceYears: number | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProfileCreatePayload {
    role: AuthRole;
    fullName?: string;
}

export interface ProfileUpdatePayload {
    fullName: string;
    phone: string;
    location: string;
    bio: string;
    specialties: string[];
    pricePerHour?: number;
    experienceYears?: number;
}

export interface ProfileAvatarUpdatePayload {
    assetId: string;
}
