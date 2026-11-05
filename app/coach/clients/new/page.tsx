"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { ClientProfileEditor } from "@/components/domain/client-profile-editor";

/**
 * A new client exists only once saved, so abandoning this page leaves
 * nothing behind. They are not counted against the plan until invited.
 */
export default function NewClientPage() {
  const { t } = useLocale();

  return (
    <div className="max-w-2xl">
      <Link href="/coach/clients" className="mb-2 inline-block text-sm text-zinc-500 hover:text-zinc-700">
        &larr; {t("clients.back")}
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900">{t("clients.newTitle")}</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">{t("clients.newHint")}</p>

      <ClientProfileEditor profile={null} status="new" />
    </div>
  );
}
