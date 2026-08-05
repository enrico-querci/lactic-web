"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  getExercise,
  getExercises,
  getExerciseTaxonomy,
  deleteExercise,
} from "@/lib/api/endpoints/exercises";
import type { Exercise } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/use-async";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ExerciseAnimation } from "@/components/domain/exercise-animation";
import {
  ExerciseFilters,
  EMPTY_FILTERS,
  type FilterValues,
} from "@/components/domain/exercise-filters";

const PER_PAGE = 25;

export default function ExercisesPage() {
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const taxonomy = useAsync(
    "taxonomy",
    useCallback(() => getExerciseTaxonomy(), [])
  );

  const listKey = JSON.stringify({ ...filters, page });
  const list = useAsync(
    listKey,
    useCallback(
      () => getExercises({ ...filters, page, per_page: PER_PAGE }),
      // Keyed on the serialized filters, so a new object identity each render
      // does not retrigger the fetch.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [listKey]
    )
  );

  const detail = useAsync(
    `detail:${selectedId ?? "none"}`,
    useCallback(
      () => (selectedId ? getExercise(selectedId) : Promise.resolve(null)),
      [selectedId]
    )
  );

  const applyFilters = (next: FilterValues) => {
    setFilters(next);
    setPage(1); // A filter change invalidates the current page number.
  };

  const handleDelete = async (exercise: Exercise) => {
    if (!confirm(`Delete "${exercise.name}"?`)) return;
    await deleteExercise(exercise.id);
    setDeletedIds((prev) => [...prev, exercise.id]);
    if (selectedId === exercise.id) setSelectedId(null);
  };

  const exercises = (list.data?.items ?? []).filter((e) => !deletedIds.includes(e.id));
  const meta = list.data?.meta;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Exercises</h1>
        <Link href="/coach/exercises/new">
          <Button>New Exercise</Button>
        </Link>
      </div>

      <ExerciseFilters values={filters} taxonomy={taxonomy.data} onChange={applyFilters} />

      {list.error && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{list.error}</span>
          <button
            type="button"
            onClick={list.reload}
            className="rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          {list.initial ? (
            <Loading />
          ) : exercises.length === 0 && !list.loading ? (
            <EmptyState message="No exercises match these filters" />
          ) : (
            <>
              {/* Previous results stay visible while the next page loads, so
                  the list does not flash empty on every keystroke. */}
              <div
                className={`overflow-hidden rounded-lg border border-zinc-200 bg-white transition-opacity ${
                  list.loading ? "opacity-60" : ""
                }`}
                aria-busy={list.loading}
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Muscle</th>
                      <th className="px-6 py-3">Equipment</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {exercises.map((exercise) => (
                      <tr
                        key={exercise.id}
                        onClick={() => setSelectedId(exercise.id)}
                        className={`cursor-pointer hover:bg-zinc-50 ${
                          selectedId === exercise.id ? "bg-zinc-50" : ""
                        }`}
                      >
                        <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                          {exercise.name}
                        </td>
                        <td className="px-6 py-3 text-sm text-zinc-500">
                          {exercise.primary_muscle?.name ?? exercise.muscle_group}
                        </td>
                        <td className="px-6 py-3 text-sm text-zinc-500">
                          {exercise.equipment.map((e) => e.name).join(", ") || "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-zinc-500">
                          {exercise.is_custom ? (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                              Custom
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                              Catalog
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {exercise.is_custom && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(exercise);
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {meta && meta.totalPages > 1 && (
                <nav
                  className="mt-4 flex items-center justify-between text-sm"
                  aria-label="Pagination"
                >
                  <span className="text-zinc-500">
                    Page {meta.page} of {meta.totalPages} · {meta.totalCount} exercises
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={meta.page <= 1 || list.loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={meta.page >= meta.totalPages || list.loading}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          {selectedId === null ? (
            <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400">
              Select an exercise to preview it
            </div>
          ) : detail.initial || detail.loading ? (
            <Loading />
          ) : detail.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {detail.error}
            </div>
          ) : detail.data ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold text-zinc-900">{detail.data.name}</h2>

              {/* Mounted only for the selected exercise: one animation fetch
                  costs one request against the provider's monthly quota. */}
              <ExerciseAnimation
                animationUrl={detail.data.animation_url}
                alt={`${detail.data.name} demonstration`}
              />

              {detail.data.description && (
                <p className="mt-3 text-sm text-zinc-600">{detail.data.description}</p>
              )}

              <dl className="mt-3 space-y-1 text-sm">
                {detail.data.primary_muscle && (
                  <div className="flex gap-2">
                    <dt className="text-zinc-500">Primary</dt>
                    <dd className="text-zinc-900">{detail.data.primary_muscle.name}</dd>
                  </div>
                )}
                {detail.data.secondary_muscles.length > 0 && (
                  <div className="flex gap-2">
                    <dt className="text-zinc-500">Secondary</dt>
                    <dd className="text-zinc-900">
                      {detail.data.secondary_muscles.map((m) => m.name).join(", ")}
                    </dd>
                  </div>
                )}
                {detail.data.equipment.length > 0 && (
                  <div className="flex gap-2">
                    <dt className="text-zinc-500">Equipment</dt>
                    <dd className="text-zinc-900">
                      {detail.data.equipment.map((e) => e.name).join(", ")}
                    </dd>
                  </div>
                )}
                {detail.data.difficulty && (
                  <div className="flex gap-2">
                    <dt className="text-zinc-500">Level</dt>
                    <dd className="text-zinc-900">{detail.data.difficulty}</dd>
                  </div>
                )}
              </dl>

              {detail.data.instructions.length > 0 && (
                <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-zinc-600">
                  {detail.data.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
