"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getClientProgram } from "@/lib/api/endpoints/client-programs";
import type { ProgramExtended } from "@/lib/api/types";
import { Loading } from "@/components/ui/loading";
import { dayName } from "@/lib/utils/format";

export default function ClientProgramDetailPage() {
  const params = useParams();
  const programId = Number(params.id);

  const [program, setProgram] = useState<ProgramExtended | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientProgram(programId)
      .then(setProgram)
      .finally(() => setLoading(false));
  }, [programId]);

  if (loading) return <Loading />;
  if (!program) return <div>Program not found</div>;

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
                Week {week.position}
              </h2>
              {week.workouts.length === 0 ? (
                <p className="text-sm text-zinc-400">No workouts this week</p>
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
                            {dayName(workout.day)}
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
