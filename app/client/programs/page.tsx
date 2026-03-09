"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getClientPrograms } from "@/lib/api/endpoints/client-programs";
import type { ProgramAssignment } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/format";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-zinc-100 text-zinc-600",
  paused: "bg-yellow-100 text-yellow-700",
};

export default function ClientProgramsPage() {
  const [assignments, setAssignments] = useState<ProgramAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientPrograms()
      .then(setAssignments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  if (assignments.length === 0) {
    return <EmptyState message="No programs assigned yet. Ask your coach!" />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">My Programs</h1>

      <div className="space-y-3">
        {assignments.map((a) => (
          <Link
            key={a.id}
            href={`/client/programs/${a.program.id}`}
            className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-zinc-900">{a.program.name}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] || ""}`}
              >
                {a.status}
              </span>
            </div>
            {a.program.description && (
              <p className="mt-1 text-sm text-zinc-500">
                {a.program.description}
              </p>
            )}
            <p className="mt-2 text-xs text-zinc-400">
              Starts {formatDate(a.start_date)}
              {a.notes && ` · ${a.notes}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
