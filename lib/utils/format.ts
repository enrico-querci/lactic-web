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

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "2 hours ago", "yesterday", in the user's language. Beyond a week it gives
 * the date, since "23 days ago" is harder to place than "Oct 14".
 */
export function formatRelativeTime(dateString: string, locale: Locale = "en", now = Date.now()): string {
  const elapsed = now - new Date(dateString).getTime();
  const formatter = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: "auto" });

  if (elapsed < MINUTE) return formatter.format(0, "second");
  if (elapsed < HOUR) return formatter.format(-Math.floor(elapsed / MINUTE), "minute");
  if (elapsed < DAY) return formatter.format(-Math.floor(elapsed / HOUR), "hour");
  if (elapsed < 7 * DAY) return formatter.format(-Math.floor(elapsed / DAY), "day");
  return formatDate(dateString, locale);
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
