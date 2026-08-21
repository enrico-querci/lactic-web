"use client";

import { useCallback, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProgram, updateProgram } from "@/lib/api/endpoints/programs";
import type { Program } from "@/lib/api/types";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function EditProgramPage() {
  const { t } = useLocale();
  const params = useParams();
  const programId = Number(params.id);

  const query = useAsync(
    String(programId),
    useCallback(() => getProgram(programId), [programId])
  );

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );
  if (!query.data) return <div>{t("program.notFound")}</div>;

  // A separate component rather than an effect seeding local state: this
  // only mounts once query.data actually exists, so useState(program.name)
  // seeds correctly on its one and only mount — no synchronous setState in
  // an effect, which is the exact pattern lib/hooks/use-async.ts's own
  // comments call out as rejected by React's set-state-in-effect rule (and
  // the linter here confirms it — this used to be a useEffect until it did).
  return <EditProgramForm programId={programId} program={query.data} />;
}

function EditProgramForm({
  programId,
  program,
}: {
  programId: number;
  program: Program;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [name, setName] = useState(program.name);
  const [description, setDescription] = useState(program.description || "");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError(null);
    try {
      await updateProgram(programId, { name, description });
      router.push(`/coach/programs/${programId}`);
    } catch (err) {
      setSaving(false);
      setSubmitError(err instanceof Error ? err.message : t("program.saveFailed"));
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{t("program.editTitle")}</h1>

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
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? t("common.saving") : t("common.saveChanges")}
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
