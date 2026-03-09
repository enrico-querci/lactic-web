"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    router.replace(
      user.role === "coach" ? "/coach/programs" : "/client/programs"
    );
    return null;
  }

  const handleLogin = async (email: string, role: "coach" | "client") => {
    setError(null);
    setLoading(true);
    try {
      await login(email);
      router.push(role === "coach" ? "/coach/programs" : "/client/programs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">Lactic</h1>
        <p className="mb-8 text-sm text-zinc-500">
          Dev login — select a role to continue
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleLogin("john@example.com", "coach")}
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            Login as Coach (John)
          </button>
          <button
            onClick={() => handleLogin("alice@example.com", "client")}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            Login as Client (Alice)
          </button>
          <button
            onClick={() => handleLogin("bob@example.com", "client")}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            Login as Client (Bob)
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Uses dev_login endpoint — dev/test environments only
        </p>
      </div>
    </div>
  );
}
