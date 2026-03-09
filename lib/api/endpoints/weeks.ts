import { get, post, patch, del } from "@/lib/api/client";
import type { Week, WeekExtended } from "@/lib/api/types";

export function getWeeks(programId: number) {
  return get<WeekExtended[]>(`/coach/programs/${programId}/weeks`);
}

export function getWeek(programId: number, weekId: number) {
  return get<WeekExtended>(`/coach/programs/${programId}/weeks/${weekId}`);
}

export function createWeek(programId: number, data: { position: number }) {
  return post<Week>(`/coach/programs/${programId}/weeks`, { week: data });
}

export function updateWeek(
  programId: number,
  weekId: number,
  data: { position: number }
) {
  return patch<Week>(`/coach/programs/${programId}/weeks/${weekId}`, {
    week: data,
  });
}

export function deleteWeek(programId: number, weekId: number) {
  return del(`/coach/programs/${programId}/weeks/${weekId}`);
}
