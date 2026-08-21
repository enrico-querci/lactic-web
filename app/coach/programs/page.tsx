"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { getPrograms, deleteProgram } from "@/lib/api/endpoints/programs";
import { formatDate } from "@/lib/utils/format";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function ProgramsPage() {
  const { t, locale } = useLocale();
  const query = useAsync("programs", useCallback(() => getPrograms(), []));
  const programs = query.data ?? [];
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm(t("program.confirmDelete"))) return;
    setBusyId(id);
    setActionError(null);
    try {
      await deleteProgram(id);
      query.mutate((prev) => (prev ?? []).filter((p) => p.id !== id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t("program.deleteFailed"));
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">{t("nav.programs")}</h1>
        <Link href="/coach/programs/new">
          <Button>{t("program.newProgram")}</Button>
        </Link>
      </div>

      {actionError && (
        <ErrorBanner
          message={actionError}
          onDismiss={() => setActionError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      {programs.length === 0 ? (
        <EmptyState message={t("program.noneYet")} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">{t("common.name")}</th>
                <th className="px-6 py-3">{t("common.description")}</th>
                <th className="px-6 py-3">{t("common.created")}</th>
                <th className="px-6 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/coach/programs/${program.id}`}
                      className="font-medium text-zinc-900 hover:text-zinc-600"
                    >
                      {program.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {program.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {formatDate(program.created_at, locale)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/coach/programs/${program.id}/edit`}>
                      <Button variant="secondary" size="sm" className="mr-2">
                        {t("common.edit")}
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === program.id}
                      onClick={() => handleDelete(program.id)}
                    >
                      {busyId === program.id ? t("common.working") : t("common.delete")}
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
