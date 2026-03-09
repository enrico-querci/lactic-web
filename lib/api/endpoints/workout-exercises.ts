import { get, post, patch, del } from "@/lib/api/client";
import type { WorkoutExercise } from "@/lib/api/types";

export interface WorkoutExerciseInput {
  exercise_id: number;
  position: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  rir?: number | null;
  weight?: number | null;
  notes?: string | null;
}

export function getWorkoutExercises(workoutId: number) {
  return get<WorkoutExercise[]>(`/coach/workouts/${workoutId}/workout_exercises`);
}

export function createWorkoutExercise(
  workoutId: number,
  data: WorkoutExerciseInput
) {
  return post<WorkoutExercise>(
    `/coach/workouts/${workoutId}/workout_exercises`,
    { workout_exercise: data }
  );
}

export function updateWorkoutExercise(
  workoutId: number,
  exerciseId: number,
  data: Partial<WorkoutExerciseInput>
) {
  return patch<WorkoutExercise>(
    `/coach/workouts/${workoutId}/workout_exercises/${exerciseId}`,
    { workout_exercise: data }
  );
}

export function deleteWorkoutExercise(workoutId: number, exerciseId: number) {
  return del(`/coach/workouts/${workoutId}/workout_exercises/${exerciseId}`);
}
