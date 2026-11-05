import { get, post, del } from "@/lib/api/client";
import type { Workout, WorkoutTemplate } from "@/lib/api/types";

export function getWorkoutTemplates() {
  return get<WorkoutTemplate[]>("/coach/workout_templates");
}

export function createWorkoutTemplate(data: {
  name: string;
  source_workout_id: number;
}) {
  return post<WorkoutTemplate>("/coach/workout_templates", data);
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
