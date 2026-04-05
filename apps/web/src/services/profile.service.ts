import { profileClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";
import type { AuthRole } from "../types/auth.types";
import type {
    ProfileAvatarUpdatePayload,
    ProfileCreatePayload,
    ProfileData,
    ProfileUpdatePayload,
} from "../features/profile/types/profile.types";

type AnyRecord = Record<string, unknown>;

const PROFILE_ENDPOINTS = {
    me: "/profiles/me",
    avatar: "/profiles/me/avatar",
};

const normalizeRole = (value: unknown): AuthRole => {
    if (typeof value === "string" && value.toLowerCase() === "photographer") {
        return "photographer";
    }

    return "client";
};

const normalizeString = (value: unknown): string => {
    return typeof value === "string" ? value : "";
};

const normalizeNullableString = (value: unknown): string | null => {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const normalizeNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (
        typeof value === "string" &&
        value.trim() &&
        !Number.isNaN(Number(value))
    ) {
        return Number(value);
    }

    return null;
};

const normalizeStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];

    return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
};

const normalizeProfile = (
    payload: AnyRecord,
    email: string = "",
): ProfileData => {
    return {
        id: normalizeString(payload.id),
        userId: normalizeString(payload.userId),
        role: normalizeRole(payload.role),
        fullName: normalizeString(payload.fullName),
        email,
        avatarAssetId: normalizeNullableString(payload.avatarAssetId),
        avatarUrl: normalizeNullableString(payload.avatarUrl),
        phone: normalizeString(payload.phone),
        location: normalizeString(payload.location),
        bio: normalizeString(payload.bio),
        specialties: normalizeStringArray(payload.specialties),
        pricePerHour: normalizeNumber(payload.pricePerHour),
        experienceYears: normalizeNumber(payload.experienceYears),
        createdAt:
            typeof payload.createdAt === "string"
                ? payload.createdAt
                : undefined,
        updatedAt:
            typeof payload.updatedAt === "string"
                ? payload.updatedAt
                : undefined,
    };
};

export const profileService = {
    async getMyProfile(email: string = ""): Promise<ProfileData> {
        const response = await profileClient.get<
            ApiResponse<AnyRecord> | AnyRecord
        >(PROFILE_ENDPOINTS.me);
        const payload = unwrapResponse<AnyRecord>(response.data);

        return normalizeProfile(payload, email);
    },

    async createMyProfile(
        payload: ProfileCreatePayload,
        email: string = "",
    ): Promise<ProfileData> {
        const response = await profileClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(PROFILE_ENDPOINTS.me, payload);
        const data = unwrapResponse<AnyRecord>(response.data);

        return normalizeProfile(data, email);
    },

    async updateMyProfile(
        payload: ProfileUpdatePayload,
        email: string = "",
    ): Promise<ProfileData> {
        const response = await profileClient.patch<
            ApiResponse<AnyRecord> | AnyRecord
        >(PROFILE_ENDPOINTS.me, payload);
        const data = unwrapResponse<AnyRecord>(response.data);

        return normalizeProfile(data, email);
    },

    async updateMyAvatar(
        payload: ProfileAvatarUpdatePayload,
        email: string = "",
    ): Promise<ProfileData> {
        const response = await profileClient.patch<
            ApiResponse<AnyRecord> | AnyRecord
        >(PROFILE_ENDPOINTS.avatar, payload);
        const data = unwrapResponse<AnyRecord>(response.data);

        return normalizeProfile(data, email);
    },
};
