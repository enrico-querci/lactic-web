"use client";

import { useEffect, useState } from "react";
import { getObjectUrl } from "@/lib/api/client";
import { useLocale } from "@/lib/i18n/context";

interface ExerciseAnimationProps {
  /** Lactic path from the API. Never a provider URL. */
  animationUrl: string | null;
  alt: string;
}

/**
 * Renders an exercise animation.
 *
 * An <img src> cannot attach the JWT, so the bytes are fetched as an
 * authenticated blob and shown through an object URL, which is revoked on
 * unmount and whenever the source changes. Without that revoke, browsing a
 * catalog would retain every animation viewed for the life of the document.
 *
 * Only mount this for an exercise the coach is actually looking at. Rendering
 * it per row would fetch one animation per row, and each fetch costs a request
 * against the provider's monthly quota.
 *
 * NOTE: the endpoint this calls is Stage 4 and does not exist yet, so today
 * this reliably lands in the error state. That state is real and worth having:
 * the provider can fail, and the plan requires a retry path.
 */
export function ExerciseAnimation({ animationUrl, alt }: ExerciseAnimationProps) {
  const { t } = useLocale();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!animationUrl) return;

    let cancelled = false;
    let created: string | null = null;

    getObjectUrl(animationUrl)
      .then((url) => {
        if (cancelled) {
          // The component went away mid-flight; release it immediately rather
          // than handing it to state nobody will clean up.
          URL.revokeObjectURL(url);
          return;
        }
        created = url;
        setObjectUrl(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
      setObjectUrl(null);
    };
  }, [animationUrl, attempt]);

  const retry = () => {
    setFailed(false);
    setAttempt((n) => n + 1);
  };

  if (!animationUrl) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md bg-zinc-100 text-sm text-zinc-400">
        {t("exercise.noAnimation")}
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-md bg-zinc-100 text-sm text-zinc-500">
        <span>{t("exercise.animationUnavailable")}</span>
        <button
          type="button"
          onClick={retry}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div
        className="flex h-48 items-center justify-center rounded-md bg-zinc-100 text-sm text-zinc-400"
        role="status"
        aria-live="polite"
      >
        {t("exercise.loadingAnimation")}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={objectUrl}
      alt={alt}
      className="h-48 w-full rounded-md bg-zinc-100 object-contain"
    />
  );
}
