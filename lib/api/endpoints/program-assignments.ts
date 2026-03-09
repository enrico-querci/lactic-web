import { get, post, patch, del } from "@/lib/api/client";
import type { ProgramAssignment } from "@/lib/api/types";

export function getProgramAssignments(params?: {
  client_id?: string;
  status?: string;
}) {
  return get<ProgramAssignment[]>("/coach/program_assignments", params);
}

export function getProgramAssignment(id: number) {
  return get<ProgramAssignment>(`/coach/program_assignments/${id}`);
}

export function createProgramAssignment(data: {
  program_id: number;
  client_id: number;
  start_date: string;
  notes?: string;
}) {
  return post<ProgramAssignment>("/coach/program_assignments", {
    program_assignment: data,
  });
}

export function updateProgramAssignment(
  id: number,
  data: { status?: string; notes?: string; start_date?: string }
) {
  return patch<ProgramAssignment>(`/coach/program_assignments/${id}`, {
    program_assignment: data,
  });
}

export function deleteProgramAssignment(id: number) {
  return del(`/coach/program_assignments/${id}`);
}
