"use client";

/// <reference path="../../../lib/auth/google.d.ts" />

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useGoogleIdentityScript } from "@/lib/auth/use-google-script";
import { useLocale } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const IS_DEV =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_API_URL?.includes("localhost");

export default function LoginPage() {
  const { login, loginWithProvider, user } = useAuth();
  const { t, locale } = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const redirectAfterLogin = useCallback(
    (role: string) => {
      router.push(role === "coach" ? "/coach/programs" : "/client/programs");
    },
    [router]
  );

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      redirectAfterLogin(user.role);
    }
  }, [user, redirectAfterLogin]);

  // Set up Google callback
  useEffect(() => {
    window.__lacticGoogleCallback = async (
      response: GoogleCredentialResponse
    ) => {
      setError(null);
      setLoading(true);
      try {
        await loginWithProvider("google", response.credential);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("login.googleFailed"));
      } finally {
        setLoading(false);
      }
    };
  }, [loginWithProvider, t]);

  const initializeGoogle = () => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: window.__lacticGoogleCallback!,
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "signin_with",
    });
  };

  useGoogleIdentityScript(locale, initializeGoogle);

  // Dev login handler
  const handleDevLogin = async (email: string, role: "coach" | "client") => {
    setError(null);
    setLoading(true);
    try {
      await login(email);
      redirectAfterLogin(role);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.devFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">Lactic</h1>
          <LanguageSwitcher />
        </div>
        <p className="mb-8 text-sm text-zinc-500">{t("login.subtitle")}</p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-4 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
          </div>
        )}

        {/* Google Sign-In button */}
        {GOOGLE_CLIENT_ID && (
          <div ref={googleButtonRef} className="mb-4 flex justify-center" />
        )}

        {/* Dev login (local only) */}
        {IS_DEV && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs text-zinc-400">Dev login</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleDevLogin("john@example.com", "coach")}
                disabled={loading}
                className="rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                Login as Coach (John)
              </button>
              <button
                onClick={() => handleDevLogin("alice@example.com", "client")}
                disabled={loading}
                className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                Login as Client (Alice)
              </button>
              <button
                onClick={() => handleDevLogin("bob@example.com", "client")}
                disabled={loading}
                className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                Login as Client (Bob)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
