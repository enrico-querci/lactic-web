"use client";

import { useLocale, type Locale } from "@/lib/i18n/context";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "it", label: "IT" },
];

// A plain button pair, not the shared Button component: this needs to sit
// compactly next to "Log out" in the nav and inline on the auth pages, where
// Button's padding is too wide.
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 text-sm">
      {OPTIONS.map((option, i) => (
        <span key={option.value} className="flex items-center gap-1">
          {i > 0 && <span className="text-zinc-300">/</span>}
          <button
            type="button"
            onClick={() => setLocale(option.value)}
            aria-pressed={locale === option.value}
            className={
              locale === option.value
                ? "font-medium text-zinc-900"
                : "text-zinc-400 hover:text-zinc-600"
            }
          >
            {option.label}
          </button>
        </span>
      ))}
    </div>
  );
}
