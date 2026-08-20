"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Catches render-phase throws below the root layout that have no closer
 * boundary of their own — notably app/(auth)/login and app/invite/[token],
 * neither of which has a layout.tsx. app/coach and app/client each have a
 * more specific boundary (error.tsx in those segments) that catches first.
 */
export default function Error({
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
    <div className="mx-auto max-w-md py-16">
      <ErrorState
        message="Something went wrong. Try again, or come back later."
        onRetry={reset}
      />
    </div>
  );
}
