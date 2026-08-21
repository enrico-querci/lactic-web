"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProgram } from "@/lib/api/endpoints/programs";
import { createWeek, deleteWeek } from "@/lib/api/endpoints/weeks";
import {
  createWorkout,
  deleteWorkout,
  duplicateWorkout,
} from "@/lib/api/endpoints/workouts";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { WeekPanel } from "@/components/domain/week-panel";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function ProgramDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const programId = Number(params.id);

  const query = useAsync(
    String(programId),
    useCallback(() => getProgram(programId), [programId])
  );
  const program = query.data;
  const [mutating, setMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Each handler below applies the mutation's own response to `program`
  // via query.mutate() directly instead of calling query.reload(): reload()
  // used to run after every add/delete/duplicate and re-fetch the whole
  // program to show a change the response already described, doubling the
  // requests without ever showing that one was in flight.
  const runMutation = async (fn: () => Promise<void>) => {
    setMutating(true);
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t("program.actionFailed"));
    } finally {
      setMutating(false);
    }
  };

  // Every handler below is only reachable from JSX that already required
  // `program` to be non-null to render at all, so `current` here is never
  // actually null — the `!` reflects that, not an unchecked assumption.
  const handleAddWeek = () =>
    runMutation(async () => {
      if (!program) return;
      const nextPosition = program.weeks.length + 1;
      const week = await createWeek(programId, { position: nextPosition });
      query.mutate((p) => ({ ...p!, weeks: [...p!.weeks, { ...week, workouts: [] }] }));
    });

  const handleDeleteWeek = (weekId: number) =>
    runMutation(async () => {
      await deleteWeek(programId, weekId);
      query.mutate((p) => ({ ...p!, weeks: p!.weeks.filter((w) => w.id !== weekId) }));
    });

  const handleAddWorkout = (weekId: number, name: string, day: number) =>
    runMutation(async () => {
      const workout = await createWorkout(programId, weekId, { name, day });
      query.mutate((p) => ({
        ...p!,
        weeks: p!.weeks.map((w) =>
          w.id === weekId ? { ...w, workouts: [...w.workouts, workout] } : w
        ),
      }));
    });

  const handleDeleteWorkout = (weekId: number, workoutId: number) => {
    if (!confirm(t("program.confirmDeleteWorkout"))) return;
    return runMutation(async () => {
      await deleteWorkout(programId, weekId, workoutId);
      query.mutate((p) => ({
        ...p!,
        weeks: p!.weeks.map((w) =>
          w.id === weekId
            ? { ...w, workouts: w.workouts.filter((wk) => wk.id !== workoutId) }
            : w
        ),
      }));
    });
  };

  const handleDuplicateWorkout = (weekId: number, workoutId: number) =>
    runMutation(async () => {
      // Duplicate to same week, same day
      const workout = await duplicateWorkout(programId, weekId, workoutId, {
        target_week_id: weekId,
        day: 1,
      });
      query.mutate((p) => ({
        ...p!,
        weeks: p!.weeks.map((w) =>
          w.id === weekId ? { ...w, workouts: [...w.workouts, workout] } : w
        ),
      }));
    });

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );
  if (!program) return <div>{t("program.notFound")}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{program.name}</h1>
          {program.description && (
            <p className="mt-1 text-sm text-zinc-500">{program.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/coach/programs/${programId}/edit`}>
            <Button variant="secondary">{t("common.edit")}</Button>
          </Link>
          <Button onClick={handleAddWeek} disabled={mutating}>
            {mutating ? t("common.working") : t("program.addWeek")}
          </Button>
        </div>
      </div>

      {actionError && (
        <ErrorBanner
          message={actionError}
          onDismiss={() => setActionError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      {program.weeks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center text-zinc-400">
          <p>{t("program.noWeeksYet")}</p>
        </div>
      ) : (
        <div className={`space-y-6 transition-opacity ${mutating ? "opacity-60" : ""}`}>
          {program.weeks
            .sort((a, b) => a.position - b.position)
            .map((week) => (
              <WeekPanel
                key={week.id}
                week={week}
                programId={programId}
                onAddWorkout={handleAddWorkout}
                onDeleteWorkout={handleDeleteWorkout}
                onDuplicateWorkout={handleDuplicateWorkout}
                onDeleteWeek={handleDeleteWeek}
              />
            ))}
        </div>
      )}
    </div>
  );
}
