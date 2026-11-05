"use client";

import { createWorkoutTemplate } from "@/lib/api/endpoints/workout-templates";
import { useLocale } from "@/lib/i18n/context";
import { TemplateEditor } from "@/components/domain/template-editor";

/**
 * A new template exists only once it is saved: the page edits a draft and the
 * first request is the Save, so abandoning it leaves nothing behind.
 */
export default function NewTemplatePage() {
  const { t } = useLocale();

  return (
    <TemplateEditor
      heading={t("templates.newTitle")}
      initialName=""
      initialExercises={[]}
      onSave={async (draft) => (await createWorkoutTemplate(draft)).id}
    />
  );
}
