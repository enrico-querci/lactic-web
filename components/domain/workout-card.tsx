"use client";

import Link from "next/link";
import type { Workout } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/context";

interface WorkoutCardProps {
  workout: Workout;
  programId: number;
  weekId: number;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onSaveAsTemplate: (workout: Workout) => void;
}

export function WorkoutCard({
  workout,
  programId,
  weekId,
  onDelete,
  onDuplicate,
  onSaveAsTemplate,
}: WorkoutCardProps) {
  const { t } = useLocale();
  const volumeEntries = Object.entries(workout.volume_sets);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      {/* The name gets the full card width and the actions wrap on a row of
          their own: at lg: the week is seven equal columns, where a
          side-by-side name and three buttons overflowed the card. */}
      <div className="mb-2">
        <Link
          href={`/coach/programs/${programId}/weeks/${weekId}/workouts/${workout.id}`}
          className="block break-words font-medium text-zinc-900 hover:text-zinc-600"
        >
          {workout.name}
        </Link>
        <div className="mt-1 flex flex-wrap gap-1">
          <button
            onClick={() => onDuplicate(workout.id)}
            className="rounded p-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            title={t("common.duplicate")}
          >
            {t("workoutCard.copy")}
          </button>
          <button
            onClick={() => onSaveAsTemplate(workout)}
            className="rounded p-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            title={t("workoutCard.saveAsTemplate")}
          >
            {t("workoutCard.template")}
          </button>
          <button
            onClick={() => onDelete(workout.id)}
            className="rounded p-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
            title={t("common.delete")}
          >
            {t("workoutCard.del")}
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
