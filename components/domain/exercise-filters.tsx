"use client";

import type { ExerciseTaxonomy } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/context";
import { categoryLabelKey, difficultyLabelKey } from "@/lib/constants/exercise-taxonomy-labels";

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
  const { t } = useLocale();
  const set = (patch: Partial<FilterValues>) => onChange({ ...values, ...patch });
  const active = Object.values(values).some((value) => value !== "");

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <input
        type="search"
        value={values.search}
        onChange={(e) => set({ search: e.target.value })}
        placeholder={t("exerciseFilters.searchPlaceholder")}
        aria-label={t("exerciseFilters.searchPlaceholder")}
        className="min-w-48 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
      />

      <select
        value={values.muscle}
        onChange={(e) => set({ muscle: e.target.value })}
        aria-label={t("exerciseFilters.filterByMuscle")}
        className={selectClass}
      >
        <option value="">{t("exerciseFilters.allMuscles")}</option>
        {taxonomy?.muscles.map((muscle) => (
          <option key={muscle.key} value={muscle.key}>
            {muscle.name}
          </option>
        ))}
      </select>

      <select
        value={values.equipment}
        onChange={(e) => set({ equipment: e.target.value })}
        aria-label={t("exerciseFilters.filterByEquipment")}
        className={selectClass}
      >
        <option value="">{t("exerciseFilters.allEquipment")}</option>
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
            aria-label={t("exerciseFilters.filterByCategory")}
            className={selectClass}
          >
            <option value="">{t("exerciseFilters.allCategories")}</option>
            {taxonomy?.categories.map((category) => {
              const key = categoryLabelKey(category);
              return (
                <option key={category} value={category}>
                  {key ? t(key) : category}
                </option>
              );
            })}
          </select>

          <select
            value={values.difficulty}
            onChange={(e) => set({ difficulty: e.target.value })}
            aria-label={t("exerciseFilters.filterByDifficulty")}
            className={selectClass}
          >
            <option value="">{t("exerciseFilters.allLevels")}</option>
            {taxonomy?.difficulties.map((difficulty) => {
              const key = difficultyLabelKey(difficulty);
              return (
                <option key={difficulty} value={difficulty}>
                  {key ? t(key) : difficulty}
                </option>
              );
            })}
          </select>

          <select
            value={values.custom}
            onChange={(e) => set({ custom: e.target.value })}
            aria-label={t("exerciseFilters.filterByOwnership")}
            className={selectClass}
          >
            <option value="">{t("exerciseFilters.catalogAndCustom")}</option>
            <option value="false">{t("exerciseFilters.catalogOnly")}</option>
            <option value="true">{t("exerciseFilters.myExercisesOnly")}</option>
          </select>
        </>
      )}

      {active && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          {t("common.clear")}
        </button>
      )}
    </div>
  );
}
