"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { getPrograms, deleteProgram } from "@/lib/api/endpoints/programs";
import { formatDate } from "@/lib/utils/format";
import { useAsync } from "@/lib/hooks/use-async";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function ProgramsPage() {
  const query = useAsync("programs", useCallback(() => getPrograms(), []));
  const programs = query.data ?? [];
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this program?")) return;
    setBusyId(id);
    setActionError(null);
    try {
      await deleteProgram(id);
      query.mutate((prev) => (prev ?? []).filter((p) => p.id !== id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not delete this program");
    } finally {
      setBusyId(null);
    }
  };

  if (query.initial) return <Loading />;
  if (query.error) return <ErrorState message={query.error} onRetry={query.reload} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Programs</h1>
        <Link href="/coach/programs/new">
          <Button>New Program</Button>
        </Link>
      </div>

      {actionError && (
        <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />
      )}

      {programs.length === 0 ? (
        <EmptyState message="No programs yet. Create your first one!" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
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
                    {formatDate(program.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/coach/programs/${program.id}/edit`}>
                      <Button variant="secondary" size="sm" className="mr-2">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === program.id}
                      onClick={() => handleDelete(program.id)}
                    >
                      {busyId === program.id ? "Working…" : "Delete"}
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
