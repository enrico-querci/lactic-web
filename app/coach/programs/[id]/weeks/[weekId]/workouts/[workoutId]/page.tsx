"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorkout } from "@/lib/api/endpoints/workouts";
import {
  createWorkoutExercise,
  updateWorkoutExercise,
  deleteWorkoutExercise,
} from "@/lib/api/endpoints/workout-exercises";
import type { Exercise } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { displayMuscleGroup } from "@/lib/constants/muscle-groups";
import { ExercisePicker } from "@/components/domain/exercise-picker";
import { WorkoutExerciseForm } from "@/components/domain/workout-exercise-form";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function WorkoutDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const programId = Number(params.id);
  const weekId = Number(params.weekId);
  const workoutId = Number(params.workoutId);

  const query = useAsync(
    String(workoutId),
    useCallback(() => getWorkout(programId, weekId, workoutId), [programId, weekId, workoutId])
  );
  const workout = query.data;
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mutating, setMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Each handler applies the mutation's own response to `workout` via
  // query.mutate() directly instead of calling query.reload(): a second full
  // GET after every add/update/remove was pure round-trip cost for data the
  // response already carried, and neither request gave any visible sign it
  // was happening.
  const runMutation = async (fn: () => Promise<void>) => {
    setMutating(true);
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t("program.actionFailed"));
    } finally {
      setMutating(false);
    }
  };

  // Every handler below is only reachable from JSX that already required
  // `workout` to be non-null to render at all, so `current` here is never
  // actually null — the `!` reflects that, not an unchecked assumption.
  const handleAddExercise = (exercise: Exercise) =>
    runMutation(async () => {
      if (!workout) return;
      const nextPosition = String.fromCharCode(
        65 + workout.workout_exercises.length
      ); // A, B, C...
      const workoutExercise = await createWorkoutExercise(workoutId, {
        exercise_id: exercise.id,
        position: nextPosition,
        sets: 3,
        reps: 10,
        rest_seconds: 90,
      });
      query.mutate((w) => ({
        ...w!,
        workout_exercises: [...w!.workout_exercises, workoutExercise],
      }));
      setShowPicker(false);
    });

  const handleUpdateExercise = (
    exerciseId: number,
    data: {
      position: string;
      sets: number;
      reps: number;
      rest_seconds: number;
      rir: number | null;
      weight: number | null;
      notes: string | null;
    }
  ) =>
    runMutation(async () => {
      const updated = await updateWorkoutExercise(workoutId, exerciseId, data);
      query.mutate((w) => ({
        ...w!,
        workout_exercises: w!.workout_exercises.map((we) =>
          we.id === exerciseId ? updated : we
        ),
      }));
      setEditingId(null);
    });

  const handleDeleteExercise = (exerciseId: number) => {
    if (!confirm(t("workoutDetail.confirmRemoveExercise"))) return;
    return runMutation(async () => {
      await deleteWorkoutExercise(workoutId, exerciseId);
      query.mutate((w) => ({
        ...w!,
        workout_exercises: w!.workout_exercises.filter((we) => we.id !== exerciseId),
      }));
    });
  };

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );
  if (!workout) return <div>{t("workout.notFound")}</div>;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push(`/coach/programs/${programId}`)}
          className="mb-2 text-sm text-zinc-500 hover:text-zinc-700"
        >
          &larr; {t("workoutDetail.backToProgram")}
        </button>
        <h1 className="text-2xl font-bold text-zinc-900">{workout.name}</h1>
        {Object.keys(workout.volume_sets).length > 0 && (
          <div className="mt-2 flex gap-2">
            {Object.entries(workout.volume_sets).map(([muscle, sets]) => (
              <span
                key={muscle}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
              >
                {muscle} {sets}
              </span>
            ))}
          </div>
        )}
      </div>

      {actionError && (
        <ErrorBanner
          message={actionError}
          onDismiss={() => setActionError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      <div className={`space-y-3 transition-opacity ${mutating ? "opacity-60" : ""}`}>
        {workout.workout_exercises
          .sort((a, b) => a.position.localeCompare(b.position))
          .map((we) => (
            <div
              key={we.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                    {we.position}
                  </span>
                  <span className="font-medium text-zinc-900">
                    {we.exercise.name}
                  </span>
                  <span className="ml-2 text-xs text-zinc-400">
                    {displayMuscleGroup(we.exercise, t)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingId(editingId === we.id ? null : we.id)
                    }
                    disabled={mutating}
                    className="text-xs text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
                  >
                    {editingId === we.id ? t("common.close") : t("common.edit")}
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(we.id)}
                    disabled={mutating}
                    className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    {t("common.remove")}
                  </button>
                </div>
              </div>

              {editingId === we.id ? (
                <WorkoutExerciseForm
                  initial={we}
                  position={we.position}
                  onSave={(data) => handleUpdateExercise(we.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex gap-4 text-sm text-zinc-500">
                  <span>
                    {we.sets} x {we.reps}
                  </span>
                  <span>{t("workout.restSeconds", { seconds: we.rest_seconds })}</span>
                  {we.rir != null && <span>RIR {we.rir}</span>}
                  {we.weight != null && <span>{we.weight}kg</span>}
                  {we.notes && (
                    <span className="italic text-zinc-400">{we.notes}</span>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>

      <div className="mt-4">
        {showPicker ? (
          <ExercisePicker
            onSelect={handleAddExercise}
            onCancel={() => setShowPicker(false)}
          />
        ) : (
          <Button variant="secondary" onClick={() => setShowPicker(true)}>
            {t("workoutDetail.addExercise")}
          </Button>
        )}
      </div>
    </div>
  );
}
