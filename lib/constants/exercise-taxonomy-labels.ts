import type { MessageKey } from "@/lib/i18n/messages/en";

/**
 * Category/difficulty are a small closed vocabulary from the exercise
 * catalog's taxonomy endpoint — unlike muscles and equipment (open,
 * provider-grown, localized server-side via lactic-api's
 * Catalog::Translation::Glossary), these are translated here. A token with
 * no key (the API can pass one through unrecognized, e.g. a future
 * provider value) falls back to rendering raw, the same fallback shape the
 * server-side glossary uses.
 */
const DIFFICULTY_KEYS: Record<string, MessageKey> = {
  beginner: "exercise.difficulty.beginner",
  intermediate: "exercise.difficulty.intermediate",
  advanced: "exercise.difficulty.advanced",
};

const CATEGORY_KEYS: Record<string, MessageKey> = {
  strength: "exercise.category.strength",
  cardio: "exercise.category.cardio",
  balance: "exercise.category.balance",
  flexibility: "exercise.category.flexibility",
  stretching: "exercise.category.stretching",
  plyometrics: "exercise.category.plyometrics",
  powerlifting: "exercise.category.powerlifting",
  "olympic weightlifting": "exercise.category.olympicWeightlifting",
};

export function difficultyLabelKey(value: string): MessageKey | null {
  return DIFFICULTY_KEYS[value] ?? null;
}

export function categoryLabelKey(value: string): MessageKey | null {
  return CATEGORY_KEYS[value] ?? null;
}
