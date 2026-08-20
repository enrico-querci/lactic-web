"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getClientWorkout } from "@/lib/api/endpoints/client-workouts";
import {
  createClientSession,
  updateClientSession,
  getClientSessions,
  getClientSession,
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
import { ExerciseAssist } from "@/components/domain/exercise-assist";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useLocale } from "@/lib/i18n/context";

export default function WorkoutExecutionPage() {
  const { t } = useLocale();
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
  const [error, setError] = useState<string | null>(null);

  // Load the workout and resume any session already in progress for it.
  //
  // The session used to live only in React state, so a refresh — or the tab
  // being evicted, which phones do constantly — orphaned the session on the
  // server and started a new one, stranding every set already logged. The API
  // already returns everything needed to recover: the :extended session view
  // carries its exercise_logs and their set_logs, keyed by workout_exercise_id.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const loadedWorkout = await getClientWorkout(workoutId);
        if (cancelled) return;
        setWorkout(loadedWorkout);

        const sessions = await getClientSessions();
        if (cancelled) return;

        const inProgress = sessions.find(
          (s) => s.workout_id === workoutId && !s.completed_at
        );
        if (!inProgress) return;

        const full = await getClientSession(inProgress.id);
        if (cancelled) return;

        setSession(full);
        setExerciseLogs(
          new Map(full.exercise_logs.map((log) => [log.workout_exercise_id, log]))
        );
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("workout.loadFailed"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [workoutId, t]);

  // Starts a new session. Resuming an existing one happens on mount above, so
  // by the time this can be pressed there is no session in progress.
  const startSession = useCallback(async () => {
    if (!workout || session) return;
    try {
      const newSession = await createClientSession({
        workout_id: workoutId,
        program_assignment_id: assignmentId,
        started_at: new Date().toISOString(),
      });
      setSession(newSession);
      setError(null);
      return newSession;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("workout.startFailed"));
    }
  }, [workout, session, workoutId, assignmentId, t]);

  const ensureExerciseLog = useCallback(
    async (workoutExerciseId: number): Promise<ExerciseLogExtended> => {
      const existing = exerciseLogs.get(workoutExerciseId);
      if (existing) return existing;

      if (!session) throw new Error(t("workout.noActiveSession"));

      const log = await createExerciseLog({
        workout_session_id: session.id,
        workout_exercise_id: workoutExerciseId,
      });

      const extended: ExerciseLogExtended = { ...log, set_logs: [] };
      setExerciseLogs((prev) => new Map(prev).set(workoutExerciseId, extended));
      return extended;
    },
    [session, exerciseLogs, t]
  );

  // The mutations below report failure rather than swallowing it. These are
  // writes a trainee believes succeeded: a silently failed set is one they
  // will not re-enter, and it vanishes on the next refresh.
  const handleAddSet = async (workoutExerciseId: number) => {
    try {
      const log = await ensureExerciseLog(workoutExerciseId);
      const nextPosition = log.set_logs.length + 1;

    // Pre-fill from the coach's target rather than 0: the server requires
    // reps > 0 (a zero-rep set isn't a set), so 0 always failed with a 422
    // and "+ Add Set" could never add one. The target is already on screen
    // as "Target: {sets} x {reps}" immediately above this button, and the
    // client edits it to what they actually did via SetLogInput once it
    // appears.
      const workoutExercise = workout?.workout_exercises.find(
        (we) => we.id === workoutExerciseId
      );
      const newSet = await createSetLog({
        exercise_log_id: log.id,
        position: nextPosition,
        weight_kg: workoutExercise?.weight ?? 0,
        reps: workoutExercise?.reps ?? 1,
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
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("workout.addSetFailed"));
    }
  };

  const handleUpdateSetLog = async (
    workoutExerciseId: number,
    setLogId: number,
    data: { weight_kg?: number; reps?: number }
  ) => {
    try {
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
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("workout.saveSetFailed"));
    }
  };

  const handleDeleteSetLog = async (
    workoutExerciseId: number,
    setLogId: number
  ) => {
    try {
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
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("workout.removeSetFailed"));
    }
  };

  const handleComplete = async () => {
    if (!session) return;
    setCompleting(true);
    try {
      await updateClientSession(session.id, {
        completed_at: new Date().toISOString(),
      });
      router.push("/client/history");
    } catch (e) {
      // Reset `completing` on failure, or the button stays stuck reading
      // "Completing..." with no way to try again.
      setCompleting(false);
      setError(e instanceof Error ? e.message : t("workout.completeFailed"));
    }
  };

  if (loading) return <Loading />;
  if (!workout) return <div>{t("workout.notFound")}</div>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-zinc-900">{workout.name}</h1>
      {Object.keys(workout.volume_sets).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
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

      {/* Sticky so a failure stays visible while the trainee scrolls between
          exercises, rather than scrolling away unnoticed mid-workout. */}
      {error && (
        <div
          role="alert"
          className="sticky top-2 z-10 mb-4 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium hover:bg-red-50"
          >
            {t("common.dismiss")}
          </button>
        </div>
      )}

      {session && !session.completed_at && exerciseLogs.size > 0 && (
        <p className="mb-4 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
          {t("workout.resumedInProgress")}
        </p>
      )}

      {!session ? (
        <Button onClick={startSession}>{t("workout.start")}</Button>
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

                  {/* flex-wrap so the coach's prescription stacks rather than
                      overflowing the card on a phone. */}
                  <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    <span>{t("workout.target", { sets: we.sets, reps: we.reps })}</span>
                    {we.rir != null && <span>RIR {we.rir}</span>}
                    {we.weight != null && (
                      <span>{t("workout.suggested", { weight: we.weight })}</span>
                    )}
                    {we.notes && (
                      <span className="italic text-zinc-400">{we.notes}</span>
                    )}
                  </div>

                  <ExerciseAssist exercise={we.exercise} />

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
                    {t("workout.addSet")}
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
              {completing ? t("workout.completing") : t("workout.complete")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
