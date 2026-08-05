"use client";

import type { ExerciseTaxonomy } from "@/lib/api/types";

export interface FilterValues {
  search: string;
  muscle: string;
  equipment: string;
  category: string;
  difficulty: string;
  custom: string;
}

export const EMPTY_FILTERS: FilterValues = {
  search: "",
  muscle: "",
  equipment: "",
  category: "",
  difficulty: "",
  custom: "",
};

interface ExerciseFiltersProps {
  values: FilterValues;
  taxonomy: ExerciseTaxonomy | null;
  onChange: (values: FilterValues) => void;
  /** Hidden in the compact picker, where the extra controls crowd the modal. */
  compact?: boolean;
}

const selectClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400";

/**
 * Filter controls driven by the taxonomy endpoint rather than a hardcoded
 * list. The values are stable keys, so they keep working when display names
 * are translated.
 */
export function ExerciseFilters({ values, taxonomy, onChange, compact = false }: ExerciseFiltersProps) {
  const set = (patch: Partial<FilterValues>) => onChange({ ...values, ...patch });
  const active = Object.values(values).some((value) => value !== "");

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <input
        type="search"
        value={values.search}
        onChange={(e) => set({ search: e.target.value })}
        placeholder="Search exercises…"
        aria-label="Search exercises"
        className="min-w-48 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
      />

      <select
        value={values.muscle}
        onChange={(e) => set({ muscle: e.target.value })}
        aria-label="Filter by muscle"
        className={selectClass}
      >
        <option value="">All muscles</option>
        {taxonomy?.muscles.map((muscle) => (
          <option key={muscle.key} value={muscle.key}>
            {muscle.name}
          </option>
        ))}
      </select>

      <select
        value={values.equipment}
        onChange={(e) => set({ equipment: e.target.value })}
        aria-label="Filter by equipment"
        className={selectClass}
      >
        <option value="">All equipment</option>
        {taxonomy?.equipment.map((item) => (
          <option key={item.key} value={item.key}>
            {item.name}
          </option>
        ))}
      </select>

      {!compact && (
        <>
          <select
            value={values.category}
            onChange={(e) => set({ category: e.target.value })}
            aria-label="Filter by category"
            className={selectClass}
          >
            <option value="">All categories</option>
            {taxonomy?.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={values.difficulty}
            onChange={(e) => set({ difficulty: e.target.value })}
            aria-label="Filter by difficulty"
            className={selectClass}
          >
            <option value="">All levels</option>
            {taxonomy?.difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>

          <select
            value={values.custom}
            onChange={(e) => set({ custom: e.target.value })}
            aria-label="Filter by ownership"
            className={selectClass}
          >
            <option value="">Catalog and custom</option>
            <option value="false">Catalog only</option>
            <option value="true">My exercises only</option>
          </select>
        </>
      )}

      {active && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
