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

/**
 * With `source_workout_id` the template starts as a copy of that workout's
 * exercises; without it, it starts empty.
 */
export function createWorkoutTemplate(data: {
  name: string;
  source_workout_id?: number;
}) {
  return post<WorkoutTemplate>("/coach/workout_templates", data);
}

export function updateWorkoutTemplate(id: number, data: { name: string }) {
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
