"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getClientWorkout } from "@/lib/api/endpoints/client-workouts";
import {
  createClientSession,
  updateClientSession,
} from "@/lib/api/endpoints/client-sessions";
import {
  createExerciseLog,
  createSetLog,
  updateSetLog,
  deleteSetLog,
} from "@/lib/api/endpoints/client-logs";
import type {
  WorkoutExtended,
  WorkoutSession,
  ExerciseLogExtended,
  SetLog,
} from "@/lib/api/types";
import { SetLogInput } from "@/components/domain/set-log-input";
import { RestTimer } from "@/components/domain/rest-timer";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

export default function WorkoutExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutId = Number(params.id);
  const assignmentId = Number(searchParams.get("assignment_id") || 0);

  const [workout, setWorkout] = useState<WorkoutExtended | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<
    Map<number, ExerciseLogExtended>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Load workout
  useEffect(() => {
    getClientWorkout(workoutId)
      .then(setWorkout)
      .finally(() => setLoading(false));
  }, [workoutId]);

  // Create or resume session
  const startSession = useCallback(async () => {
    if (!workout || session) return;
    const newSession = await createClientSession({
      workout_id: workoutId,
      program_assignment_id: assignmentId,
      started_at: new Date().toISOString(),
    });
    setSession(newSession);
    return newSession;
  }, [workout, session, workoutId, assignmentId]);

  const ensureExerciseLog = useCallback(
    async (workoutExerciseId: number): Promise<ExerciseLogExtended> => {
      const existing = exerciseLogs.get(workoutExerciseId);
      if (existing) return existing;

      if (!session) throw new Error("No active session");

      const log = await createExerciseLog({
        workout_session_id: session.id,
        workout_exercise_id: workoutExerciseId,
      });

      const extended: ExerciseLogExtended = { ...log, set_logs: [] };
      setExerciseLogs((prev) => new Map(prev).set(workoutExerciseId, extended));
      return extended;
    },
    [session, exerciseLogs]
  );

  const handleAddSet = async (workoutExerciseId: number) => {
    const log = await ensureExerciseLog(workoutExerciseId);
    const nextPosition = log.set_logs.length + 1;
    const newSet = await createSetLog({
      exercise_log_id: log.id,
      position: nextPosition,
      weight_kg: 0,
      reps: 0,
    });

    setExerciseLogs((prev) => {
      const map = new Map(prev);
      const current = map.get(workoutExerciseId)!;
      map.set(workoutExerciseId, {
        ...current,
        set_logs: [...current.set_logs, newSet],
      });
      return map;
    });
  };

  const handleUpdateSetLog = async (
    workoutExerciseId: number,
    setLogId: number,
    data: { weight_kg?: number; reps?: number }
  ) => {
    const updated = await updateSetLog(setLogId, data);
    setExerciseLogs((prev) => {
      const map = new Map(prev);
      const current = map.get(workoutExerciseId)!;
      map.set(workoutExerciseId, {
        ...current,
        set_logs: current.set_logs.map((s) =>
          s.id === setLogId ? updated : s
        ),
      });
      return map;
    });
  };

  const handleDeleteSetLog = async (
    workoutExerciseId: number,
    setLogId: number
  ) => {
    await deleteSetLog(setLogId);
    setExerciseLogs((prev) => {
      const map = new Map(prev);
      const current = map.get(workoutExerciseId)!;
      map.set(workoutExerciseId, {
        ...current,
        set_logs: current.set_logs.filter((s) => s.id !== setLogId),
      });
      return map;
    });
  };

  const handleComplete = async () => {
    if (!session) return;
    setCompleting(true);
    await updateClientSession(session.id, {
      completed_at: new Date().toISOString(),
    });
    router.push("/client/history");
  };

  if (loading) return <Loading />;
  if (!workout) return <div>Workout not found</div>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-zinc-900">{workout.name}</h1>
      {Object.keys(workout.volume_sets).length > 0 && (
        <div className="mb-4 flex gap-2">
          {Object.entries(workout.volume_sets).map(([muscle, sets]) => (
            <span
              key={muscle}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500"
            >
              {muscle} {sets}
            </span>
          ))}
        </div>
      )}

      {!session ? (
        <Button onClick={startSession}>Start Workout</Button>
      ) : (
        <div className="space-y-4">
          {workout.workout_exercises
            .sort((a, b) => a.position.localeCompare(b.position))
            .map((we) => {
              const log = exerciseLogs.get(we.id);

              return (
                <div
                  key={we.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                        {we.position}
                      </span>
                      <span className="font-medium text-zinc-900">
                        {we.exercise.name}
                      </span>
                    </div>
                    <RestTimer seconds={we.rest_seconds} />
                  </div>

                  <div className="mb-2 flex gap-3 text-xs text-zinc-500">
                    <span>
                      Target: {we.sets} x {we.reps}
                    </span>
                    {we.rir != null && <span>RIR {we.rir}</span>}
                    {we.weight != null && <span>Suggested {we.weight}kg</span>}
                    {we.notes && (
                      <span className="italic text-zinc-400">{we.notes}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {log?.set_logs.map((setLog: SetLog) => (
                      <SetLogInput
                        key={setLog.id}
                        setLog={setLog}
                        onUpdate={(id, data) =>
                          handleUpdateSetLog(we.id, id, data)
                        }
                        onDelete={(id) => handleDeleteSetLog(we.id, id)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddSet(we.id)}
                    className="mt-2 text-sm text-zinc-500 hover:text-zinc-700"
                  >
                    + Add Set
                  </button>
                </div>
              );
            })}

          <div className="pt-4">
            <Button
              onClick={handleComplete}
              disabled={completing}
              className="w-full"
            >
              {completing ? "Completing..." : "Complete Workout"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
