"use client";

import { useCallback } from "react";
import Link from "next/link";
import { getClientPrograms } from "@/lib/api/endpoints/client-programs";
import { formatDate } from "@/lib/utils/format";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/messages/en";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-zinc-100 text-zinc-600",
  paused: "bg-yellow-100 text-yellow-700",
};

// "completed" reuses common.completed rather than its own program.status.*
// key: same Italian word applies to a finished program assignment as to a
// finished workout session, and the corpus doesn't need two copies of it.
const STATUS_LABEL: Record<string, MessageKey> = {
  active: "program.status.active",
  completed: "common.completed",
  paused: "program.status.paused",
};

export default function ClientProgramsPage() {
  const { t, locale } = useLocale();
  const { data, error, initial, reload } = useAsync(
    "client-programs",
    useCallback(() => getClientPrograms(), [])
  );

  if (initial) return <Loading />;
  if (error)
    return <ErrorState message={error} onRetry={reload} retryLabel={t("common.retry")} />;

  const assignments = data ?? [];
  if (assignments.length === 0) {
    return <EmptyState message={t("program.noneAssigned")} />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{t("program.myPrograms")}</h1>

      <div className="space-y-3">
        {assignments.map((a) => (
          <Link
            key={a.id}
            href={`/client/programs/${a.program.id}`}
            className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
          >
            {/* gap-2 and shrink-0 so a long program name wraps instead of
                crushing the status badge on a narrow phone. */}
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-medium text-zinc-900">{a.program.name}</h2>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] || ""}`}
              >
                {t(STATUS_LABEL[a.status] ?? "program.status.active")}
              </span>
            </div>
            {a.program.description && (
              <p className="mt-1 text-sm text-zinc-500">
                {a.program.description}
              </p>
            )}
            <p className="mt-2 text-xs text-zinc-400">
              {t("program.starts", { date: formatDate(a.start_date, locale) })}
              {a.notes && ` · ${a.notes}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
