import { get, post, patch, del } from "@/lib/api/client";
import type { ClientGoal, ClientLevel, ClientProfile } from "@/lib/api/types";

/** Only `name` is required; empty optional fields are sent as null. */
export interface ClientProfileInput {
  name: string;
  email: string | null;
  phone: string | null;
  level: ClientLevel | null;
  goal: ClientGoal | null;
  limitations: string | null;
  notes: string | null;
}

export function getClientProfiles() {
  return get<ClientProfile[]>("/coach/client_profiles");
}

export function getClientProfile(id: number) {
  return get<ClientProfile>(`/coach/client_profiles/${id}`);
}

export function createClientProfile(data: ClientProfileInput) {
  return post<ClientProfile>("/coach/client_profiles", data);
}

export function updateClientProfile(id: number, data: Partial<ClientProfileInput>) {
  return patch<ClientProfile>(`/coach/client_profiles/${id}`, data);
}

/** Only for someone who has not joined; a client is removed with removeClient. */
export function deleteClientProfile(id: number) {
  return del(`/coach/client_profiles/${id}`);
}
