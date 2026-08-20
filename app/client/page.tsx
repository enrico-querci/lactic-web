"use client";

import { useCallback } from "react";
import Link from "next/link";
import {
  getClientPrograms,
  getClientProgram,
} from "@/lib/api/endpoints/client-programs";
import { getClientSessions } from "@/lib/api/endpoints/client-sessions";
import { formatDateTime } from "@/lib/utils/format";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

interface HomeData {
  programName: string | null;
  programId: number | null;
  assignmentId: number | null;
  nextWorkout: { id: number; name: string; weekPosition: number } | null;
  inProgress: { sessionId: number; workoutId: number } | null;
  recent: { id: number; started_at: string; completed_at: string | null }[];
}

/**
 * What the client sees on opening the app.
 *
 * This used to be a bare redirect to the programs list, which answered
 * "what programs exist" rather than the only question a trainee actually
 * opens the app to ask: what am I doing right now?
 *
 * Composed entirely from existing endpoints — three requests, no new API.
 */
async function loadHome(): Promise<HomeData> {
  const [assignments, sessions] = await Promise.all([
    getClientPrograms(),
    getClientSessions(),
  ]);

  const empty: HomeData = {
    programName: null,
    programId: null,
    assignmentId: null,
    nextWorkout: null,
    inProgress: null,
    recent: sessions.slice(0, 3),
  };

  const openSession = sessions.find((s) => !s.completed_at);
  if (openSession) {
    empty.inProgress = {
      sessionId: openSession.id,
      workoutId: openSession.workout_id,
    };
  }

  const assignment = assignments[0];
  if (!assignment) return empty;

  const program = await getClientProgram(assignment.program.id);

  // "Next" is the first workout, in week then day order, with no completed
  // session against it. A trainee following a program in order lands on the
  // right one; someone who skipped ahead still gets a sensible starting point
  // rather than nothing.
  const completedWorkoutIds = new Set(
    sessions.filter((s) => s.completed_at).map((s) => s.workout_id)
  );

  let nextWorkout: HomeData["nextWorkout"] = null;
  for (const week of [...program.weeks].sort((a, b) => a.position - b.position)) {
    const candidate = [...week.workouts]
      .sort((a, b) => a.day - b.day)
      .find((w) => !completedWorkoutIds.has(w.id));
    if (candidate) {
      nextWorkout = {
        id: candidate.id,
        name: candidate.name,
        weekPosition: week.position,
      };
      break;
    }
  }

  return {
    ...empty,
    programName: program.name,
    programId: program.id,
    assignmentId: program.assignment_id,
    nextWorkout,
  };
}

export default function ClientHomePage() {
  const { t, locale } = useLocale();
  const { data, error, initial, reload } = useAsync(
    "client-home",
    useCallback(() => loadHome(), [])
  );

  if (initial) return <Loading />;
  if (error)
    return <ErrorState message={error} onRetry={reload} retryLabel={t("common.retry")} />;
  if (!data) return null;

  if (!data.programName && data.recent.length === 0) {
    return <EmptyState message={t("program.noneAssigned")} />;
  }

  return (
    <div className="space-y-6">
      {/* Resuming outranks starting something new: an unfinished workout is
          almost certainly the thing the trainee came back for. */}
      {data.inProgress && (
        <Link
          href={`/client/workouts/${data.inProgress.workoutId}${
            data.assignmentId ? `?assignment_id=${data.assignmentId}` : ""
          }`}
          className="block rounded-lg border border-zinc-900 bg-zinc-900 p-4 text-white"
        >
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            {t("common.inProgress")}
          </p>
          <p className="mt-1 font-medium">{t("home.resumeWorkout")}</p>
        </Link>
      )}

      {data.programName && (
        <section>
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            {t("home.currentProgram")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">
            {data.programName}
          </h1>

          {data.nextWorkout ? (
            <Link
              href={`/client/workouts/${data.nextWorkout.id}${
                data.assignmentId ? `?assignment_id=${data.assignmentId}` : ""
              }`}
              className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
            >
              <div className="min-w-0">
                <p className="text-xs text-zinc-400">
                  {t("home.upNext", { week: data.nextWorkout.weekPosition })}
                </p>
                <p className="truncate font-medium text-zinc-900">
                  {data.nextWorkout.name}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white">
                {t("home.start")}
              </span>
            </Link>
          ) : (
            <p className="mt-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              {t("home.allDone")}
            </p>
          )}

          {data.programId && (
            <Link
              href={`/client/programs/${data.programId}`}
              className="mt-2 inline-block text-sm text-zinc-500 hover:text-zinc-700"
            >
              {t("home.viewFullProgram")} &rarr;
            </Link>
          )}
        </section>
      )}

      {data.recent.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-800">
            {t("home.recentActivity")}
          </h2>
          <div className="space-y-2">
            {data.recent.map((s) => (
              <Link
                key={s.id}
                href={`/client/history/${s.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-colors hover:border-zinc-300"
              >
                <span className="min-w-0 truncate text-zinc-900">
                  {formatDateTime(s.started_at, locale)}
                </span>
                <span className="shrink-0 text-zinc-400">
                  {s.completed_at ? t("common.completed") : t("common.inProgress")}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
