"use client";

import { useEffect, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  /** True while the data on screen does not yet correspond to the current key. */
  loading: boolean;
  /** True for the very first load, when there is nothing to show yet. */
  initial: boolean;
  reload: () => void;
}

/**
 * Runs `fetcher` whenever `key` changes.
 *
 * `loading` is derived by comparing the key that produced the current data
 * against the current key, rather than being set at the top of the effect.
 * That matters for two reasons: React's set-state-in-effect rule rejects the
 * synchronous-setState pattern, and deriving it means the previous results
 * stay on screen while new ones load instead of flashing an empty list on
 * every keystroke.
 */
export function useAsync<T>(key: string, fetcher: () => Promise<T>): AsyncState<T> {
  const [result, setResult] = useState<{ key: string; data: T | null; error: string | null } | null>(
    null
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: null });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Something went wrong";
        setResult({ key, data: null, error: message });
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
    reload: () => setAttempt((n) => n + 1),
  };
}
