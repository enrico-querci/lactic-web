"use client";

import { useCallback, useState } from "react";
import {
  getWorkoutTemplates,
  deleteWorkoutTemplate,
} from "@/lib/api/endpoints/workout-templates";
import { formatDate } from "@/lib/utils/format";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function TemplatesPage() {
  const { t, locale } = useLocale();
  const query = useAsync("templates", useCallback(() => getWorkoutTemplates(), []));
  const templates = query.data ?? [];
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm(t("templates.confirmDelete"))) return;
    setBusyId(id);
    setActionError(null);
    try {
      await deleteWorkoutTemplate(id);
      query.mutate((prev) => (prev ?? []).filter((template) => template.id !== id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t("templates.deleteFailed"));
    } finally {
      setBusyId(null);
    }
  };

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          {t("templates.title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t("templates.subtitle")}</p>
      </div>

      {actionError && (
        <ErrorBanner
          message={actionError}
          onDismiss={() => setActionError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      {templates.length === 0 ? (
        <EmptyState message={t("templates.noneYet")} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">{t("common.name")}</th>
                <th className="px-6 py-3">{t("common.created")}</th>
                <th className="px-6 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                    {template.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {formatDate(template.created_at, locale)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === template.id}
                      onClick={() => handleDelete(template.id)}
                    >
                      {busyId === template.id ? t("common.working") : t("common.delete")}
                    </Button>
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
