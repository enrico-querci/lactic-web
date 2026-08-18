"use client";

import { useEffect, useState } from "react";

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
  const [result, setResult] = useState<
    { key: string; attempt: number; data: T | null; error: string | null } | null
  >(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setResult({ key, attempt, data, error: null });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Something went wrong";
        setResult({ key, attempt, data: null, error: message });
      });

    return () => {
      cancelled = true;
    };
    // `fetcher` is intentionally excluded: callers build it inline, so
    // including it would refetch on every render. `key` is the contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  return {
    data: result?.data ?? null,
    error: result?.key === key ? result?.error ?? null : null,
    loading: result?.key !== key,
    initial: result === null,
    pending: result === null || result.key !== key || result.attempt !== attempt,
    reload: () => setAttempt((n) => n + 1),
    mutate: (updater) =>
      setResult((prev) => ({
        key,
        attempt,
        data: updater(prev?.data ?? null),
        error: null,
      })),
  };
}
