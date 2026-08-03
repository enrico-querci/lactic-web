import { get, post, del } from "@/lib/api/client";
import type {
  ClientInvitation,
  User,
  WorkoutSession,
} from "@/lib/api/types";

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

export function getClientInvitations() {
  return get<ClientInvitation[]>("/coach/client_invitations");
}

export function inviteClient(email: string) {
  return post<ClientInvitation>("/coach/client_invitations", { email });
}

export function resendClientInvitation(id: number) {
  return post<ClientInvitation>(`/coach/client_invitations/${id}/resend`);
}

export function revokeClientInvitation(id: number) {
  return del(`/coach/client_invitations/${id}`);
}

export function getClientInvitation(token: string) {
  return get<ClientInvitation>(`/client_invitations/${encodeURIComponent(token)}`);
}

export function acceptClientInvitation(token: string) {
  return post<User>(
    `/client_invitations/${encodeURIComponent(token)}/accept`
  );
}
