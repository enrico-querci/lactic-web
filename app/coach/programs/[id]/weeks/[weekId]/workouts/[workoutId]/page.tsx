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
import { WorkoutExerciseList } from "@/components/domain/workout-exercise-list";
import type { WorkoutExerciseFormValues } from "@/components/domain/workout-exercise-form";
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
  const [mutating, setMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Each handler applies the mutation's own response to `workout` via
  // query.mutate() directly instead of calling query.reload(): a second full
  // GET after every add/update/remove was pure round-trip cost for data the
  // response already carried, and neither request gave any visible sign it
  // was happening. Resolves to whether the mutation succeeded, which the
  // exercise list uses to decide whether to close its picker or edit form.
  const runMutation = async (fn: () => Promise<void>): Promise<boolean> => {
    setMutating(true);
    setActionError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t("program.actionFailed"));
      return false;
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
    });

  const handleUpdateExercise = (exerciseId: number, data: WorkoutExerciseFormValues) =>
    runMutation(async () => {
      const updated = await updateWorkoutExercise(workoutId, exerciseId, data);
      query.mutate((w) => ({
        ...w!,
        workout_exercises: w!.workout_exercises.map((we) =>
          we.id === exerciseId ? updated : we
        ),
      }));
    });

  const handleRemoveExercise = (exerciseId: number) =>
    runMutation(async () => {
      await deleteWorkoutExercise(workoutId, exerciseId);
      query.mutate((w) => ({
        ...w!,
        workout_exercises: w!.workout_exercises.filter((we) => we.id !== exerciseId),
      }));
    });

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

      <WorkoutExerciseList
        exercises={workout.workout_exercises}
        busy={mutating}
        onAdd={handleAddExercise}
        onUpdate={handleUpdateExercise}
        onRemove={handleRemoveExercise}
      />
    </div>
  );
}
