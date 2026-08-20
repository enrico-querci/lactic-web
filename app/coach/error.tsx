"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Catches a render-phase throw from any coach page. Does not catch throws
 * from app/coach/layout.tsx itself (RoleGuard, useAuth) — those only reach
 * app/global-error.tsx. No wrapper here: the layout's own <main
 * className="... p-8"> already provides the container, and the sidebar
 * keeps rendering around this, so a broken page still leaves navigation
 * reachable.
 */
export default function CoachError({
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
      message="This page hit a problem. Try again, or use the sidebar to go elsewhere."
      onRetry={reset}
    />
  );
}
