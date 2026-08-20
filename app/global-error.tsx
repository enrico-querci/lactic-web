"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ui/error-state";
import "./globals.css";

/**
 * The one boundary that catches a throw from the root layout itself —
 * notably AuthProvider / useAuth() (lib/auth/context.tsx), since AuthProvider
 * is mounted there. No other error.tsx in this app can see that: a
 * segment's error.tsx never catches its own layout's throws, only its
 * page's.
 *
 * This replaces the entire root layout when it activates, so it renders its
 * own <html>/<body> and re-imports globals.css directly rather than relying
 * on the layout that just failed. It also runs outside AuthProvider, so
 * there is no user to attach — the report below carries only the error.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 480, margin: "10vh auto", padding: "0 1rem" }}>
          <ErrorState
            message="Something went wrong. Try reloading the page."
            onRetry={reset}
          />
        </div>
      </body>
    </html>
  );
}
