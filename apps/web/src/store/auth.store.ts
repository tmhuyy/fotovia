import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";
import { authToken } from "../lib/auth-token";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (payload: { accessToken: string; user: AuthUser | null }) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setAuth: ({ accessToken, user }) => {
    authToken.set(accessToken);
    set({ accessToken, user, isAuthenticated: true });
  },
  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),
  clearAuth: () => {
    authToken.clear();
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
