"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/api/endpoints/client-account";
import { useAuth } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { t } = useLocale();
  const { logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!confirm(t("settings.confirmDeleteAccount"))) return;

    setError(null);
    setDeleting(true);
    try {
      await deleteAccount();
      await logout();
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : t("settings.deleteAccountFailed"));
      setDeleting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{t("settings.title")}</h1>

      <section className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-900">{t("settings.dangerZone")}</h2>
        <p className="mt-1 text-sm text-red-700">{t("settings.deleteAccountDescription")}</p>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <Button
          variant="danger"
          size="sm"
          className="mt-3"
          disabled={deleting}
          onClick={handleDeleteAccount}
        >
          {deleting ? t("common.working") : t("settings.deleteAccount")}
        </Button>
      </section>
    </div>
  );
}
