"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Exercise, WorkoutExercise } from "@/lib/api/types";
import type { TemplateExercisePayload } from "@/lib/api/endpoints/workout-templates";
import { useLocale } from "@/lib/i18n/context";
import { WorkoutExerciseList } from "@/components/domain/workout-exercise-list";
import type { WorkoutExerciseFormValues } from "@/components/domain/workout-exercise-form";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";

const POSITIONS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface TemplateEditorProps {
  heading: string;
  initialName: string;
  initialExercises: WorkoutExercise[];
  /** Persists the draft and resolves to the saved template's id. */
  onSave: (draft: { name: string; workout_exercises: TemplateExercisePayload[] }) => Promise<number>;
}

// The server numbers positions from the order of the list, so the exercises
// are sent in position order and the letters here only keep the draft sorted.
function toPayload(items: WorkoutExercise[]): TemplateExercisePayload[] {
  return [...items]
    .sort((a, b) => a.position.localeCompare(b.position))
    .map((item) => ({
      exercise_id: item.exercise.id,
      sets: item.sets,
      reps: item.reps,
      rest_seconds: item.rest_seconds,
      rir: item.rir,
      // The API serializes decimals as strings, the form produces numbers;
      // normalised so reading a value back does not look like an edit.
      weight: item.weight == null ? null : Number(item.weight),
      notes: item.notes,
    }));
}

function snapshot(name: string, items: WorkoutExercise[]): string {
  return JSON.stringify({ name: name.trim(), exercises: toPayload(items) });
}

/**
 * Create or edit a workout template as a draft. Nothing is sent until Save:
 * adds, edits, removals and the name all change local state only, and Save
 * writes the whole result at once (the API applies it atomically). Leaving
 * with changes asks first; going back without saving discards them.
 *
 * The browser's own back button cannot be intercepted here, so it discards
 * silently, like any form; the in-app links, Cancel, reload and closing the
 * tab all ask.
 */
export function TemplateEditor({ heading, initialName, initialExercises, onSave }: TemplateEditorProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [items, setItems] = useState<WorkoutExercise[]>(initialExercises);
  const [baseline] = useState(() => snapshot(initialName, initialExercises));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasOpenEdit, setHasOpenEdit] = useState(false);
  // Drafted exercises have no id until the server saves them; negative ones
  // cannot clash with real ones and are never sent.
  const nextTempId = useRef(-1);

  const dirty = snapshot(name, items) !== baseline;
  const canSave = dirty && name.trim() !== "" && !saving && !hasOpenEdit;

  // While there is something to lose: ask before the page unloads (reload,
  // closing the tab, an external link) and before an in-app link navigates
  // away (the Back link and the sidebar alike, caught in the capture phase
  // ahead of the router).
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || e.defaultPrevented) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (!confirm(t("templates.discardConfirm"))) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, t]);

  const handleAdd = async (exercise: Exercise) => {
    const used = new Set(items.map((item) => item.position));
    const position = POSITIONS.find((letter) => !used.has(letter));
    if (!position) {
      setError(t("templates.tooManyExercises"));
      return false;
    }
    setError(null);
    setItems((current) => [
      ...current,
      {
        id: nextTempId.current--,
        position,
        sets: 3,
        reps: 10,
        rest_seconds: 90,
        rir: null,
        weight: null,
        notes: null,
        exercise,
      },
    ]);
    return true;
  };

  const handleUpdate = async (id: number, data: WorkoutExerciseFormValues) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              sets: data.sets,
              reps: data.reps,
              rest_seconds: data.rest_seconds,
              rir: data.rir,
              weight: data.weight,
              notes: data.notes,
            }
          : item
      )
    );
    return true;
  };

  const handleRemove = async (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
    return true;
  };

  const handleCancel = () => {
    if (dirty && !confirm(t("templates.discardConfirm"))) return;
    router.push("/coach/templates");
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const id = await onSave({ name: name.trim(), workout_exercises: toPayload(items) });
      router.push(`/coach/templates?saved=${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("templates.saveFailed"));
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/coach/templates"
          className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-700"
        >
          &larr; {t("templates.back")}
        </Link>
        <h1 className="text-sm font-medium uppercase tracking-wider text-zinc-500">{heading}</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("templates.namePlaceholder")}
          aria-label={t("templates.nameLabel")}
          autoFocus={initialName === ""}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-xl font-semibold text-zinc-900"
        />
        <p className="mt-2 text-sm text-zinc-500">{t("templates.detailHint")}</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={!canSave}>
          {saving ? t("common.working") : t("templates.save")}
        </Button>
        <Button variant="secondary" onClick={handleCancel} disabled={saving}>
          {t("common.cancel")}
        </Button>
        {hasOpenEdit ? (
          <span className="text-xs text-zinc-500">{t("templates.finishEditing")}</span>
        ) : dirty ? (
          <span className="text-xs font-medium text-amber-700">{t("templates.unsaved")}</span>
        ) : (
          <span className="text-xs text-zinc-400">{t("templates.noChanges")}</span>
        )}
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onDismiss={() => setError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      <WorkoutExerciseList
        exercises={items}
        busy={saving}
        emptyMessage={t("templates.noExercises")}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onRemove={handleRemove}
        onEditingChange={setHasOpenEdit}
      />
    </div>
  );
}
