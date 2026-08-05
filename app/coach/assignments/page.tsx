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

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this assignment?")) return;
    await deleteProgramAssignment(id);
    query.reload();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateProgramAssignment(id, { status });
    query.reload();
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
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] || ""}`}
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
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
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
