"use client";

import { useCallback, useState } from "react";
import { getExercises, getExerciseTaxonomy } from "@/lib/api/endpoints/exercises";
import type { Exercise } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { displayMuscleGroup } from "@/lib/constants/muscle-groups";
import {
  ExerciseFilters,
  EMPTY_FILTERS,
  type FilterValues,
} from "@/components/domain/exercise-filters";

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onCancel: () => void;
}

const PER_PAGE = 20;

/**
 * Exercise selection inside the program builder.
 *
 * Paginated rather than flat: the catalog runs to well over a thousand
 * records, and the endpoint only returns exercises that are active and
 * assignable, so what is listed here is exactly what may be added to a
 * workout. No animation is fetched — one fetch per row would cost a provider
 * request per row.
 */
export function ExercisePicker({ onSelect, onCancel }: ExercisePickerProps) {
  const { t } = useLocale();
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const taxonomy = useAsync(
    "taxonomy",
    useCallback(() => getExerciseTaxonomy(), [])
  );

  const listKey = JSON.stringify({ ...filters, page });
  const list = useAsync(
    listKey,
    useCallback(
      () => getExercises({ ...filters, page, per_page: PER_PAGE }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [listKey]
    )
  );

  const applyFilters = (next: FilterValues) => {
    setFilters(next);
    setPage(1);
  };

  const exercises = list.data?.items ?? [];
  const meta = list.data?.meta;

  return (
    <div>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <ExerciseFilters
            values={filters}
            taxonomy={taxonomy.data}
            onChange={applyFilters}
            compact
          />
        </div>
        <button
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50"
        >
          {t("common.cancel")}
        </button>
      </div>
      {/* Non-blocking: taxonomy only feeds the filter dropdowns above, so a
          failure here degrades filtering, not the exercise list below. */}
      {taxonomy.error && (
        <p className="mt-1 text-xs text-zinc-400">
          {t("exercises.filtersUnavailable", { error: taxonomy.error })}
        </p>
      )}

      {list.error && (
        <div className="mb-2 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{list.error}</span>
          <button type="button" onClick={list.reload} className="text-xs font-medium underline">
            {t("common.retry")}
          </button>
        </div>
      )}

      <div
        className="max-h-60 overflow-y-auto rounded-md border border-zinc-200"
        aria-busy={list.loading}
      >
        {list.initial ? (
          <p className="p-4 text-center text-sm text-zinc-400">{t("common.loading")}</p>
        ) : exercises.length === 0 && !list.loading ? (
          <p className="p-4 text-center text-sm text-zinc-400">{t("exercisePicker.noneFound")}</p>
        ) : (
          exercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise)}
              className="flex w-full items-center justify-between border-b border-zinc-100 px-4 py-2 text-left text-sm last:border-0 hover:bg-zinc-50"
            >
              <span className="font-medium text-zinc-900">
                {exercise.name}
                {exercise.is_custom && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {t("exercises.custom")}
                  </span>
                )}
              </span>
              <span className="text-xs text-zinc-400">
                {displayMuscleGroup(exercise, t)}
              </span>
            </button>
          ))
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {t("exercises.pageInfo", {
              page: meta.page,
              totalPages: meta.totalPages,
              totalCount: meta.totalCount,
            })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.page <= 1 || list.loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-zinc-300 px-2 py-1 disabled:opacity-40"
            >
              {t("common.previous")}
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages || list.loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-zinc-300 px-2 py-1 disabled:opacity-40"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
