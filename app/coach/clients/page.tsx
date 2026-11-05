"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getClientProfiles } from "@/lib/api/endpoints/client-profiles";
import {
  getClientInvitations,
  inviteClient,
  resendClientInvitation,
  revokeClientInvitation,
} from "@/lib/api/endpoints/clients";
import { ApiError } from "@/lib/api/client";
import type { ClientInvitation, ClientProfile } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/messages/en";
import { CLIENT_STATUS_KEY, CLIENT_STATUS_STYLE } from "@/lib/constants/client-status";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";

const INVITATION_STATUS_KEY: Record<ClientInvitation["status"], MessageKey> = {
  pending: "invite.status.pending",
  expired: "invite.status.expired",
  accepted: "invite.status.accepted",
  revoked: "invite.status.revoked",
};

/**
 * Confirmation after a client is saved, which comes back here with
 * ?saved=<id> (and &invited=1 when an invitation went out with it).
 * useSearchParams rather than window.location because the URL only updates
 * after a client-side navigation has rendered; it needs the Suspense
 * boundary around it for the static page.
 */
function SavedNotice({ profiles }: { profiles: ClientProfile[] }) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const savedId = Number(searchParams.get("saved"));
  const profile = savedId ? profiles.find((item) => item.id === savedId) : undefined;
  if (!profile || dismissed) return null;

  const invited = searchParams.get("invited") === "1";
  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-between gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      <span>
        {invited
          ? t("clients.savedAndInvited", { name: profile.name, email: profile.email ?? "" })
          : t("clients.saved", { name: profile.name })}
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md border border-green-300 bg-white px-3 py-1 text-xs font-medium hover:bg-green-50"
      >
        {t("common.dismiss")}
      </button>
    </div>
  );
}

export default function ClientsPage() {
  const { t, locale } = useLocale();
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Shared by every action below, so a 402 from any of them shows the
  // upgrade CTA and any other error clears it.
  const reportError = (err: unknown, fallback: string) => {
    setLimitReached(err instanceof ApiError && err.status === 402);
    setError(err instanceof Error ? err.message : fallback);
  };

  const load = useCallback(
    () =>
      Promise.all([getClientProfiles(), getClientInvitations()]).then(
        ([profileData, invitationData]) => {
          setProfiles(profileData);
          setInvitations(invitationData);
        }
      ),
    []
  );

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : t("clients.loadFailed")))
      .finally(() => setLoading(false));
  }, [load, t]);

  const act = async (key: string, fn: () => Promise<void>, fallback: string) => {
    setBusyKey(key);
    setError(null);
    setLimitReached(false);
    setNotice(null);
    try {
      await fn();
    } catch (err) {
      reportError(err, fallback);
    } finally {
      setBusyKey(null);
    }
  };

  const handleInvite = (profile: ClientProfile) =>
    act(
      `profile-${profile.id}`,
      async () => {
        await inviteClient(profile.email as string);
        await load();
        setNotice(t("clients.invitationSent", { email: profile.email as string }));
      },
      t("clients.inviteFailed")
    );

  const handleResend = (invitationId: number, email: string, key: string) =>
    act(
      key,
      async () => {
        await resendClientInvitation(invitationId);
        await load();
        setNotice(t("clients.invitationResent", { email }));
      },
      t("clients.resendFailed")
    );

  const handleRevoke = (invitation: ClientInvitation) => {
    if (!confirm(t("clients.confirmRevoke", { email: invitation.email }))) return;
    return act(
      `invitation-${invitation.id}`,
      async () => {
        await revokeClientInvitation(invitation.id);
        setInvitations((current) => current.filter((item) => item.id !== invitation.id));
      },
      t("clients.revokeFailed")
    );
  };

  // Invitations whose email has no profile: ones sent from the mobile apps.
  // Everything else shows as a status on the client's own row.
  const profileEmails = new Set(profiles.map((profile) => profile.email));
  const looseInvitations = invitations.filter((invitation) => !profileEmails.has(invitation.email));

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t("nav.clients")}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t("clients.subtitle")}</p>
        </div>
        <Link href="/coach/clients/new" className="shrink-0">
          <Button>{t("clients.addButton")}</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          {limitReached && (
            <Link href="/coach/billing" className="shrink-0 font-medium underline">
              {t("billing.upgrade")}
            </Link>
          )}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>
      )}
      <Suspense fallback={null}>
        <SavedNotice profiles={profiles} />
      </Suspense>

      <section>
        {profiles.length === 0 ? (
          <EmptyState message={t("clients.noClients")} />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-3 py-3 sm:px-6">{t("common.name")}</th>
                  <th className="px-3 py-3 sm:px-6">{t("common.status")}</th>
                  <th className="hidden px-3 py-3 sm:px-6 md:table-cell">{t("common.email")}</th>
                  <th className="px-3 py-3 text-right sm:px-6">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-zinc-50">
                    <td className="px-3 py-3 sm:px-6">
                      <Link
                        href={`/coach/clients/profiles/${profile.id}`}
                        className="text-sm font-medium text-zinc-900 hover:text-zinc-600"
                      >
                        {profile.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-sm sm:px-6">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${CLIENT_STATUS_STYLE[profile.status]}`}
                      >
                        {t(CLIENT_STATUS_KEY[profile.status])}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3 text-sm text-zinc-500 sm:px-6 md:table-cell">
                      {profile.email}
                    </td>
                    <td className="px-3 py-3 text-right sm:px-6">
                      {profile.status === "active" && profile.user_id && (
                        <Link href={`/coach/clients/${profile.user_id}`}>
                          <Button variant="secondary" size="sm">
                            {t("clients.progress")}
                          </Button>
                        </Link>
                      )}
                      {profile.status === "prepared" && profile.email && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busyKey === `profile-${profile.id}`}
                          onClick={() => handleInvite(profile)}
                        >
                          {t("clients.invite")}
                        </Button>
                      )}
                      {profile.status === "invited" && profile.invitation_id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busyKey === `profile-${profile.id}`}
                          onClick={() =>
                            handleResend(profile.invitation_id as number, profile.email as string, `profile-${profile.id}`)
                          }
                        >
                          {t("clients.resend")}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {looseInvitations.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">{t("clients.pendingInvitations")}</h2>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-3 py-3 sm:px-6">{t("common.email")}</th>
                  <th className="px-3 py-3 sm:px-6">{t("common.status")}</th>
                  <th className="hidden px-3 py-3 sm:px-6 md:table-cell">{t("clients.expires")}</th>
                  <th className="px-3 py-3 text-right sm:px-6">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {looseInvitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className="px-3 py-3 text-sm font-medium text-zinc-900 sm:px-6">{invitation.email}</td>
                    <td className="px-3 py-3 text-sm sm:px-6">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          invitation.status === "expired"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {t(INVITATION_STATUS_KEY[invitation.status])}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3 text-sm text-zinc-500 sm:px-6 md:table-cell">
                      {formatDateTime(invitation.expires_at, locale)}
                    </td>
                    <td className="px-3 py-3 text-right sm:px-6">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mr-2"
                        disabled={busyKey === `invitation-${invitation.id}`}
                        onClick={() => handleResend(invitation.id, invitation.email, `invitation-${invitation.id}`)}
                      >
                        {t("clients.resend")}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busyKey === `invitation-${invitation.id}`}
                        onClick={() => handleRevoke(invitation)}
                      >
                        {t("clients.revoke")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
