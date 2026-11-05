import { get, post, patch, del } from "@/lib/api/client";
import type {
  Workout,
  WorkoutTemplate,
  WorkoutTemplateExtended,
} from "@/lib/api/types";

export function getWorkoutTemplates() {
  return get<WorkoutTemplate[]>("/coach/workout_templates");
}

export function getWorkoutTemplate(id: number) {
  return get<WorkoutTemplateExtended>(`/coach/workout_templates/${id}`);
}

/** One exercise of a template as it is sent when saving. */
export interface TemplateExercisePayload {
  exercise_id: number;
  sets: number;
  reps: number;
  rest_seconds: number;
  rir: number | null;
  weight: number | null;
  notes: string | null;
}

/**
 * Three ways to start a template: with `source_workout_id`, as a copy of that
 * workout's exercises; with `workout_exercises`, holding that list; with
 * neither, empty. The name and exercises are written together or not at all.
 */
export function createWorkoutTemplate(data: {
  name: string;
  source_workout_id?: number;
  workout_exercises?: TemplateExercisePayload[];
}) {
  return post<WorkoutTemplate>("/coach/workout_templates", data);
}

/**
 * Each part is applied only when present, and together. `workout_exercises`
 * is the complete list as it should be after saving, not a change to it.
 */
export function updateWorkoutTemplate(
  id: number,
  data: { name?: string; workout_exercises?: TemplateExercisePayload[] }
) {
  return patch<WorkoutTemplate>(`/coach/workout_templates/${id}`, data);
}

export function deleteWorkoutTemplate(id: number) {
  return del(`/coach/workout_templates/${id}`);
}

/**
 * Adds the template's exercises to a week as a new workout. Every call is an
 * independent copy, so the same template can go on several days.
 */
export function applyWorkoutTemplate(
  id: number,
  data: { target_week_id: number; day: number }
) {
  return post<Workout>(`/coach/workout_templates/${id}/apply`, data);
}
