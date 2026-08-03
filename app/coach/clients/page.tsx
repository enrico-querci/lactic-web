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
import type { ClientInvitation, User } from "@/lib/api/types";
import { formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Modal } from "@/components/ui/modal";

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<ClientInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getClients(), getClientInvitations()])
      .then(([clientData, invitationData]) => {
        setClients(clientData);
        setInvitations(invitationData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load clients")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const invitation = await inviteClient(email);
      setInvitations((current) => [
        invitation,
        ...current.filter((item) => item.id !== invitation.id),
      ]);
      setEmail("");
      setInviteOpen(false);
      setNotice(`Invitation sent to ${invitation.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (client: User) => {
    if (!confirm(`Remove ${client.name} from your clients?`)) return;

    setError(null);
    try {
      await removeClient(client.id);
      setClients((current) => current.filter((item) => item.id !== client.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove client");
    }
  };

  const handleResend = async (invitation: ClientInvitation) => {
    setBusyId(invitation.id);
    setError(null);
    setNotice(null);

    try {
      const updated = await resendClientInvitation(invitation.id);
      setInvitations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setNotice(`Invitation resent to ${updated.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend invitation");
    } finally {
      setBusyId(null);
    }
  };

  const handleRevoke = async (invitation: ClientInvitation) => {
    if (!confirm(`Revoke the invitation for ${invitation.email}?`)) return;

    setBusyId(invitation.id);
    setError(null);
    try {
      await revokeClientInvitation(invitation.id);
      setInvitations((current) =>
        current.filter((item) => item.id !== invitation.id)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke invitation");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Clients</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Invite clients and manage the people training with you.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>Invite client</Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          Active clients
        </h2>
        {clients.length === 0 ? (
          <EmptyState message="No active clients yet" />
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3 text-right">Actions</th>
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
                          Progress
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemove(client)}
                      >
                        Remove
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
          Pending invitations
        </h2>
        {invitations.length === 0 ? (
          <p className="text-sm text-zinc-500">No pending invitations.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3 text-right">Actions</th>
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
                        {invitation.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-zinc-500">
                      {formatDateTime(invitation.expires_at)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mr-2"
                        disabled={busyId === invitation.id}
                        onClick={() => handleResend(invitation)}
                      >
                        Resend
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busyId === invitation.id}
                        onClick={() => handleRevoke(invitation)}
                      >
                        Revoke
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
        title="Invite a client"
      >
        <form onSubmit={handleInvite}>
          <p className="mb-4 text-sm text-zinc-500">
            They will receive a secure link and must sign in with this email
            address to join your client list.
          </p>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <Input
            id="client-email"
            label="Email address"
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
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
