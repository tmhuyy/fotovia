export type AuthRole = "client" | "photographer";

export interface AuthUser {
  id?: string;
  email?: string;
  role?: AuthRole;
  fullName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser | null;
}
