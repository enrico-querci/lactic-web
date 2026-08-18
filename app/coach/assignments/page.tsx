"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  getProgramAssignments,
  deleteProgramAssignment,
  updateProgramAssignment,
} from "@/lib/api/endpoints/program-assignments";
import { formatDate } from "@/lib/utils/format";
import { useAsync } from "@/lib/hooks/use-async";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-zinc-100 text-zinc-600",
  paused: "bg-yellow-100 text-yellow-700",
};

export default function AssignmentsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Uses the shared hook so loading is derived rather than set synchronously
  // inside an effect, which React's set-state-in-effect rule rejects.
  const query = useAsync(
    statusFilter,
    useCallback(
      () => getProgramAssignments(statusFilter ? { status: statusFilter } : {}),
      [statusFilter]
    )
  );

  const assignments = query.data ?? [];
  const loading = query.initial;

  // Both handlers apply the mutation's own response to the list already in
  // hand instead of calling query.reload(): a status change or delete used
  // to fire the PATCH/DELETE and then a second GET to see its effect, and
  // neither request showed any feedback, so a slow network read as a
  // dropped click rather than a click that worked.
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this assignment?")) return;
    setBusyId(id);
    setActionError(null);
    try {
      await deleteProgramAssignment(id);
      query.mutate((current) => (current ?? []).filter((a) => a.id !== id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not delete this assignment");
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      const updated = await updateProgramAssignment(id, { status });
      query.mutate((current) =>
        (current ?? []).map((a) => (a.id === id ? updated : a))
      );
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not update this assignment");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Assignments</h1>
        <Link href="/coach/assignments/new">
          <Button>New Assignment</Button>
        </Link>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium hover:bg-red-50"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : assignments.length === 0 ? (
        <EmptyState message="No assignments found" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Program</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                    {a.program.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {a.client.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {formatDate(a.start_date)}
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={a.status}
                      onChange={(e) =>
                        handleStatusChange(a.id, e.target.value)
                      }
                      disabled={busyId === a.id}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${STATUS_COLORS[a.status] || ""}`}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === a.id}
                      onClick={() => handleDelete(a.id)}
                    >
                      {busyId === a.id ? "Working…" : "Delete"}
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
