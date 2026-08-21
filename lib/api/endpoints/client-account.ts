import { del } from "@/lib/api/client";

export function deleteAccount() {
  return del("/client/account");
}
