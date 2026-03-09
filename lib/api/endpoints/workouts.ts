import { get, post, patch, del } from "@/lib/api/client";
import type { Workout, WorkoutExtended } from "@/lib/api/types";

export function getWorkouts(programId: number, weekId: number) {
  return get<Workout[]>(
    `/coach/programs/${programId}/weeks/${weekId}/workouts`
  );
}

export function getWorkout(
  programId: number,
  weekId: number,
  workoutId: number
) {
  return get<WorkoutExtended>(
    `/coach/programs/${programId}/weeks/${weekId}/workouts/${workoutId}`
  );
}

export function createWorkout(
  programId: number,
  weekId: number,
  data: { name: string; day: number }
) {
  return post<Workout>(
    `/coach/programs/${programId}/weeks/${weekId}/workouts`,
    { workout: data }
  );
}

export function updateWorkout(
  programId: number,
  weekId: number,
  workoutId: number,
  data: { name?: string; day?: number }
) {
  return patch<Workout>(
    `/coach/programs/${programId}/weeks/${weekId}/workouts/${workoutId}`,
    { workout: data }
  );
}

export function deleteWorkout(
  programId: number,
  weekId: number,
  workoutId: number
) {
  return del(
    `/coach/programs/${programId}/weeks/${weekId}/workouts/${workoutId}`
  );
}

export function duplicateWorkout(
  programId: number,
  weekId: number,
  workoutId: number,
  data: { target_week_id: number; day: number }
) {
  return post<Workout>(
    `/coach/programs/${programId}/weeks/${weekId}/workouts/${workoutId}/duplicate`,
    { workout: data }
  );
}
