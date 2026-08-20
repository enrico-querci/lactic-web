"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Catches a render-phase throw from any client page. Does not catch throws
 * from app/client/layout.tsx itself (RoleGuard, useAuth) — those only reach
 * app/global-error.tsx. No wrapper here: the layout's own <main
 * className="mx-auto max-w-2xl px-4 py-6"> already provides the container,
 * and the top nav keeps rendering around this, so a trainee can still get
 * to Home or History even if one page breaks.
 */
export default function ClientError({
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
    <ErrorState
      message="This page hit a problem. Try again, or use the menu above to go elsewhere."
      onRetry={reset}
    />
  );
}
