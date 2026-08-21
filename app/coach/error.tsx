"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ui/error-state";
import { useLocale } from "@/lib/i18n/context";

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
  const { t } = useLocale();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorState
      message={t("error.coachBoundary")}
      onRetry={reset}
      retryLabel={t("common.retry")}
    />
  );
}
