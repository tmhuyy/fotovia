import type { AuthResponse, AuthUser, AuthRole } from "../types/auth.types";
import { authClient } from "./api/axios";

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

// Assumes direct auth-service routes. Adjust if backend paths differ.
const AUTH_ENDPOINTS = {
  signIn: "/auth/signin",
  signUp: "/auth/signup",
  currentUser: "/auth/me",
  registerEmail: "/auth/register-email",
};

const normalizeUser = (user: Record<string, unknown> | undefined): AuthUser | null => {
  if (!user) return null;
  return {
    id: (user.id as string) ?? (user._id as string),
    email: user.email as string | undefined,
    role: user.role as AuthUser["role"],
    fullName: (user.fullName as string) ?? (user.name as string),
  };
};

const normalizeAuthResponse = (data: Record<string, unknown>): AuthResponse => {
  const payload = (data.data as Record<string, unknown>) ?? data;
  const token =
    (payload.accessToken as string) ||
    (payload.token as string) ||
    (payload.access_token as string);
  const user = normalizeUser(payload.user as Record<string, unknown> | undefined);

  if (!token) {
    throw new Error("Missing access token in auth response.");
  }

  return { accessToken: token, user };
};

export const authService = {
  signIn: async (payload: SignInPayload): Promise<AuthResponse> => {
    const response = await authClient.post<Record<string, unknown>>(
      AUTH_ENDPOINTS.signIn,
      payload
    );
    return normalizeAuthResponse(response.data);
  },
  signUp: async (payload: SignUpPayload): Promise<AuthResponse> => {
    const response = await authClient.post<Record<string, unknown>>(
      AUTH_ENDPOINTS.signUp,
      {
        email: payload.email,
        password: payload.password,
        role: payload.role,
        fullName: payload.fullName,
        name: payload.fullName,
      }
    );
    return normalizeAuthResponse(response.data);
  },
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const response = await authClient.get<Record<string, unknown>>(
      AUTH_ENDPOINTS.currentUser
    );
    const payload = (response.data.data as Record<string, unknown>) ?? response.data;
    return normalizeUser(payload.user as Record<string, unknown> | undefined) ??
      (payload as AuthUser);
  },
  registerEmail: async (email: string, role: AuthRole) => {
    return authClient.post(AUTH_ENDPOINTS.registerEmail, { email, role });
  },
};
