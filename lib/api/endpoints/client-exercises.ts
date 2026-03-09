import { get } from "@/lib/api/client";
import type { Exercise, SetLog } from "@/lib/api/types";

export function getClientExercises(params?: {
  search?: string;
  muscle_group?: string;
}) {
  const queryParams: Record<string, string> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.muscle_group) queryParams.muscle_group = params.muscle_group;
  return get<Exercise[]>("/client/exercises", queryParams);
}

export function getExerciseHistory(exerciseId: number) {
  return get<SetLog[]>(`/client/exercises/${exerciseId}/history`);
}
