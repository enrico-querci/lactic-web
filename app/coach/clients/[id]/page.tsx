"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { getClient, getClientProgress } from "@/lib/api/endpoints/clients";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { formatDateTime, formatDuration } from "@/lib/utils/format";

export default function ClientDetailPage() {
  const { t, locale } = useLocale();
  const params = useParams();
  const clientId = Number(params.id);

  const query = useAsync(
    String(clientId),
    useCallback(
      () => Promise.all([getClient(clientId), getClientProgress(clientId)]),
      [clientId]
    )
  );
  const [client, sessions] = query.data ?? [null, []];

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );
  if (!client) return <div>{t("clients.notFound")}</div>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-zinc-900">{client.name}</h1>
      <p className="mb-6 text-sm text-zinc-500">{client.email}</p>

      <h2 className="mb-4 text-lg font-semibold text-zinc-900">
        {t("history.title")}
      </h2>

      {sessions.length === 0 ? (
        <EmptyState message={t("clients.noSessions")} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">{t("common.date")}</th>
                <th className="px-6 py-3">{t("common.duration")}</th>
                <th className="px-6 py-3">{t("common.notes")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3 text-sm text-zinc-900">
                    {formatDateTime(session.started_at, locale)}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {session.completed_at
                      ? formatDuration(session.started_at, session.completed_at)
                      : t("common.inProgress")}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {session.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
