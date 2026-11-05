"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getWorkoutTemplate, updateWorkoutTemplate } from "@/lib/api/endpoints/workout-templates";
import {
  createTemplateExercise,
  updateTemplateExercise,
  deleteTemplateExercise,
} from "@/lib/api/endpoints/workout-template-exercises";
import type { Exercise } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { WorkoutExerciseList } from "@/components/domain/workout-exercise-list";
import type { WorkoutExerciseFormValues } from "@/components/domain/workout-exercise-form";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function TemplateDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const templateId = Number(params.id);

  const query = useAsync(
    `template-${templateId}`,
    useCallback(() => getWorkoutTemplate(templateId), [templateId])
  );
  const template = query.data;
  const [mutating, setMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  // Same shape as the workout page's: each handler applies the response to
  // the loaded template instead of refetching it, and resolves to whether it
  // worked so the exercise list knows whether to close its form.
  const runMutation = async (fn: () => Promise<void>): Promise<boolean> => {
    setMutating(true);
    setActionError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t("program.actionFailed"));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const startRename = () => {
    setNameDraft(template?.name ?? "");
    setRenaming(true);
  };

  const handleRename = async () => {
    const name = nameDraft.trim();
    if (!name) return;
    const ok = await runMutation(async () => {
      const updated = await updateWorkoutTemplate(templateId, { name });
      query.mutate((current) => ({ ...current!, name: updated.name }));
    });
    if (ok) setRenaming(false);
  };

  // No position is sent: the API gives a new exercise the next free letter,
  // which stays correct after one in the middle has been removed.
  const handleAddExercise = (exercise: Exercise) =>
    runMutation(async () => {
      const added = await createTemplateExercise(templateId, {
        exercise_id: exercise.id,
        sets: 3,
        reps: 10,
        rest_seconds: 90,
      });
      query.mutate((current) => ({
        ...current!,
        workout_exercises: [...current!.workout_exercises, added],
        exercise_count: current!.exercise_count + 1,
      }));
    });

  const handleUpdateExercise = (exerciseId: number, data: WorkoutExerciseFormValues) =>
    runMutation(async () => {
      const updated = await updateTemplateExercise(templateId, exerciseId, data);
      query.mutate((current) => ({
        ...current!,
        workout_exercises: current!.workout_exercises.map((we) =>
          we.id === exerciseId ? updated : we
        ),
      }));
    });

  const handleRemoveExercise = (exerciseId: number) =>
    runMutation(async () => {
      await deleteTemplateExercise(templateId, exerciseId);
      query.mutate((current) => ({
        ...current!,
        workout_exercises: current!.workout_exercises.filter((we) => we.id !== exerciseId),
        exercise_count: current!.exercise_count - 1,
      }));
    });

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );
  if (!template) return <div>{t("templates.notFound")}</div>;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/coach/templates"
          className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-700"
        >
          &larr; {t("templates.back")}
        </Link>

        {renaming ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRename();
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              aria-label={t("templates.nameLabel")}
              autoFocus
              className="min-w-[14rem] flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-lg font-semibold"
            />
            <Button type="submit" size="sm" disabled={mutating || !nameDraft.trim()}>
              {t("common.save")}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setRenaming(false)}>
              {t("common.cancel")}
            </Button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">{template.name}</h1>
            <Button size="sm" variant="secondary" onClick={startRename} disabled={mutating}>
              {t("templates.rename")}
            </Button>
          </div>
        )}
        <p className="mt-1 text-sm text-zinc-500">{t("templates.detailHint")}</p>
      </div>

      {actionError && (
        <ErrorBanner
          message={actionError}
          onDismiss={() => setActionError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      <WorkoutExerciseList
        exercises={template.workout_exercises}
        busy={mutating}
        emptyMessage={t("templates.noExercises")}
        onAdd={handleAddExercise}
        onUpdate={handleUpdateExercise}
        onRemove={handleRemoveExercise}
      />
    </div>
  );
}
