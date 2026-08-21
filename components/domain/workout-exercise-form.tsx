"use client";

import { useState } from "react";
import type { WorkoutExercise } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

interface WorkoutExerciseFormProps {
  initial?: WorkoutExercise;
  position: string;
  onSave: (data: {
    position: string;
    sets: number;
    reps: number;
    rest_seconds: number;
    rir: number | null;
    weight: number | null;
    notes: string | null;
  }) => void;
  onCancel: () => void;
}

export function WorkoutExerciseForm({
  initial,
  position,
  onSave,
  onCancel,
}: WorkoutExerciseFormProps) {
  const { t } = useLocale();
  const [sets, setSets] = useState(initial?.sets ?? 3);
  const [reps, setReps] = useState(initial?.reps ?? 10);
  const [restSeconds, setRestSeconds] = useState(initial?.rest_seconds ?? 90);
  const [rir, setRir] = useState<string>(
    initial?.rir != null ? String(initial.rir) : ""
  );
  const [weight, setWeight] = useState<string>(
    initial?.weight != null ? String(initial.weight) : ""
  );
  const [notes, setNotes] = useState(initial?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      position,
      sets,
      reps,
      rest_seconds: restSeconds,
      rir: rir ? Number(rir) : null,
      weight: weight ? Number(weight) : null,
      notes: notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t("workoutForm.sets")}
          </label>
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
            min={1}
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t("workoutForm.reps")}
          </label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
            min={1}
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t("workoutForm.restLabel")}
          </label>
          <input
            type="number"
            value={restSeconds}
            onChange={(e) => setRestSeconds(Number(e.target.value))}
            min={0}
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            RIR
          </label>
          <input
            type="number"
            value={rir}
            onChange={(e) => setRir(e.target.value)}
            min={0}
            placeholder="—"
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t("workoutForm.suggestedWeight")}
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min={0}
            step={0.5}
            placeholder="—"
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t("common.notes")}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("workoutForm.notesPlaceholder")}
            className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          {t("common.save")}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
