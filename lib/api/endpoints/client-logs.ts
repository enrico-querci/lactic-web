import { post, patch, del } from "@/lib/api/client";
import type { ExerciseLog, SetLog } from "@/lib/api/types";

export function createExerciseLog(data: {
  workout_session_id: number;
  workout_exercise_id: number;
  notes?: string;
}) {
  return post<ExerciseLog>("/client/exercise_logs", { exercise_log: data });
}

export function updateExerciseLog(
  id: number,
  data: { notes?: string; photo_url?: string }
) {
  return patch<ExerciseLog>(`/client/exercise_logs/${id}`, {
    exercise_log: data,
  });
}

export function createSetLog(data: {
  exercise_log_id: number;
  position: number;
  weight_kg: number;
  reps: number;
}) {
  return post<SetLog>("/client/set_logs", { set_log: data });
}

export function updateSetLog(
  id: number,
  data: { weight_kg?: number; reps?: number }
) {
  return patch<SetLog>(`/client/set_logs/${id}`, { set_log: data });
}

export function deleteSetLog(id: number) {
  return del(`/client/set_logs/${id}`);
}
