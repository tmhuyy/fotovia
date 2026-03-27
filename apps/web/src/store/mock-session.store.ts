import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthRole, AuthUser } from "../types/auth.types";

interface MockSessionState {
  isAuthenticated: boolean;
  role: AuthRole | null;
  user: AuthUser | null;
  setSession: (payload: { role: AuthRole; user: AuthUser }) => void;
  signInAsClient: () => void;
  signInAsPhotographer: () => void;
  signOut: () => void;
}

const mockUsers: Record<AuthRole, AuthUser> = {
  client: {
    id: "mock-client",
    fullName: "Avery Park",
    email: "client@fotovia.test",
    role: "client",
  },
  photographer: {
    id: "mock-photographer",
    fullName: "Rowan Lee",
    email: "photographer@fotovia.test",
    role: "photographer",
  },
};

export const useMockSessionStore = create<MockSessionState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      role: null,
      user: null,
      setSession: ({ role, user }) =>
        set({ isAuthenticated: true, role, user }),
      signInAsClient: () =>
        set({
          isAuthenticated: true,
          role: "client",
          user: mockUsers.client,
        }),
      signInAsPhotographer: () =>
        set({
          isAuthenticated: true,
          role: "photographer",
          user: mockUsers.photographer,
        }),
      signOut: () => set({ isAuthenticated: false, role: null, user: null }),
    }),
    {
      name: "fotovia-mock-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        user: state.user,
      }),
    }
  )
);
