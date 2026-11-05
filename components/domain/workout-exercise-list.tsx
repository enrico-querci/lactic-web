"use client";

import { useState } from "react";
import type { Exercise, WorkoutExercise } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/context";
import { displayMuscleGroup } from "@/lib/constants/muscle-groups";
import { ExercisePicker } from "@/components/domain/exercise-picker";
import {
  WorkoutExerciseForm,
  type WorkoutExerciseFormValues,
} from "@/components/domain/workout-exercise-form";
import { Button } from "@/components/ui/button";

interface WorkoutExerciseListProps {
  exercises: WorkoutExercise[];
  /** True while a mutation is in flight: dims the list and disables its actions. */
  busy: boolean;
  /** Shown instead of the list when there are no exercises. */
  emptyMessage?: string;
  /**
   * Each handler resolves to whether the change went through. The list closes
   * the picker or the edit form only on success, so a failure leaves the
   * input on screen next to the error the caller shows.
   */
  onAdd: (exercise: Exercise) => Promise<boolean>;
  onUpdate: (id: number, data: WorkoutExerciseFormValues) => Promise<boolean>;
  onRemove: (id: number) => Promise<boolean>;
}

/**
 * The exercises of a workout or of a workout template: the same rows, edit
 * form and exercise picker, since both are edited identically and the API
 * serves both in the same shape. The caller owns the data and the requests.
 */
export function WorkoutExerciseList({
  exercises,
  busy,
  emptyMessage,
  onAdd,
  onUpdate,
  onRemove,
}: WorkoutExerciseListProps) {
  const { t } = useLocale();
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAdd = async (exercise: Exercise) => {
    if (await onAdd(exercise)) setShowPicker(false);
  };

  const handleUpdate = async (id: number, data: WorkoutExerciseFormValues) => {
    if (await onUpdate(id, data)) setEditingId(null);
  };

  const handleRemove = async (id: number) => {
    if (!confirm(t("workoutDetail.confirmRemoveExercise"))) return;
    await onRemove(id);
  };

  const sorted = [...exercises].sort((a, b) => a.position.localeCompare(b.position));

  return (
    <div>
      {sorted.length === 0 && emptyMessage && !showPicker && (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-400">
          {emptyMessage}
        </p>
      )}

      <div className={`space-y-3 transition-opacity ${busy ? "opacity-60" : ""}`}>
        {sorted.map((we) => (
          <div key={we.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                  {we.position}
                </span>
                <span className="font-medium text-zinc-900">{we.exercise.name}</span>
                <span className="ml-2 text-xs text-zinc-400">
                  {displayMuscleGroup(we.exercise, t)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(editingId === we.id ? null : we.id)}
                  disabled={busy}
                  className="text-xs text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
                >
                  {editingId === we.id ? t("common.close") : t("common.edit")}
                </button>
                <button
                  onClick={() => handleRemove(we.id)}
                  disabled={busy}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  {t("common.remove")}
                </button>
              </div>
            </div>

            {editingId === we.id ? (
              <WorkoutExerciseForm
                initial={we}
                position={we.position}
                onSave={(data) => handleUpdate(we.id, data)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex gap-4 text-sm text-zinc-500">
                <span>
                  {we.sets} x {we.reps}
                </span>
                <span>{t("workout.restSeconds", { seconds: we.rest_seconds })}</span>
                {we.rir != null && <span>RIR {we.rir}</span>}
                {we.weight != null && <span>{we.weight}kg</span>}
                {we.notes && <span className="italic text-zinc-400">{we.notes}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        {showPicker ? (
          <ExercisePicker onSelect={handleAdd} onCancel={() => setShowPicker(false)} />
        ) : (
          <Button variant="secondary" onClick={() => setShowPicker(true)}>
            {t("workoutDetail.addExercise")}
          </Button>
        )}
      </div>
    </div>
  );
}
