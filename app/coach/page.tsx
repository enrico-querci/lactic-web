"use client";

import { useCallback } from "react";
import { getCoachDashboard } from "@/lib/api/endpoints/dashboard";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { CoachDashboardView } from "@/components/domain/coach-dashboard";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";

/** Lactic Studio's Home: a few numbers, what needs attention, and shortcuts. */
export default function CoachHomePage() {
  const { t } = useLocale();
  const query = useAsync("coach-dashboard", useCallback(() => getCoachDashboard(), []));

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );
  if (!query.data) return null;

  return <CoachDashboardView data={query.data} />;
}
