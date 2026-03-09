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

  const reload = useCallback(() => {
    getProgram(programId)
      .then(setProgram)
      .finally(() => setLoading(false));
  }, [programId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleAddWeek = async () => {
    if (!program) return;
    const nextPosition = program.weeks.length + 1;
    await createWeek(programId, { position: nextPosition });
    reload();
  };

  const handleDeleteWeek = async (weekId: number) => {
    await deleteWeek(programId, weekId);
    reload();
  };

  const handleAddWorkout = async (
    weekId: number,
    name: string,
    day: number
  ) => {
    await createWorkout(programId, weekId, { name, day });
    reload();
  };

  const handleDeleteWorkout = async (weekId: number, workoutId: number) => {
    if (!confirm("Delete this workout?")) return;
    await deleteWorkout(programId, weekId, workoutId);
    reload();
  };

  const handleDuplicateWorkout = async (weekId: number, workoutId: number) => {
    // Duplicate to same week, same day
    await duplicateWorkout(programId, weekId, workoutId, {
      target_week_id: weekId,
      day: 1,
    });
    reload();
  };

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
          <Button onClick={handleAddWeek}>+ Add Week</Button>
        </div>
      </div>

      {program.weeks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center text-zinc-400">
          <p>No weeks yet. Add your first week to start building.</p>
        </div>
      ) : (
        <div className="space-y-6">
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
