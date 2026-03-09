"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClientSession } from "@/lib/api/endpoints/client-sessions";
import type { WorkoutSessionExtended } from "@/lib/api/types";
import { formatDateTime, formatDuration } from "@/lib/utils/format";
import { Loading } from "@/components/ui/loading";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = Number(params.id);

  const [session, setSession] = useState<WorkoutSessionExtended | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientSession(sessionId)
      .then(setSession)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <Loading />;
  if (!session) return <div>Session not found</div>;

  return (
    <div>
      <button
        onClick={() => router.push("/client/history")}
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-700"
      >
        &larr; Back to history
      </button>

      <h1 className="mb-1 text-2xl font-bold text-zinc-900">
        Session Details
      </h1>
      <div className="mb-6 flex gap-4 text-sm text-zinc-500">
        <span>{formatDateTime(session.started_at)}</span>
        {session.completed_at && (
          <span>
            Duration: {formatDuration(session.started_at, session.completed_at)}
          </span>
        )}
      </div>
      {session.notes && (
        <p className="mb-6 text-sm italic text-zinc-500">{session.notes}</p>
      )}

      {session.exercise_logs.length === 0 ? (
        <p className="text-sm text-zinc-400">No exercises logged</p>
      ) : (
        <div className="space-y-4">
          {session.exercise_logs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">
                  Exercise #{log.workout_exercise_id}
                </span>
                {log.notes && (
                  <span className="text-xs italic text-zinc-400">
                    {log.notes}
                  </span>
                )}
              </div>

              {log.set_logs.length > 0 ? (
                <div className="space-y-1">
                  {log.set_logs
                    .sort((a, b) => a.position - b.position)
                    .map((setLog) => (
                      <div
                        key={setLog.id}
                        className="flex gap-4 text-sm text-zinc-600"
                      >
                        <span className="w-8 text-zinc-400">
                          Set {setLog.position}
                        </span>
                        <span>{setLog.weight_kg} kg</span>
                        <span>{setLog.reps} reps</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">No sets logged</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
