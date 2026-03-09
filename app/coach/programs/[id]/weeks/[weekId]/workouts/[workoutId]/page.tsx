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

  const reload = useCallback(() => {
    getWorkout(programId, weekId, workoutId)
      .then(setWorkout)
      .finally(() => setLoading(false));
  }, [programId, weekId, workoutId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleAddExercise = async (exercise: Exercise) => {
    if (!workout) return;
    const nextPosition = String.fromCharCode(
      65 + workout.workout_exercises.length
    ); // A, B, C...
    await createWorkoutExercise(workoutId, {
      exercise_id: exercise.id,
      position: nextPosition,
      sets: 3,
      reps: 10,
      rest_seconds: 90,
    });
    setShowPicker(false);
    reload();
  };

  const handleUpdateExercise = async (
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
  ) => {
    await updateWorkoutExercise(workoutId, exerciseId, data);
    setEditingId(null);
    reload();
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (!confirm("Remove this exercise?")) return;
    await deleteWorkoutExercise(workoutId, exerciseId);
    reload();
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

      <div className="space-y-3">
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
                    className="text-xs text-zinc-500 hover:text-zinc-700"
                  >
                    {editingId === we.id ? "Close" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(we.id)}
                    className="text-xs text-red-400 hover:text-red-600"
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
