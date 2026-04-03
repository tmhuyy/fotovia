"use client";

import { ReactNode, useEffect } from "react";
import { authToken } from "../lib/auth-token";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

interface AuthSessionProviderProps {
  children: ReactNode;
}

export const AuthSessionProvider = ({ children }: AuthSessionProviderProps) => {
  const { setAuth, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const token = authToken.get();
    if (!token) return;

    let isMounted = true;

    const initializeSession = async () => {
      setLoading(true);
      setAuth({ accessToken: token, user: null });
      try {
        const user = await authService.getCurrentUser();
        if (isMounted) {
          setUser(user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [setAuth, setUser, setLoading]);

  return <>{children}</>;
};
