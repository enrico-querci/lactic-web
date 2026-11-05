"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createClientProfile,
  updateClientProfile,
  type ClientProfileInput,
} from "@/lib/api/endpoints/client-profiles";
import { inviteClient } from "@/lib/api/endpoints/clients";
import { ApiError } from "@/lib/api/client";
import type { ClientGoal, ClientLevel, ClientProfile } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/messages/en";
import { useUnsavedChangesGuard } from "@/lib/hooks/use-unsaved-changes-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const LEVELS: ClientLevel[] = ["beginner", "intermediate", "advanced"];
const GOALS: ClientGoal[] = ["strength", "muscle_gain", "fat_loss", "health", "other"];

const LEVEL_KEY: Record<ClientLevel, MessageKey> = {
  beginner: "clients.level.beginner",
  intermediate: "clients.level.intermediate",
  advanced: "clients.level.advanced",
};
const GOAL_KEY: Record<ClientGoal, MessageKey> = {
  strength: "clients.goal.strength",
  muscle_gain: "clients.goal.muscle_gain",
  fat_loss: "clients.goal.fat_loss",
  health: "clients.goal.health",
  other: "clients.goal.other",
};

interface Values {
  name: string;
  email: string;
  phone: string;
  level: ClientLevel | "";
  goal: ClientGoal | "";
  limitations: string;
  notes: string;
}

function toValues(profile: ClientProfile | null): Values {
  return {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    level: profile?.level ?? "",
    goal: profile?.goal ?? "",
    limitations: profile?.limitations ?? "",
    notes: profile?.notes ?? "",
  };
}

function toInput(values: Values): ClientProfileInput {
  const optional = (value: string) => value.trim() || null;
  return {
    name: values.name.trim(),
    email: optional(values.email),
    phone: optional(values.phone),
    level: values.level || null,
    goal: values.goal || null,
    limitations: optional(values.limitations),
    notes: optional(values.notes),
  };
}

interface ClientProfileEditorProps {
  /** Null for a new client. */
  profile: ClientProfile | null;
  /**
   * Kept apart from `profile` so a status change (an invitation resent or
   * revoked on the page around this form) does not reset what is being typed.
   */
  status: ClientProfile["status"] | "new";
}

/**
 * The client's details as a form with an explicit Save. For someone not yet
 * invited it also offers Save and invite, so a coach can add a client and
 * invite them in one step. Nothing is written until a button is pressed;
 * leaving with changes asks first.
 */
export function ClientProfileEditor({ profile, status }: ClientProfileEditorProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => toValues(profile));
  const [baseline, setBaseline] = useState(() => JSON.stringify(toInput(toValues(profile))));
  // The client as last saved. Once the first save succeeds a retry (after a
  // failed invitation, say) updates this client instead of creating a second.
  const [saved, setSaved] = useState<ClientProfile | null>(profile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const input = toInput(values);
  const dirty = JSON.stringify(input) !== baseline;
  const canSave = dirty && input.name !== "" && !busy;
  // Invited and active people are managed from the page around this form.
  const canInvite = (status === "new" || status === "prepared") && input.name !== "" && input.email !== null && !busy;
  const emailLocked = status === "invited" || status === "active";

  useUnsavedChangesGuard(dirty, t("clients.discardConfirm"));

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const save = async (): Promise<ClientProfile> => {
    // The email is fixed once invited, so it is not sent then.
    const data = emailLocked ? { ...input, email: undefined } : input;
    const result = saved
      ? await updateClientProfile(saved.id, data)
      : await createClientProfile(input);
    setSaved(result);
    setBaseline(JSON.stringify(input));
    return result;
  };

  const run = async (invite: boolean) => {
    setBusy(true);
    setError(null);
    setLimitReached(false);

    let current: ClientProfile;
    try {
      current = dirty || !saved ? await save() : saved;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("clients.saveFailed"));
      setBusy(false);
      return;
    }

    if (invite) {
      try {
        await inviteClient(current.email as string);
      } catch (e) {
        setLimitReached(e instanceof ApiError && e.status === 402);
        setError(
          t("clients.savedNotInvited", {
            reason: e instanceof Error ? e.message : t("clients.inviteFailed"),
          })
        );
        setBusy(false);
        return;
      }
    }

    router.push(`/coach/clients?saved=${current.id}${invite ? "&invited=1" : ""}`);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSave) run(false);
  };

  const handleCancel = () => {
    if (dirty && !confirm(t("clients.discardConfirm"))) return;
    router.push("/coach/clients");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          {limitReached && (
            <Link href="/coach/billing" className="shrink-0 font-medium underline">
              {t("billing.upgrade")}
            </Link>
          )}
        </div>
      )}

      <Input
        id="client-name"
        label={t("clients.form.name")}
        value={values.name}
        onChange={(e) => set("name", e.target.value)}
        autoFocus={!profile}
        maxLength={100}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Input
            id="client-email"
            label={t("clients.form.email")}
            type="email"
            autoComplete="off"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            disabled={emailLocked}
            placeholder="client@example.com"
          />
          <p className="mt-1 text-xs text-zinc-500">
            {emailLocked ? t("clients.form.emailLocked") : t("clients.form.emailHelp")}
          </p>
        </div>
        <Input
          id="client-phone"
          label={t("clients.form.phone")}
          type="tel"
          autoComplete="off"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          maxLength={40}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="client-level"
          label={t("clients.form.level")}
          value={values.level}
          onChange={(e) => set("level", e.target.value as ClientLevel | "")}
          options={[
            { value: "", label: t("clients.form.notSet") },
            ...LEVELS.map((level) => ({ value: level, label: t(LEVEL_KEY[level]) })),
          ]}
        />
        <Select
          id="client-goal"
          label={t("clients.form.goal")}
          value={values.goal}
          onChange={(e) => set("goal", e.target.value as ClientGoal | "")}
          options={[
            { value: "", label: t("clients.form.notSet") },
            ...GOALS.map((goal) => ({ value: goal, label: t(GOAL_KEY[goal]) })),
          ]}
        />
      </div>

      <div>
        <label htmlFor="client-limitations" className="mb-1 block text-sm font-medium text-zinc-700">
          {t("clients.form.limitations")}
        </label>
        <textarea
          id="client-limitations"
          value={values.limitations}
          onChange={(e) => set("limitations", e.target.value)}
          rows={2}
          maxLength={2000}
          placeholder={t("clients.form.limitationsPlaceholder")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-500">{t("clients.form.limitationsHelp")}</p>
      </div>

      <div>
        <label htmlFor="client-notes" className="mb-1 block text-sm font-medium text-zinc-700">
          {t("common.notes")}
        </label>
        <textarea
          id="client-notes"
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder={t("clients.form.notesPlaceholder")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" disabled={!canSave}>
          {busy ? t("common.working") : t("common.save")}
        </Button>
        {canInvite && (
          <Button type="button" variant="secondary" onClick={() => run(true)}>
            {t("clients.saveAndInvite")}
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={handleCancel} disabled={busy}>
          {t("common.cancel")}
        </Button>
        {dirty && <span className="text-xs font-medium text-amber-700">{t("templates.unsaved")}</span>}
      </div>
    </form>
  );
}
