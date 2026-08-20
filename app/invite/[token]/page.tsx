"use client";

/// <reference path="../../../lib/auth/google.d.ts" />

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  acceptClientInvitation,
  getClientInvitation,
} from "@/lib/api/endpoints/clients";
import type { ClientInvitation } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { useGoogleIdentityScript } from "@/lib/auth/use-google-script";
import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function ClientInvitationPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const { user, loading: authLoading, loginWithProvider, logout } = useAuth();
  const { locale } = useLocale();
  const [invitation, setInvitation] = useState<ClientInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getClientInvitation(token)
      .then(setInvitation)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Invalid invitation link")
      )
      .finally(() => setLoading(false));
  }, [token]);

  const finishOnboarding = useCallback(() => {
    router.replace("/client/programs");
  }, [router]);

  useEffect(() => {
    window.__lacticGoogleCallback = async (
      response: GoogleCredentialResponse
    ) => {
      setSubmitting(true);
      setError(null);
      try {
        await loginWithProvider("google", response.credential, {
          invitationToken: token,
        });
        finishOnboarding();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed");
      } finally {
        setSubmitting(false);
      }
    };

    return () => {
      delete window.__lacticGoogleCallback;
    };
  }, [finishOnboarding, loginWithProvider, token]);

  const initializeGoogle = useCallback(() => {
    if (
      !GOOGLE_CLIENT_ID ||
      !googleButtonRef.current ||
      !window.google ||
      user ||
      invitation?.status !== "pending"
    ) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: window.__lacticGoogleCallback!,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
    });
  }, [invitation?.status, user]);

  useEffect(() => {
    initializeGoogle();
  }, [initializeGoogle]);

  useGoogleIdentityScript(locale, initializeGoogle);

  const handleAccept = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await acceptClientInvitation(token);
      finishOnboarding();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept invitation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) return <Loading />;

  const unavailable = invitation && invitation.status !== "pending";
  const emailMatches =
    user && invitation && user.email.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">Join Lactic</h1>
          <LanguageSwitcher />
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {invitation && (
          <>
            <p className="mt-4 text-sm text-zinc-600">
              <strong>{invitation.coach_name}</strong> invited you to join as a
              client using <strong>{invitation.email}</strong>.
            </p>

            {unavailable ? (
              <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                This invitation is {invitation.status}. Ask your coach to send a
                new one.
              </p>
            ) : user ? (
              emailMatches && user.role === "client" ? (
                <Button
                  className="mt-6 w-full"
                  disabled={submitting}
                  onClick={handleAccept}
                >
                  {submitting ? "Joining…" : "Accept invitation"}
                </Button>
              ) : (
                <div className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                  <p>
                    You are signed in as {user.email}. Continue with
                    {` ${invitation.email}`} to accept this invitation.
                  </p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="secondary"
                    onClick={logout}
                  >
                    Sign out
                  </Button>
                </div>
              )
            ) : (
              <div className="mt-6">
                <p className="mb-3 text-sm text-zinc-500">
                  Continue with Google to verify your email and finish joining.
                </p>
                {submitting && (
                  <p className="mb-3 text-center text-sm text-zinc-500">
                    Verifying your account…
                  </p>
                )}
                {GOOGLE_CLIENT_ID ? (
                  <div ref={googleButtonRef} className="flex justify-center" />
                ) : (
                  <p className="text-sm text-red-600">
                    Google Sign-In is not configured.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
