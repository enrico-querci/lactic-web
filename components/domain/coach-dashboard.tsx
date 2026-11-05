"use client";

import Link from "next/link";
import type { AttentionItem, CoachDashboard } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/messages/en";
import { formatRelativeTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";

const QUICK_ACTIONS: { href: string; labelKey: MessageKey }[] = [
  { href: "/coach/clients/new", labelKey: "dashboard.action.addClient" },
  { href: "/coach/programs/new", labelKey: "dashboard.action.newProgram" },
  { href: "/coach/assignments/new", labelKey: "dashboard.action.assignProgram" },
  { href: "/coach/templates/new", labelKey: "dashboard.action.newWorkout" },
];

function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: number;
  hint?: string;
  href?: string;
  tone?: "default" | "warning";
}) {
  const body = (
    <div className="h-full rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${tone === "warning" ? "text-amber-600" : "text-zinc-900"}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

/** The sentence for one thing that needs attention, in the coach's language. */
function attentionText(item: AttentionItem, t: ReturnType<typeof useLocale>["t"]): string {
  const days = item.days ?? 0;
  const params = { name: item.name, days };

  switch (item.kind) {
    case "inactive":
      return t(item.never_trained ? "dashboard.attention.neverTrained" : "dashboard.attention.inactive", params);
    case "program_ended":
      if (days === 0) return t("dashboard.attention.programEndedToday", params);
      return t(days === 1 ? "dashboard.attention.programEndedYesterday" : "dashboard.attention.programEnded", params);
    case "program_ending":
      return t(days === 1 ? "dashboard.attention.programEndsTomorrow" : "dashboard.attention.programEnding", params);
    case "no_program":
      return t("dashboard.attention.noProgram", params);
    case "invitation_expired":
      return t("dashboard.attention.invitationExpired", params);
    case "invitation_expiring":
      return t("dashboard.attention.invitationExpiring", params);
  }
}

/** Where an attention item leads, and what the link says. */
function attentionTarget(item: AttentionItem): { href: string; labelKey: MessageKey } {
  switch (item.kind) {
    case "inactive":
      return { href: `/coach/clients/${item.client_id}`, labelKey: "dashboard.attention.viewProgress" };
    case "program_ended":
    case "program_ending":
    case "no_program":
      return { href: "/coach/assignments/new", labelKey: "dashboard.attention.assign" };
    case "invitation_expired":
    case "invitation_expiring":
      return {
        href: item.profile_id ? `/coach/clients/profiles/${item.profile_id}` : "/coach/clients",
        labelKey: "dashboard.attention.open",
      };
  }
}

function greetingKey(hour: number): MessageKey {
  if (hour < 12) return "dashboard.greeting.morning";
  if (hour < 18) return "dashboard.greeting.afternoon";
  return "dashboard.greeting.evening";
}

export function CoachDashboardView({ data }: { data: CoachDashboard }) {
  const { t, locale } = useLocale();
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] ?? "";
  const { clients, sessions } = data;

  const weekDelta = sessions.this_week - sessions.last_week;
  const weekHint =
    weekDelta === 0
      ? t("dashboard.sameAsLastWeek")
      : t("dashboard.vsLastWeek", { delta: weekDelta > 0 ? `+${weekDelta}` : `${weekDelta}` });

  // Shown only when it matters: one slot left, or none.
  const nearLimit = clients.limit !== null && clients.slots_used >= clients.limit - 1;
  const atLimit = clients.limit !== null && clients.slots_used >= clients.limit;
  const hiddenAttention = data.attention_total - data.attention.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          {t(greetingKey(new Date().getHours()), { name: firstName })}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t("dashboard.subtitle")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action, index) => (
            <Link key={action.href} href={action.href}>
              <Button size="sm" variant={index === 0 ? "primary" : "secondary"}>
                {t(action.labelKey)}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.stat.activeClients")}
          value={clients.active}
          hint={clients.limit !== null ? t("dashboard.stat.slotsUsed", { used: clients.slots_used, limit: clients.limit }) : undefined}
          href="/coach/clients"
        />
        <StatCard label={t("dashboard.stat.workoutsThisWeek")} value={sessions.this_week} hint={weekHint} />
        <StatCard
          label={t("dashboard.stat.inactiveClients")}
          value={data.inactive_clients}
          hint={t("dashboard.stat.inactiveHint")}
          tone={data.inactive_clients > 0 ? "warning" : "default"}
        />
        <StatCard
          label={t("dashboard.stat.pendingInvitations")}
          value={data.pending_invitations}
          hint={t("dashboard.stat.pendingHint")}
          href="/coach/clients"
        />
      </div>

      {nearLimit && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            {atLimit
              ? t("dashboard.plan.full", { limit: clients.limit as number })
              : t("dashboard.plan.almostFull", { used: clients.slots_used, limit: clients.limit as number })}
          </span>
          <Link href="/coach/billing" className="shrink-0 font-medium underline">
            {t("billing.upgrade")}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white">
          <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-900">
            {t("dashboard.attention.title")}
          </h2>
          {data.attention.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500">{t("dashboard.attention.allGood")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {data.attention.map((item, index) => {
                const target = attentionTarget(item);
                return (
                  <li key={`${item.kind}-${item.client_id ?? item.name}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                      <p className="text-sm text-zinc-700">{attentionText(item, t)}</p>
                    </div>
                    <Link
                      href={target.href}
                      className="shrink-0 text-xs font-medium text-zinc-700 underline hover:text-zinc-900"
                    >
                      {t(target.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {hiddenAttention > 0 && (
            <Link
              href="/coach/clients"
              className="block border-t border-zinc-100 px-4 py-3 text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              {t("dashboard.attention.more", { count: hiddenAttention })}
            </Link>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-900">
            {t("dashboard.activity.title")}
          </h2>
          {data.recent_activity.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-500">{t("dashboard.activity.none")}</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {data.recent_activity.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/coach/clients/${entry.client_id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50"
                  >
                    <p className="min-w-0 text-sm text-zinc-700">
                      {t("dashboard.activity.completed", { name: entry.client_name, workout: entry.workout_name })}
                    </p>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {formatRelativeTime(entry.completed_at, locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
