"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { getWorkoutTemplate, updateWorkoutTemplate } from "@/lib/api/endpoints/workout-templates";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { TemplateEditor } from "@/components/domain/template-editor";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";

export default function TemplateDetailPage() {
  const { t } = useLocale();
  const params = useParams();
  const templateId = Number(params.id);

  const query = useAsync(
    `template-${templateId}`,
    useCallback(() => getWorkoutTemplate(templateId), [templateId])
  );
  const template = query.data;

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );
  if (!template) return <div>{t("templates.notFound")}</div>;

  return (
    <TemplateEditor
      key={template.id}
      heading={t("templates.editTitle")}
      initialName={template.name}
      initialExercises={template.workout_exercises}
      onSave={async (draft) => (await updateWorkoutTemplate(template.id, draft)).id}
    />
  );
}
