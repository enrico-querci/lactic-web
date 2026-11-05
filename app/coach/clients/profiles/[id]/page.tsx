"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { deleteClientProfile, getClientProfile } from "@/lib/api/endpoints/client-profiles";
import {
  removeClient,
  resendClientInvitation,
  revokeClientInvitation,
} from "@/lib/api/endpoints/clients";
import { useAsync } from "@/lib/hooks/use-async";
import { useLocale } from "@/lib/i18n/context";
import {
  CLIENT_STATUS_KEY,
  CLIENT_STATUS_NOTE_KEY,
  CLIENT_STATUS_STYLE,
} from "@/lib/constants/client-status";
import { formatDateTime } from "@/lib/utils/format";
import { ClientProfileEditor } from "@/components/domain/client-profile-editor";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ErrorState } from "@/components/ui/error-state";
import { Loading } from "@/components/ui/loading";

export default function ClientProfilePage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const params = useParams();
  const profileId = Number(params.id);

  const query = useAsync(
    `client-profile-${profileId}`,
    useCallback(() => getClientProfile(profileId), [profileId])
  );
  const profile = query.data;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const act = async (fn: () => Promise<void>, fallback: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : fallback);
    } finally {
      setBusy(false);
    }
  };

  if (query.initial) return <Loading />;
  if (query.error)
    return (
      <ErrorState message={query.error} onRetry={query.reload} retryLabel={t("common.retry")} />
    );
  if (!profile) return <div>{t("clients.notFound")}</div>;

  const handleResend = () =>
    act(async () => {
      await resendClientInvitation(profile.invitation_id as number);
      setNotice(t("clients.invitationResent", { email: profile.email ?? "" }));
      query.reload();
    }, t("clients.resendFailed"));

  const handleRevoke = () => {
    if (!confirm(t("clients.confirmRevoke", { email: profile.email ?? "" }))) return;
    return act(async () => {
      await revokeClientInvitation(profile.invitation_id as number);
      query.reload();
    }, t("clients.revokeFailed"));
  };

  const handleRemoveClient = () => {
    if (!confirm(t("clients.confirmRemove", { name: profile.name }))) return;
    return act(async () => {
      await removeClient(profile.user_id as number);
      query.reload();
    }, t("clients.removeFailed"));
  };

  const handleDelete = () => {
    if (!confirm(t("clients.confirmDeleteProfile", { name: profile.name }))) return;
    return act(async () => {
      await deleteClientProfile(profile.id);
      router.push("/coach/clients");
    }, t("clients.deleteFailed"));
  };

  return (
    <div className="max-w-2xl">
      <Link href="/coach/clients" className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-700">
        &larr; {t("clients.back")}
      </Link>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900">{profile.name}</h1>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${CLIENT_STATUS_STYLE[profile.status]}`}>
          {t(CLIENT_STATUS_KEY[profile.status])}
        </span>
      </div>

      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} dismissLabel={t("common.dismiss")} />
      )}
      {notice && (
        <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>
      )}

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-600">{t(CLIENT_STATUS_NOTE_KEY[profile.status])}</p>
        {profile.status === "invited" && profile.invitation_expires_at && (
          <p className="mt-1 text-xs text-zinc-500">
            {t("clients.expires")}: {formatDateTime(profile.invitation_expires_at, locale)}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.status === "active" && profile.user_id && (
            <>
              <Link href={`/coach/clients/${profile.user_id}`}>
                <Button size="sm">{t("clients.progress")}</Button>
              </Link>
              <Button size="sm" variant="secondary" disabled={busy} onClick={handleRemoveClient}>
                {t("clients.removeAsClient")}
              </Button>
            </>
          )}
          {profile.status === "invited" && (
            <>
              <Button size="sm" variant="secondary" disabled={busy} onClick={handleResend}>
                {t("clients.resend")}
              </Button>
              <Button size="sm" variant="secondary" disabled={busy} onClick={handleRevoke}>
                {t("clients.revoke")}
              </Button>
            </>
          )}
          {profile.status !== "active" && (
            <Button size="sm" variant="danger" disabled={busy} onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          )}
        </div>
      </div>

      <ClientProfileEditor key={profile.id} profile={profile} status={profile.status} />
    </div>
  );
}
