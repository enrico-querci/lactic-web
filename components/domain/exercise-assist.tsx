"use client";

import { useCallback, useState } from "react";
import { getExerciseHistory } from "@/lib/api/endpoints/client-exercises";
import type { Exercise } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { ExerciseAnimation } from "@/components/domain/exercise-animation";

interface ExerciseAssistProps {
  exercise: Exercise;
}

/**
 * The two things a trainee mid-set actually wants: what they lifted last time,
 * and what the movement looks like.
 *
 * Prior performance loads immediately — it informs the very first set, so it is
 * useless if it arrives late, and it costs one request to our own API.
 *
 * The demo is behind a toggle and mounts nothing until opened. Each animation
 * is a request against the provider's monthly quota, and rendering one per
 * exercise on load would spend a workout's worth of quota on images nobody
 * looked at.
 */
export function ExerciseAssist({ exercise }: ExerciseAssistProps) {
  const { t } = useLocale();
  const [showDemo, setShowDemo] = useState(false);

  const { data: history, error } = useAsync(
    `exercise-history:${exercise.id}`,
    useCallback(() => getExerciseHistory(exercise.id), [exercise.id])
  );

  // The API returns sets most-recent-first, so the head is the last thing
  // performed. weight_kg arrives as a decimal string ("60.0") despite the
  // declared number type, so it is coerced rather than trusted.
  const last = history?.[0];
  const lastWeight = last ? Number(last.weight_kg) : null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {last && Number.isFinite(lastWeight) ? (
        <span className="text-zinc-500">
          {t("exercise.lastTime")}{" "}
          <span className="font-medium text-zinc-700">
            {lastWeight}kg × {last.reps}
          </span>
        </span>
      ) : error ? (
        // Distinct from "First time doing this" on purpose: that reads as
        // "you've never done this," which is false and actively misleading
        // when the real story is "we couldn't check." A trainee mid-set who
        // sees the wrong one has no way to tell the difference.
        <span className="text-zinc-400">{t("exercise.lastTimeFailed")}</span>
      ) : (
        <span className="text-zinc-400">{t("exercise.firstTime")}</span>
      )}

      {exercise.has_animation && (
        <button
          type="button"
          onClick={() => setShowDemo((v) => !v)}
          className="text-zinc-500 underline underline-offset-2 hover:text-zinc-700"
          aria-expanded={showDemo}
        >
          {showDemo ? t("exercise.hideDemo") : t("exercise.showDemo")}
        </button>
      )}

      {showDemo && (
        <div className="mt-2 w-full">
          <ExerciseAnimation
            animationUrl={exercise.animation_url}
            alt={t("exercise.demonstrationAlt", { name: exercise.name })}
          />
        </div>
      )}
    </div>
  );
}
