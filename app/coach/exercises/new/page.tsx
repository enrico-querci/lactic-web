"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExercise } from "@/lib/api/endpoints/exercises";
import { useLocale } from "@/lib/i18n/context";
import { MUSCLE_GROUP_OPTIONS } from "@/lib/constants/muscle-groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function NewExercisePage() {
  const { t } = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Chest");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError(null);
    try {
      await createExercise({
        name,
        muscle_group: muscleGroup,
        video_url: videoUrl || undefined,
        thumbnail_url: thumbnailUrl || undefined,
      });
      router.push("/coach/exercises");
    } catch (err) {
      setSaving(false);
      setSubmitError(err instanceof Error ? err.message : t("exercises.createFailed"));
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        {t("exercises.newCustomExercise")}
      </h1>

      {submitError && (
        <ErrorBanner
          message={submitError}
          onDismiss={() => setSubmitError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label={t("common.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder={t("exercises.namePlaceholderExample")}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("exercises.muscleGroupLabel")}
          </label>
          <select
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {MUSCLE_GROUP_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {t(g.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="videoUrl"
          label={t("exercises.videoUrlLabel")}
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://..."
        />
        <Input
          id="thumbnailUrl"
          label={t("exercises.thumbnailUrlLabel")}
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://..."
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? t("common.creating") : t("exercises.createExercise")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
