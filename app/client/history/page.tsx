"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getClientSessions } from "@/lib/api/endpoints/client-sessions";
import type { WorkoutSession } from "@/lib/api/types";
import { formatDateTime, formatDuration } from "@/lib/utils/format";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  if (sessions.length === 0) {
    return <EmptyState message="No workout history yet. Start your first workout!" />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        Workout History
      </h1>

      <div className="space-y-2">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/client/history/${session.id}`}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
          >
            <div>
              <p className="font-medium text-zinc-900">
                {formatDateTime(session.started_at)}
              </p>
              {session.notes && (
                <p className="mt-1 text-sm text-zinc-500">{session.notes}</p>
              )}
            </div>
            <div className="text-sm text-zinc-500">
              {session.completed_at
                ? formatDuration(session.started_at, session.completed_at)
                : "In progress"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
