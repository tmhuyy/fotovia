import type { AuthResponse, AuthRole, AuthUser } from "../types/auth.types";
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

const normalizeUser = (user: AnyRecord | undefined): AuthUser | null => {
    if (!user) return null;

    return {
        id: (user.id as string | undefined) ?? (user._id as string | undefined),
        email: user.email as string | undefined,
        role: user.role as AuthUser["role"] | undefined,
        fullName:
            (user.fullName as string | undefined) ??
            (user.name as string | undefined),
    };
};

const normalizeAuthResponse = (
    data: ApiResponse<AnyRecord> | AnyRecord,
): AuthResponse => {
    const payload = unwrapResponse(data);
    const token =
        (payload.accessToken as string | undefined) ??
        (payload.token as string | undefined) ??
        (payload.access_token as string | undefined);

    const user = normalizeUser(payload.user as AnyRecord | undefined);

    if (!token) {
        throw new Error("Missing access token in auth response.");
    }

    return {
        accessToken: token,
        refreshToken: payload.refreshToken as string | undefined,
        user,
    };
};

const normalizeSignInResponse = (
    data: ApiResponse<AuthTokenPayload> | AuthTokenPayload,
): AuthResponse => {
    const payload = unwrapResponse(data);

    if (!payload?.accessToken) {
        throw new Error("Missing access token in sign-in response.");
    }

    return {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: null,
    };
};

export const authService = {
    signIn: async (payload: SignInPayload): Promise<AuthResponse> => {
        const response = await authClient.post<
            ApiResponse<AuthTokenPayload> | AuthTokenPayload
        >(AUTH_ENDPOINTS.signIn, payload);

        return normalizeSignInResponse(response.data);
    },

    signUp: async (payload: SignUpPayload): Promise<AuthResponse> => {
        const response = await authClient.post<ApiResponse<AnyRecord>>(
            AUTH_ENDPOINTS.signUp,
            {
                email: payload.email,
                password: payload.password,
                role: payload.role,
                fullName: payload.fullName,
                name: payload.fullName,
            },
        );

        return normalizeAuthResponse(response.data);
    },

    getCurrentUser: async (): Promise<AuthUser> => {
        const response = await authClient.get<
            ApiResponse<AnyRecord> | AnyRecord
        >(AUTH_ENDPOINTS.currentUser);

        const payload = unwrapResponse(response.data) as AnyRecord;
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
