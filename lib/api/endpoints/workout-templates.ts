import { get, post, del } from "@/lib/api/client";
import type { WorkoutTemplate } from "@/lib/api/types";

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

export function applyWorkoutTemplate(
  id: number,
  data: { week_id: number; day: number }
) {
  return post<void>(`/coach/workout_templates/${id}/apply`, data);
}
