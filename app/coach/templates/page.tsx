"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getWorkoutTemplates,
  createWorkoutTemplate,
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
  const router = useRouter();
  const query = useAsync("templates", useCallback(() => getWorkoutTemplates(), []));
  const templates = query.data ?? [];
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

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

  // A new template starts empty; the coach lands on its page to add exercises.
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setActionError(null);
    try {
      const template = await createWorkoutTemplate({ name });
      router.push(`/coach/templates/${template.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("templates.createFailed"));
      setCreating(false);
    }
  };

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-zinc-900">
            {t("templates.title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{t("templates.subtitle")}</p>
        </div>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)}>{t("templates.new")}</Button>
        )}
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("templates.namePlaceholder")}
            aria-label={t("templates.nameLabel")}
            autoFocus
            className="min-w-[14rem] flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          />
          <Button type="submit" size="sm" disabled={creating || !newName.trim()}>
            {creating ? t("common.working") : t("templates.create")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={creating}
            onClick={() => {
              setShowCreate(false);
              setNewName("");
            }}
          >
            {t("common.cancel")}
          </Button>
        </form>
      )}

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
                <th className="px-3 py-3 sm:px-6">{t("templates.exercises")}</th>
                <th className="hidden px-6 py-3 md:table-cell">{t("common.created")}</th>
                <th className="px-6 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                    <Link
                      href={`/coach/templates/${template.id}`}
                      className="hover:text-zinc-600 hover:underline"
                    >
                      {template.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-sm text-zinc-500 sm:px-6">
                    {template.exercise_count}
                  </td>
                  <td className="hidden px-6 py-3 text-sm text-zinc-500 md:table-cell">
                    {formatDate(template.created_at, locale)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/coach/templates/${template.id}`}>
                        <Button variant="secondary" size="sm">
                          {t("common.edit")}
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busyId === template.id}
                        onClick={() => handleDelete(template.id)}
                      >
                        {busyId === template.id ? t("common.working") : t("common.delete")}
                      </Button>
                    </div>
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
