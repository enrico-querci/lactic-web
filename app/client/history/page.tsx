"use client";

import { useCallback } from "react";
import Link from "next/link";
import { getClientSessions } from "@/lib/api/endpoints/client-sessions";
import { formatDateTime, formatDuration } from "@/lib/utils/format";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export default function HistoryPage() {
  const { t, locale } = useLocale();
  const { data, error, initial, reload } = useAsync(
    "client-sessions",
    useCallback(() => getClientSessions(), [])
  );

  if (initial) return <Loading />;
  if (error)
    return <ErrorState message={error} onRetry={reload} retryLabel={t("common.retry")} />;

  const sessions = data ?? [];
  if (sessions.length === 0) {
    return <EmptyState message={t("history.noneYet")} />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        {t("history.title")}
      </h1>

      <div className="space-y-2">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/client/history/${session.id}`}
            className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
          >
            <div className="min-w-0">
              <p className="font-medium text-zinc-900">
                {formatDateTime(session.started_at, locale)}
              </p>
              {session.notes && (
                <p className="mt-1 truncate text-sm text-zinc-500">{session.notes}</p>
              )}
            </div>
            {/* shrink-0 keeps the duration on one line; a long note otherwise
                squeezes "In progress" into a vertical stack of characters. */}
            <div className="shrink-0 text-sm text-zinc-500">
              {session.completed_at
                ? formatDuration(session.started_at, session.completed_at)
                : t("common.inProgress")}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
