"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ui/error-state";
import { useLocale } from "@/lib/i18n/context";

/**
 * Catches render-phase throws below the root layout that have no closer
 * boundary of their own — notably app/(auth)/login and app/invite/[token],
 * neither of which has a layout.tsx. app/coach and app/client each have a
 * more specific boundary (error.tsx in those segments) that catches first.
 *
 * This renders inside the root layout (unlike global-error.tsx), so
 * LocaleProvider is available. A coach who lands here — e.g. hitting this
 * boundary from /login before authenticating — sees it in whatever locale
 * their browser negotiated, same tradeoff already accepted for /login itself.
 */
export default function Error({
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
    <div className="mx-auto max-w-md py-16">
      <ErrorState
        message={t("error.generic")}
        onRetry={reset}
        retryLabel={t("common.retry")}
      />
    </div>
  );
}
