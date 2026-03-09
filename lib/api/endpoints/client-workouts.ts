import { get } from "@/lib/api/client";
import type { WorkoutExtended } from "@/lib/api/types";

export function getClientWorkout(id: number) {
  return get<WorkoutExtended>(`/client/workouts/${id}`);
}
