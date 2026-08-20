"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getClientProgram } from "@/lib/api/endpoints/client-programs";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { dayName } from "@/lib/utils/format";

export default function ClientProgramDetailPage() {
  const { t, locale } = useLocale();
  const params = useParams();
  const programId = Number(params.id);

  const {
    data: program,
    error,
    initial,
    reload,
  } = useAsync(
    `client-program:${programId}`,
    useCallback(() => getClientProgram(programId), [programId])
  );

  if (initial) return <Loading />;
  if (error)
    return <ErrorState message={error} onRetry={reload} retryLabel={t("common.retry")} />;
  if (!program) return <div>{t("program.notFound")}</div>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-zinc-900">{program.name}</h1>
      {program.description && (
        <p className="mb-6 text-sm text-zinc-500">{program.description}</p>
      )}

      <div className="space-y-6">
        {program.weeks
          .sort((a, b) => a.position - b.position)
          .map((week) => (
            <div key={week.id}>
              <h2 className="mb-3 text-lg font-semibold text-zinc-800">
                {t("program.week", { position: week.position })}
              </h2>
              {week.workouts.length === 0 ? (
                <p className="text-sm text-zinc-400">{t("program.noWorkoutsThisWeek")}</p>
              ) : (
                <div className="space-y-2">
                  {week.workouts
                    .sort((a, b) => a.day - b.day)
                    .map((workout) => (
                      <Link
                        key={workout.id}
                        href={`/client/workouts/${workout.id}?assignment_id=${program.assignment_id}`}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300"
                      >
                        <div>
                          <span className="mr-2 text-xs font-medium text-zinc-400">
                            {dayName(workout.day, locale)}
                          </span>
                          <span className="font-medium text-zinc-900">
                            {workout.name}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {Object.entries(workout.volume_sets).map(
                            ([muscle, sets]) => (
                              <span
                                key={muscle}
                                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500"
                              >
                                {muscle} {sets}
                              </span>
                            )
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
