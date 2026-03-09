"use client";

import { useState, useEffect, useCallback } from "react";

interface RestTimerProps {
  seconds: number;
}

export function RestTimer({ seconds }: RestTimerProps) {
  const [remaining, setRemaining] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, remaining]);

  const start = useCallback(() => {
    setRemaining(seconds);
    setActive(true);
  }, [seconds]);

  const stop = useCallback(() => {
    setActive(false);
    setRemaining(0);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex items-center gap-2">
      {active ? (
        <>
          <span className="font-mono text-lg font-bold text-zinc-900">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <button
            onClick={stop}
            className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
          >
            Skip
          </button>
        </>
      ) : (
        <button
          onClick={start}
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
        >
          Rest {seconds}s
        </button>
      )}
    </div>
  );
}
