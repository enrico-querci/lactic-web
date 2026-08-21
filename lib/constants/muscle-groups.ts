import type { MessageKey } from "@/lib/i18n/messages/en";

/**
 * The legacy exercises.muscle_group vocabulary, offered on the create-custom-
 * exercise form. `value` is POSTed verbatim and stored in a free-form string
 * column, so it must stay English — only `labelKey` is translated. These same
 * 13 Italian words must match the `muscles:` section of lactic-api's
 * config/catalog_glossary.yml, which localizes the same words when they come
 * back as volume_sets badges — a mismatch would mean the create form and the
 * badge disagree on what a coach just typed.
 */
export const MUSCLE_GROUP_OPTIONS: { value: string; labelKey: MessageKey }[] = [
  { value: "Chest", labelKey: "muscleGroup.chest" },
  { value: "Back", labelKey: "muscleGroup.back" },
  { value: "Shoulders", labelKey: "muscleGroup.shoulders" },
  { value: "Quadriceps", labelKey: "muscleGroup.quadriceps" },
  { value: "Hamstrings", labelKey: "muscleGroup.hamstrings" },
  { value: "Glutes", labelKey: "muscleGroup.glutes" },
  { value: "Biceps", labelKey: "muscleGroup.biceps" },
  { value: "Triceps", labelKey: "muscleGroup.triceps" },
  { value: "Core", labelKey: "muscleGroup.core" },
  { value: "Calves", labelKey: "muscleGroup.calves" },
  { value: "Forearms", labelKey: "muscleGroup.forearms" },
  { value: "Traps", labelKey: "muscleGroup.traps" },
  { value: "Full Body", labelKey: "muscleGroup.fullBody" },
];

const BY_VALUE = new Map(MUSCLE_GROUP_OPTIONS.map((o) => [o.value, o.labelKey]));

/** null for a value outside the legacy vocabulary — render it raw. */
export function muscleGroupLabelKey(value: string): MessageKey | null {
  return BY_VALUE.get(value) ?? null;
}

/**
 * The display fallback used everywhere an exercise's muscle is shown:
 * `primary_muscle` when the exercise has one (already localized server-side
 * by lactic-api's Catalog::Translation::Glossary), otherwise the legacy
 * `muscle_group` column — which is what a coach-created custom exercise
 * always has instead, since it never gets a normalized muscle association.
 * Routing that fallback through the same 13-word map as the create form
 * keeps a custom exercise's muscle in Italian too, rather than the create
 * form being translated while every place that later *displays* what was
 * created stays English.
 */
export function displayMuscleGroup(
  exercise: { muscle_group: string; primary_muscle?: { name: string } | null },
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
): string {
  if (exercise.primary_muscle) return exercise.primary_muscle.name;
  const key = muscleGroupLabelKey(exercise.muscle_group);
  return key ? t(key) : exercise.muscle_group;
}
