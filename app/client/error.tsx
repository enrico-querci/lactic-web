"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ui/error-state";
import { useLocale } from "@/lib/i18n/context";

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
  const { t } = useLocale();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorState
      message={t("error.clientBoundary")}
      onRetry={reset}
      retryLabel={t("common.retry")}
    />
  );
}
