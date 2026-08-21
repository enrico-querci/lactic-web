"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { ApiError } from "@/lib/api/client";
import { useLocale } from "@/lib/i18n/context";

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  /** True while the data on screen does not yet correspond to the current key. */
  loading: boolean;
  /** True for the very first load, when there is nothing to show yet. */
  initial: boolean;
  /**
   * True while a request is in flight for the current key — the first load,
   * a key change, or a reload() of the same key. `loading` stays false on a
   * same-key reload (the old data is still correct to show), which used to
   * leave reload() with no signal a caller could render feedback from: a
   * status change or delete looked identical to a dropped click until the
   * response came back.
   */
  pending: boolean;
  reload: () => void;
  /**
   * Replaces the current data without a fetch, from a value the caller
   * already has — typically the response of the mutation that just
   * happened. A create/update/delete response already carries what changed;
   * calling reload() afterward to see it costs a full extra request for
   * information already in hand.
   */
  mutate: (updater: (current: T | null) => T) => void;
}

/**
 * Runs `fetcher` whenever `key` changes.
 *
 * `loading` and `pending` are derived by comparing the key/attempt that
 * produced the current result against the current key/attempt, rather than
 * being set at the top of the effect. That matters for two reasons: React's
 * set-state-in-effect rule rejects the synchronous-setState pattern, and
 * deriving it means the previous results stay on screen while new ones load
 * instead of flashing an empty list on every keystroke.
 */
export function useAsync<T>(key: string, fetcher: () => Promise<T>): AsyncState<T> {
  // Scoped by locale so a language toggle refetches: the API can serve
  // locale-dependent content (exercise names/descriptions today, taxonomy
  // labels once wired), and this hook's own key/result comparison is what
  // decides whether to show stale data or refetch — a bare `key` wouldn't
  // change on a toggle, so old-language data would sit on screen until a
  // hard reload. The redundant refetch this costs on endpoints with no
  // locale-dependent content (most of them) is the right trade against
  // auditing every one of this hook's call sites individually.
  const { locale } = useLocale();
  const scopedKey = `${locale}|${key}`;

  const [result, setResult] = useState<
    { key: string; attempt: number; data: T | null; error: string | null } | null
  >(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setResult({ key: scopedKey, attempt, data, error: null });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Something went wrong";

        // A 4xx ApiError is routine — validation failures, a missing or
        // forbidden resource, a just-expired session. Reporting every one
        // would be noise, and 403s are already captured server-side
        // (Authorizable#report_forbidden) from the vantage point that
        // actually enforced the rule. Anything else — 5xx, or not an
        // ApiError at all (a network failure, an unexpected shape) — is
        // worth knowing about.
        const status = e instanceof ApiError ? e.status : null;
        if (status === null || status >= 500) {
          Sentry.captureException(e);
        }

        setResult({ key: scopedKey, attempt, data: null, error: message });
      });

    return () => {
      cancelled = true;
    };
    // `fetcher` is intentionally excluded: callers build it inline, so
    // including it would refetch on every render. `scopedKey` is the contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedKey, attempt]);

  return {
    data: result?.data ?? null,
    error: result?.key === scopedKey ? result?.error ?? null : null,
    loading: result?.key !== scopedKey,
    initial: result === null,
    pending: result === null || result.key !== scopedKey || result.attempt !== attempt,
    reload: () => setAttempt((n) => n + 1),
    mutate: (updater) =>
      setResult((prev) => ({
        key: scopedKey,
        attempt,
        data: updater(prev?.data ?? null),
        error: null,
      })),
  };
}
