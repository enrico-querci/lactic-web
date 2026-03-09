import Link from "next/link";
import type { Workout } from "@/lib/api/types";

interface WorkoutCardProps {
  workout: Workout;
  programId: number;
  weekId: number;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
}

export function WorkoutCard({
  workout,
  programId,
  weekId,
  onDelete,
  onDuplicate,
}: WorkoutCardProps) {
  const volumeEntries = Object.entries(workout.volume_sets);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-2 flex items-start justify-between">
        <Link
          href={`/coach/programs/${programId}/weeks/${weekId}/workouts/${workout.id}`}
          className="font-medium text-zinc-900 hover:text-zinc-600"
        >
          {workout.name}
        </Link>
        <div className="flex gap-1">
          <button
            onClick={() => onDuplicate(workout.id)}
            className="rounded p-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            title="Duplicate"
          >
            Copy
          </button>
          <button
            onClick={() => onDelete(workout.id)}
            className="rounded p-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
            title="Delete"
          >
            Del
          </button>
        </div>
      </div>

      {volumeEntries.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {volumeEntries.map(([muscle, sets]) => (
            <span
              key={muscle}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
            >
              {muscle} {sets}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
