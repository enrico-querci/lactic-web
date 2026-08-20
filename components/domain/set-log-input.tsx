"use client";

import { useState } from "react";
import type { SetLog } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/context";

interface SetLogInputProps {
  setLog: SetLog;
  onUpdate: (id: number, data: { weight_kg?: number; reps?: number }) => void;
  onDelete: (id: number) => void;
}

export function SetLogInput({ setLog, onUpdate, onDelete }: SetLogInputProps) {
  const { t } = useLocale();
  const [weightKg, setWeightKg] = useState(String(setLog.weight_kg));
  const [reps, setReps] = useState(String(setLog.reps));

  const handleBlurWeight = () => {
    const val = parseFloat(weightKg);
    if (!isNaN(val) && val !== setLog.weight_kg) {
      onUpdate(setLog.id, { weight_kg: val });
    }
  };

  const handleBlurReps = () => {
    const val = parseInt(reps, 10);
    if (!isNaN(val) && val !== setLog.reps) {
      onUpdate(setLog.id, { reps: val });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-center text-xs font-medium text-zinc-400">
        {setLog.position}
      </span>
      <input
        type="number"
        value={weightKg}
        onChange={(e) => setWeightKg(e.target.value)}
        onBlur={handleBlurWeight}
        step={0.5}
        min={0}
        className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-center text-sm"
        placeholder="kg"
      />
      <span className="text-xs text-zinc-400">kg</span>
      <input
        type="number"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={handleBlurReps}
        min={0}
        className="w-16 rounded-md border border-zinc-300 px-2 py-1.5 text-center text-sm"
        placeholder={t("common.reps")}
      />
      <span className="text-xs text-zinc-400">{t("common.reps")}</span>
      <button
        onClick={() => onDelete(setLog.id)}
        className="ml-1 text-xs text-red-400 hover:text-red-600"
      >
        &times;
      </button>
    </div>
  );
}
