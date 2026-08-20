"use client";

import { useCallback, useState } from "react";
import {
  getWorkoutTemplates,
  deleteWorkoutTemplate,
} from "@/lib/api/endpoints/workout-templates";
import { formatDate } from "@/lib/utils/format";
import { useAsync } from "@/lib/hooks/use-async";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function TemplatesPage() {
  const query = useAsync("templates", useCallback(() => getWorkoutTemplates(), []));
  const templates = query.data ?? [];
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    setBusyId(id);
    setActionError(null);
    try {
      await deleteWorkoutTemplate(id);
      query.mutate((prev) => (prev ?? []).filter((t) => t.id !== id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not delete this template");
    } finally {
      setBusyId(null);
    }
  };

  if (query.initial) return <Loading />;
  if (query.error) return <ErrorState message={query.error} onRetry={query.reload} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          Workout Templates
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Save workouts as templates and apply them to other weeks.
        </p>
      </div>

      {actionError && (
        <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />
      )}

      {templates.length === 0 ? (
        <EmptyState message="No templates yet. Save a workout as a template from the program builder." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                    {template.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {formatDate(template.created_at)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === template.id}
                      onClick={() => handleDelete(template.id)}
                    >
                      {busyId === template.id ? "Working…" : "Delete"}
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
