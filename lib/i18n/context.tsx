"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { en, type MessageKey } from "@/lib/i18n/messages/en";
import { it } from "@/lib/i18n/messages/it";

export type Locale = "en" | "it";

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, it };
const STORAGE_KEY = "lactic_locale";

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
}

// Plain function, not a hook: lib/api/client.ts is a module, not a component,
// and needs the current locale to set Accept-Language on every request. It
// already reads localStorage directly for the refresh token, so this follows
// the same shape. Reading localStorage rather than LocaleProvider's React
// state also matters on the very first render, where that state is
// deliberately still "en" for hydration safety while localStorage already
// holds the real preference — so the first request out is correct too.
export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "it" || stored === "en" ? stored : detectLocale();
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Starts "en" so server and first client render match (no access to
  // localStorage/navigator during SSR/hydration); the real preference is
  // applied in the effect below, same restore-on-mount shape as AuthProvider.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const restore = () => {
      setLocaleState(getStoredLocale());
    };
    restore();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => {
      const message = MESSAGES[locale][key];
      if (!vars) return message;
      return message.replace(/\{(\w+)\}/g, (match, name) =>
        name in vars ? String(vars[name]) : match
      );
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
