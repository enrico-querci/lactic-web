"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProgram } from "@/lib/api/endpoints/programs";
import { createWeek, deleteWeek } from "@/lib/api/endpoints/weeks";
import {
  createWorkout,
  deleteWorkout,
  duplicateWorkout,
} from "@/lib/api/endpoints/workouts";
import type { ProgramExtended } from "@/lib/api/types";
import { WeekPanel } from "@/components/domain/week-panel";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export default function ProgramDetailPage() {
  const params = useParams();
  const programId = Number(params.id);

  const [program, setProgram] = useState<ProgramExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(() => {
    getProgram(programId)
      .then(setProgram)
      .finally(() => setLoading(false));
  }, [programId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Each handler below applies the mutation's own response to `program`
  // directly instead of calling reload(): reload() used to run after every
  // add/delete/duplicate and re-fetch the whole program to show a change the
  // response already described, doubling the requests without ever showing
  // that one was in flight.
  const runMutation = async (fn: () => Promise<void>) => {
    setMutating(true);
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "That action failed");
    } finally {
      setMutating(false);
    }
  };

  const handleAddWeek = () =>
    runMutation(async () => {
      if (!program) return;
      const nextPosition = program.weeks.length + 1;
      const week = await createWeek(programId, { position: nextPosition });
      setProgram((p) =>
        p ? { ...p, weeks: [...p.weeks, { ...week, workouts: [] }] } : p
      );
    });

  const handleDeleteWeek = (weekId: number) =>
    runMutation(async () => {
      await deleteWeek(programId, weekId);
      setProgram((p) =>
        p ? { ...p, weeks: p.weeks.filter((w) => w.id !== weekId) } : p
      );
    });

  const handleAddWorkout = (weekId: number, name: string, day: number) =>
    runMutation(async () => {
      const workout = await createWorkout(programId, weekId, { name, day });
      setProgram((p) =>
        p
          ? {
              ...p,
              weeks: p.weeks.map((w) =>
                w.id === weekId
                  ? { ...w, workouts: [...w.workouts, workout] }
                  : w
              ),
            }
          : p
      );
    });

  const handleDeleteWorkout = (weekId: number, workoutId: number) => {
    if (!confirm("Delete this workout?")) return;
    return runMutation(async () => {
      await deleteWorkout(programId, weekId, workoutId);
      setProgram((p) =>
        p
          ? {
              ...p,
              weeks: p.weeks.map((w) =>
                w.id === weekId
                  ? { ...w, workouts: w.workouts.filter((wk) => wk.id !== workoutId) }
                  : w
              ),
            }
          : p
      );
    });
  };

  const handleDuplicateWorkout = (weekId: number, workoutId: number) =>
    runMutation(async () => {
      // Duplicate to same week, same day
      const workout = await duplicateWorkout(programId, weekId, workoutId, {
        target_week_id: weekId,
        day: 1,
      });
      setProgram((p) =>
        p
          ? {
              ...p,
              weeks: p.weeks.map((w) =>
                w.id === weekId
                  ? { ...w, workouts: [...w.workouts, workout] }
                  : w
              ),
            }
          : p
      );
    });

  if (loading) return <Loading />;
  if (!program) return <div>Program not found</div>;

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
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button onClick={handleAddWeek} disabled={mutating}>
            {mutating ? "Working…" : "+ Add Week"}
          </Button>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium hover:bg-red-50"
          >
            Dismiss
          </button>
        </div>
      )}

      {program.weeks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center text-zinc-400">
          <p>No weeks yet. Add your first week to start building.</p>
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
