import type { AxiosRequestConfig } from "axios";

import type {
    AuthResponse,
    AuthRole,
    AuthUser,
    SignUpResponse,
} from "../types/auth.types";

import { authClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";

export interface SignInPayload {
    email: string;
    password: string;
}

export interface SignUpPayload {
    fullName: string;
    email: string;
    password: string;
    role: AuthRole;
}

const AUTH_ENDPOINTS = {
    signIn: "/auth/login",
    signUp: "/auth/signup",
    currentUser: "/auth/me",
    signOut: "/auth/signout",
    registerEmail: "/auth/register-email",
};

type AnyRecord = Record<string, unknown>;

interface AuthTokenPayload {
    accessToken: string;
    refreshToken?: string;
}

const normalizeNullableString = (value: unknown): string | null => {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const normalizeUser = (user: AnyRecord | undefined): AuthUser | null => {
    if (!user) return null;

    return {
        id: (user.id as string | undefined) ?? (user._id as string | undefined),
        email: user.email as string | undefined,
        role: user.role as AuthRole | undefined,
        fullName:
            (user.fullName as string | undefined) ??
            (user.name as string | undefined),
        avatarUrl: normalizeNullableString(user.avatarUrl ?? user.avatar_url),
    };
};

const normalizeSignInResponse = (
    data: ApiResponse<AuthTokenPayload> | AuthTokenPayload,
): AuthResponse => {
    const payload = unwrapResponse<AuthTokenPayload>(data);

    if (!payload.accessToken) {
        throw new Error("Missing access token in sign-in response.");
    }

    return {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: null,
    };
};

const normalizeSignUpResponse = (
    data: ApiResponse<AnyRecord> | AnyRecord,
): SignUpResponse => {
    const payload = unwrapResponse<AnyRecord>(data);

    const user = normalizeUser(
        (payload.user as AnyRecord | undefined) ?? payload,
    );

    return {
        user,
    };
};

export const authService = {
    signIn: async (payload: SignInPayload): Promise<AuthResponse> => {
        const response = await authClient.post<
            ApiResponse<AuthTokenPayload> | AuthTokenPayload
        >(AUTH_ENDPOINTS.signIn, payload);

        return normalizeSignInResponse(response.data);
    },

    signUp: async (payload: SignUpPayload): Promise<SignUpResponse> => {
        const response = await authClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(AUTH_ENDPOINTS.signUp, {
            email: payload.email,
            password: payload.password,
            role: payload.role,
            fullName: payload.fullName,
        });

        return normalizeSignUpResponse(response.data);
    },

    getCurrentUser: async (accessToken?: string): Promise<AuthUser> => {
        const config: AxiosRequestConfig | undefined = accessToken
            ? {
                  headers: {
                      Authorization: `Bearer ${accessToken}`,
                  },
              }
            : undefined;

        const response = await authClient.get<
            ApiResponse<AnyRecord> | AnyRecord
        >(AUTH_ENDPOINTS.currentUser, config);

        const payload = unwrapResponse<AnyRecord>(response.data);
        const user = normalizeUser(
            (payload.user as AnyRecord | undefined) ?? payload,
        );

        if (!user) {
            throw new Error("Missing user in /auth/me response.");
        }

        return user;
    },

    signOut: async (): Promise<void> => {
        await authClient.post(AUTH_ENDPOINTS.signOut);
    },

    registerEmail: async (email: string, role: AuthRole) => {
        return authClient.post(AUTH_ENDPOINTS.registerEmail, { email, role });
    },
};
