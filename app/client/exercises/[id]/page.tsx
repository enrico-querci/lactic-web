"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getExerciseHistory } from "@/lib/api/endpoints/client-exercises";
import type { SetLog } from "@/lib/api/types";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

export default function ExerciseHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = Number(params.id);

  const [history, setHistory] = useState<SetLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExerciseHistory(exerciseId)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [exerciseId]);

  if (loading) return <Loading />;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-zinc-500 hover:text-zinc-700"
      >
        &larr; Back
      </button>

      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        Exercise History
      </h1>

      {history.length === 0 ? (
        <EmptyState message="No history for this exercise yet" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Set</th>
                <th className="px-6 py-3">Weight (kg)</th>
                <th className="px-6 py-3">Reps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {history.map((setLog) => (
                <tr key={setLog.id}>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {setLog.position}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-900">
                    {setLog.weight_kg}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-900">
                    {setLog.reps}
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
