import type { ClientProfile } from "@/lib/api/types";
import type { MessageKey } from "@/lib/i18n/messages/en";

export type ClientStatus = ClientProfile["status"];

export const CLIENT_STATUS_KEY: Record<ClientStatus, MessageKey> = {
  active: "clients.status.active",
  invited: "clients.status.invited",
  prepared: "clients.status.prepared",
};

export const CLIENT_STATUS_NOTE_KEY: Record<ClientStatus, MessageKey> = {
  active: "clients.statusNote.active",
  invited: "clients.statusNote.invited",
  prepared: "clients.statusNote.prepared",
};

export const CLIENT_STATUS_STYLE: Record<ClientStatus, string> = {
  active: "bg-emerald-50 text-emerald-700",
  invited: "bg-blue-50 text-blue-700",
  prepared: "bg-zinc-100 text-zinc-600",
};
