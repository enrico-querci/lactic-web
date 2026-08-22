"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  getClientInvitations,
  getClients,
  inviteClient,
  removeClient,
  resendClientInvitation,
  revokeClientInvitation,
} from "@/lib/api/endpoints/clients";
import { ApiError } from "@/lib/api/client";
import type { ClientInvitation, User } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/context";
import type { MessageKey } from "@/lib/i18n/messages/en";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";

const INVITATION_STATUS_KEY: Record<ClientInvitation["status"], MessageKey> = {
  pending: "invite.status.pending",
  expired: "invite.status.expired",
  accepted: "invite.status.accepted",
  revoked: "invite.status.revoked",
};

export default function ClientsPage() {
  const { t, locale } = useLocale();
  const [clients, setClients] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Shared by every action below, so a 402 from any of them shows the
  // upgrade CTA and any other error clears it.
  const reportError = (err: unknown, fallback: string) => {
    setLimitReached(err instanceof ApiError && err.status === 402);
    setError(err instanceof Error ? err.message : fallback);
  };

  useEffect(() => {
    Promise.all([getClients(), getClientInvitations()])
      .then(([clientData, invitationData]) => {
        setClients(clientData);
        setInvitations(invitationData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : t("clients.loadFailed"))
      )
      .finally(() => setLoading(false));
  }, [t]);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setLimitReached(false);
    setNotice(null);

    try {
      const invitation = await inviteClient(email);
      setInvitations((current) => [
        invitation,
        ...current.filter((item) => item.id !== invitation.id),
      ]);
      setEmail("");
      setInviteOpen(false);
      setNotice(t("clients.invitationSent", { email: invitation.email }));
    } catch (err) {
      reportError(err, t("clients.inviteFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (client: User) => {
    if (!confirm(t("clients.confirmRemove", { name: client.name }))) return;

    setError(null);
    setLimitReached(false);
    try {
      await removeClient(client.id);
      setClients((current) => current.filter((item) => item.id !== client.id));
    } catch (err) {
      reportError(err, t("clients.removeFailed"));
    }
  };

  const handleResend = async (invitation: ClientInvitation) => {
    setBusyId(invitation.id);
    setError(null);
    setLimitReached(false);
    setNotice(null);

    try {
      const updated = await resendClientInvitation(invitation.id);
      setInvitations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setNotice(t("clients.invitationResent", { email: updated.email }));
    } catch (err) {
      reportError(err, t("clients.resendFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const handleRevoke = async (invitation: ClientInvitation) => {
    if (!confirm(t("clients.confirmRevoke", { email: invitation.email }))) return;

    setBusyId(invitation.id);
    setError(null);
    setLimitReached(false);
    try {
      await revokeClientInvitation(invitation.id);
      setInvitations((current) =>
        current.filter((item) => item.id !== invitation.id)
      );
    } catch (err) {
      reportError(err, t("clients.revokeFailed"));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t("nav.clients")}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t("clients.subtitle")}</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>{t("clients.inviteButton")}</Button>
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
        <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          {t("clients.active")}
        </h2>
        {clients.length === 0 ? (
          <EmptyState message={t("clients.noneActive")} />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">{t("common.name")}</th>
                  <th className="px-6 py-3">{t("common.email")}</th>
                  <th className="px-6 py-3 text-right">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/coach/clients/${client.id}`}
                        className="text-sm font-medium text-zinc-900 hover:text-zinc-600"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-zinc-500">
                      {client.email}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link href={`/coach/clients/${client.id}`}>
                        <Button variant="secondary" size="sm" className="mr-2">
                          {t("clients.progress")}
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemove(client)}
                      >
                        {t("common.remove")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          {t("clients.pendingInvitations")}
        </h2>
        {invitations.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("clients.noPendingInvitations")}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">{t("common.email")}</th>
                  <th className="px-6 py-3">{t("common.status")}</th>
                  <th className="hidden px-6 py-3 md:table-cell">{t("clients.expires")}</th>
                  <th className="px-6 py-3 text-right">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-3 text-sm">
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
                    <td className="hidden px-6 py-3 text-sm text-zinc-500 md:table-cell">
                      {formatDateTime(invitation.expires_at, locale)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mr-2"
                        disabled={busyId === invitation.id}
                        onClick={() => handleResend(invitation)}
                      >
                        {t("clients.resend")}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busyId === invitation.id}
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
        )}
      </section>

      <Modal
        open={inviteOpen}
        onClose={() => !submitting && setInviteOpen(false)}
        title={t("clients.inviteModalTitle")}
      >
        <form onSubmit={handleInvite}>
          <p className="mb-4 text-sm text-zinc-500">{t("clients.inviteModalBody")}</p>
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
          <Input
            id="client-email"
            label={t("clients.emailAddressLabel")}
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="client@example.com"
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => setInviteOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("clients.sending") : t("clients.sendInvitation")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
