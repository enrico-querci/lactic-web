import { get } from "@/lib/api/client";
import type { ProgramAssignment, ProgramExtended } from "@/lib/api/types";

export function getClientPrograms() {
  return get<ProgramAssignment[]>("/client/programs");
}

export function getClientProgram(id: number) {
  return get<ProgramExtended>(`/client/programs/${id}`);
}
