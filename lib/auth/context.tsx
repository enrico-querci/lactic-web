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
} from "@/lib/api/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
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

    if (!refreshToken) {
      setLoading(false);
      return;
    }

    // Try refresh + fetch user
    const restore = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

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

  const logout = useCallback(async () => {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("lactic_refresh_token")
        : null;

    try {
      if (refreshToken && getAccessToken()) {
        await post("/auth", undefined); // logout is DELETE, handle below
      }
    } catch {
      // Ignore logout failures
    }

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
