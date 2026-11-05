import { get } from "@/lib/api/client";
import type { CoachDashboard } from "@/lib/api/types";

export function getCoachDashboard() {
  return get<CoachDashboard>("/coach/dashboard");
}
