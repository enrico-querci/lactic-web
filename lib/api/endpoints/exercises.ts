import { get, post, patch, del } from "@/lib/api/client";
import type { Exercise } from "@/lib/api/types";

export function getExercises(params?: {
  search?: string;
  muscle_group?: string;
}) {
  const queryParams: Record<string, string> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.muscle_group) queryParams.muscle_group = params.muscle_group;
  return get<Exercise[]>("/coach/exercises", queryParams);
}

export function createExercise(data: {
  name: string;
  muscle_group: string;
  video_url?: string;
  thumbnail_url?: string;
}) {
  return post<Exercise>("/coach/exercises", { exercise: data });
}

export function updateExercise(
  id: number,
  data: {
    name?: string;
    muscle_group?: string;
    video_url?: string;
    thumbnail_url?: string;
  }
) {
  return patch<Exercise>(`/coach/exercises/${id}`, { exercise: data });
}

export function deleteExercise(id: number) {
  return del(`/coach/exercises/${id}`);
}
