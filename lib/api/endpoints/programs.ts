import { get, post, patch, del } from "@/lib/api/client";
import type { Program, ProgramExtended } from "@/lib/api/types";

export function getPrograms() {
  return get<Program[]>("/coach/programs");
}

export function getProgram(id: number) {
  return get<ProgramExtended>(`/coach/programs/${id}`);
}

export function createProgram(data: { name: string; description?: string }) {
  return post<Program>("/coach/programs", { program: data });
}

export function updateProgram(
  id: number,
  data: { name?: string; description?: string }
) {
  return patch<Program>(`/coach/programs/${id}`, { program: data });
}

export function deleteProgram(id: number) {
  return del(`/coach/programs/${id}`);
}
