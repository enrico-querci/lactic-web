import { get, post } from "@/lib/api/client";
import type { Subscription } from "@/lib/api/types";

export function getSubscription() {
  return get<Subscription>("/coach/subscription");
}

// Called right after a purchase so the coach's plan/limit updates
// immediately, rather than waiting on RevenueCat webhook delivery.
export function syncSubscription() {
  return post<Subscription>("/coach/subscription/sync");
}
