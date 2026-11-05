import { post, patch, del } from "@/lib/api/client";
import type { WorkoutExercise } from "@/lib/api/types";
import type { WorkoutExerciseInput } from "@/lib/api/endpoints/workout-exercises";

/**
 * The exercises of a workout template. Same shape and verbs as a workout's
 * own (workout-exercises.ts); the differences are that `position` may be left
 * out, in which case the API uses the next free letter, and that an exercise
 * cannot be swapped on update — remove it and add another.
 */
export type TemplateExerciseInput = Omit<WorkoutExerciseInput, "position"> & {
  position?: string;
};

export function createTemplateExercise(templateId: number, data: TemplateExerciseInput) {
  return post<WorkoutExercise>(`/coach/workout_templates/${templateId}/workout_exercises`, {
    workout_exercise: data,
  });
}

export function updateTemplateExercise(
  templateId: number,
  exerciseId: number,
  data: Partial<Omit<WorkoutExerciseInput, "exercise_id">>
) {
  return patch<WorkoutExercise>(
    `/coach/workout_templates/${templateId}/workout_exercises/${exerciseId}`,
    { workout_exercise: data }
  );
}

export function deleteTemplateExercise(templateId: number, exerciseId: number) {
  return del(`/coach/workout_templates/${templateId}/workout_exercises/${exerciseId}`);
}
