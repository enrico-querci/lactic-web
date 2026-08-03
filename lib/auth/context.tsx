"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@/lib/api/types";
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  post,
  get,
  del,
} from "@/lib/api/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  loginWithProvider: (
    provider: string,
    idToken: string,
    options?: { invitationToken?: string }
  ) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session via refresh token
  useEffect(() => {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("lactic_refresh_token")
        : null;

    const restore = async () => {
      if (!refreshToken) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          }
        );

        if (!res.ok) {
          setRefreshToken(null);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);

        const me = await get<User>("/me");
        setUser(me);
      } catch {
        setAccessToken(null);
        setRefreshToken(null);
      }
    };

    restore().finally(() => setLoading(false));
  }, []);

  // Dev login (dev/test only)
  const login = useCallback(async (email: string) => {
    const res = await post<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>("/auth/dev_login", { email });

    setAccessToken(res.access_token);
    setRefreshToken(res.refresh_token);
    setUser(res.user);
  }, []);

  // Real auth (Google/Apple)
  const loginWithProvider = useCallback(
    async (
      provider: string,
      idToken: string,
      options?: { invitationToken?: string }
    ) => {
      const res = await post<{
        access_token: string;
        refresh_token: string;
        user: User;
      }>("/auth", {
        provider,
        id_token: idToken,
        invitation_token: options?.invitationToken,
      });

      setAccessToken(res.access_token);
      setRefreshToken(res.refresh_token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("lactic_refresh_token")
        : null;

    try {
      if (refreshToken && getAccessToken()) {
        await del("/auth", { refresh_token: refreshToken });
      }
    } catch {
      // Ignore logout failures
    }

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithProvider, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
