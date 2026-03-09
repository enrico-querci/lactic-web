import { get, del } from "@/lib/api/client";
import type { User, WorkoutSession } from "@/lib/api/types";

export function getClients() {
  return get<User[]>("/coach/clients");
}

export function getClient(id: number) {
  return get<User>(`/coach/clients/${id}`);
}

export function removeClient(id: number) {
  return del(`/coach/clients/${id}`);
}

export function getClientProgress(clientId: number) {
  return get<WorkoutSession[]>(`/coach/clients/${clientId}/progress`);
}
