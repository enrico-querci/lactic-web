"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { getPrograms } from "@/lib/api/endpoints/programs";
import { getClients } from "@/lib/api/endpoints/clients";
import { createProgramAssignment } from "@/lib/api/endpoints/program-assignments";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function NewAssignmentPage() {
  const { t } = useLocale();
  const router = useRouter();
  const query = useAsync(
    "assignment-form-data",
    useCallback(() => Promise.all([getPrograms(), getClients()]), [])
  );
  const [programs, clients] = query.data ?? [[], []];

  const [programId, setProgramId] = useState("");
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError(null);
    try {
      await createProgramAssignment({
        program_id: Number(programId),
        client_id: Number(clientId),
        start_date: startDate,
        notes: notes || undefined,
      });
      router.push("/coach/assignments");
    } catch (err) {
      setSaving(false);
      setSubmitError(
        err instanceof Error ? err.message : t("assignments.createFailed")
      );
    }
  };

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        {t("assignments.newAssignment")}
      </h1>

      {submitError && (
        <ErrorBanner
          message={submitError}
          onDismiss={() => setSubmitError(null)}
          dismissLabel={t("common.dismiss")}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("assignments.tableProgram")}
          </label>
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">{t("assignments.selectProgram")}</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("assignments.tableClient")}
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">{t("assignments.selectClient")}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("assignments.tableStartDate")}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t("assignments.notesOptionalLabel")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            placeholder={t("assignments.notesPlaceholder")}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={saving || !programId || !clientId || !startDate}
          >
            {saving ? t("common.creating") : t("assignments.createAssignment")}
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
