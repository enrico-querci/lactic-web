"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getExerciseHistory } from "@/lib/api/endpoints/client-exercises";
import { useAsync } from "@/lib/hooks/use-async";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

export default function ExerciseHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = Number(params.id);

  const { data, error, initial, reload } = useAsync(
    `exercise-history:${exerciseId}`,
    useCallback(() => getExerciseHistory(exerciseId), [exerciseId])
  );

  if (initial) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const history = data ?? [];

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
