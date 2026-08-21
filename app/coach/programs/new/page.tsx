"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProgram } from "@/lib/api/endpoints/programs";
import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function NewProgramPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError(null);
    try {
      const program = await createProgram({ name, description });
      router.push(`/coach/programs/${program.id}`);
    } catch (err) {
      setSaving(false);
      setSubmitError(err instanceof Error ? err.message : t("program.createFailed"));
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{t("program.newProgram")}</h1>

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
          placeholder={t("program.namePlaceholderExample")}
        />
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            {t("common.description")}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder={t("program.descriptionPlaceholder")}
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? t("common.creating") : t("program.create")}
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
