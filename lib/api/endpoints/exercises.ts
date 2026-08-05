import { get, getPaged, post, patch, del } from "@/lib/api/client";
import type {
  Exercise,
  ExerciseDetail,
  ExerciseTaxonomy,
  Paged,
} from "@/lib/api/types";

export interface ExerciseFilters {
  search?: string;
  /** Stable taxonomy key, matching either muscle role. */
  muscle?: string;
  equipment?: string;
  category?: string;
  difficulty?: string;
  /** "true" shows only coach-owned exercises, "false" only the catalog. */
  custom?: string;
  /** Widens the list to include retired or non-assignable exercises. */
  include_unassignable?: string;
  page?: number;
  per_page?: number;
}

function toQuery(filters: ExerciseFilters): Record<string, string> {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    query[key] = String(value);
  }

  return query;
}

export function getExercises(filters: ExerciseFilters = {}): Promise<Paged<Exercise>> {
  return getPaged<Exercise>("/coach/exercises", toQuery(filters));
}

export function getExercise(id: number) {
  return get<ExerciseDetail>(`/coach/exercises/${id}`);
}

export function getExerciseTaxonomy() {
  return get<ExerciseTaxonomy>("/coach/exercise_taxonomy");
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
