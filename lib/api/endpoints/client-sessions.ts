import { get, post, patch } from "@/lib/api/client";
import type { WorkoutSession, WorkoutSessionExtended } from "@/lib/api/types";

export function getClientSessions() {
  return get<WorkoutSession[]>("/client/workout_sessions");
}

export function getClientSession(id: number) {
  return get<WorkoutSessionExtended>(`/client/workout_sessions/${id}`);
}

export function createClientSession(data: {
  workout_id: number;
  program_assignment_id: number;
  started_at: string;
}) {
  return post<WorkoutSession>("/client/workout_sessions", {
    workout_session: data,
  });
}

export function updateClientSession(
  id: number,
  data: { completed_at?: string; notes?: string }
) {
  return patch<WorkoutSession>(`/client/workout_sessions/${id}`, {
    workout_session: data,
  });
}
