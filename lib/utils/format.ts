import type { Locale } from "@/lib/i18n/context";

const INTL_LOCALE: Record<Locale, string> = { en: "en-US", it: "it-IT" };

export function formatDate(dateString: string, locale: Locale = "en"): string {
  return new Date(dateString).toLocaleDateString(INTL_LOCALE[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string, locale: Locale = "en"): string {
  return new Date(dateString).toLocaleString(INTL_LOCALE[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "min"/"h" aren't translated per-locale: kept as universally-understood
// abbreviations (also how Italian gym/fitness apps commonly render duration)
// rather than introducing a locale branch for two characters.
export function formatDuration(startedAt: string, completedAt: string): string {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const minutes = Math.round((end - start) / 60000);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}min`;
}

export function formatVolumeSets(volumeSets: Record<string, number>): string {
  return Object.entries(volumeSets)
    .map(([muscle, sets]) => `${muscle} ${sets}`)
    .join(", ");
}

// Not sourced from the en.ts/it.ts message files: those are read through
// useLocale()'s t(), which is a hook and can't be called from this plain
// utility module. A locale-keyed lookup here keeps format.ts self-contained
// while still being real, correct Italian rather than an untranslated array.
const DAY_NAMES: Record<Locale, string[]> = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  it: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
};

export function dayName(day: number, locale: Locale = "en"): string {
  return DAY_NAMES[locale][day - 1] || `Day ${day}`;
}
