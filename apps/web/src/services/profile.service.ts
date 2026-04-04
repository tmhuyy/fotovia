import { profileClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";
import type { AuthRole } from "../types/auth.types";
import type {
    ProfileCreatePayload,
    ProfileData,
    ProfileUpdatePayload,
} from "../features/profile/types/profile.types";

type AnyRecord = Record<string, unknown>;

const PROFILE_ENDPOINTS = {
    me: "/profiles/me",
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
        avatarUrl:
            typeof payload.avatarUrl === "string" ? payload.avatarUrl : null,
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

        const payload = unwrapResponse(response.data) as AnyRecord;
        return normalizeProfile(payload, email);
    },

    async createMyProfile(
        payload: ProfileCreatePayload,
        email: string = "",
    ): Promise<ProfileData> {
        const response = await profileClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(PROFILE_ENDPOINTS.me, payload);

        const data = unwrapResponse(response.data) as AnyRecord;
        return normalizeProfile(data, email);
    },

    async updateMyProfile(
        payload: ProfileUpdatePayload,
        email: string = "",
    ): Promise<ProfileData> {
        const response = await profileClient.patch<
            ApiResponse<AnyRecord> | AnyRecord
        >(PROFILE_ENDPOINTS.me, payload);

        const data = unwrapResponse(response.data) as AnyRecord;
        return normalizeProfile(data, email);
    },
};
