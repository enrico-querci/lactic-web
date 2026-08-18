"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorkout } from "@/lib/api/endpoints/workouts";
import {
  createWorkoutExercise,
  updateWorkoutExercise,
  deleteWorkoutExercise,
} from "@/lib/api/endpoints/workout-exercises";
import type { WorkoutExtended, Exercise } from "@/lib/api/types";
import { ExercisePicker } from "@/components/domain/exercise-picker";
import { WorkoutExerciseForm } from "@/components/domain/workout-exercise-form";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = Number(params.id);
  const weekId = Number(params.weekId);
  const workoutId = Number(params.workoutId);

  const [workout, setWorkout] = useState<WorkoutExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mutating, setMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(() => {
    getWorkout(programId, weekId, workoutId)
      .then(setWorkout)
      .finally(() => setLoading(false));
  }, [programId, weekId, workoutId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Each handler applies the mutation's own response to `workout` directly
  // instead of calling reload(): a second full GET after every add/update/
  // remove was pure round-trip cost for data the response already carried,
  // and neither request gave any visible sign it was happening.
  const runMutation = async (fn: () => Promise<void>) => {
    setMutating(true);
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "That action failed");
    } finally {
      setMutating(false);
    }
  };

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
      setWorkout((w) =>
        w
          ? { ...w, workout_exercises: [...w.workout_exercises, workoutExercise] }
          : w
      );
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
      setWorkout((w) =>
        w
          ? {
              ...w,
              workout_exercises: w.workout_exercises.map((we) =>
                we.id === exerciseId ? updated : we
              ),
            }
          : w
      );
      setEditingId(null);
    });

  const handleDeleteExercise = (exerciseId: number) => {
    if (!confirm("Remove this exercise?")) return;
    return runMutation(async () => {
      await deleteWorkoutExercise(workoutId, exerciseId);
      setWorkout((w) =>
        w
          ? {
              ...w,
              workout_exercises: w.workout_exercises.filter(
                (we) => we.id !== exerciseId
              ),
            }
          : w
      );
    });
  };

  if (loading) return <Loading />;
  if (!workout) return <div>Workout not found</div>;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push(`/coach/programs/${programId}`)}
          className="mb-2 text-sm text-zinc-500 hover:text-zinc-700"
        >
          &larr; Back to program
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
                    {we.exercise.muscle_group}
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
                    {editingId === we.id ? "Close" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(we.id)}
                    disabled={mutating}
                    className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    Remove
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
                  <span>Rest {we.rest_seconds}s</span>
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
            + Add Exercise
          </Button>
        )}
      </div>
    </div>
  );
}
