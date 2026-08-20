"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/lib/i18n/context";

// No role-specific nav is available here (a 404 can be hit before login, or
// from a stale/mistyped link outside app/coach or app/client, neither of
// which has its own not-found.tsx), so "/" is the one link guaranteed to go
// somewhere useful — it already routes to /login, /coach/programs, or
// /client/programs based on auth state (see app/page.tsx).
export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <EmptyState message={t("notFound.message")} />
      <Link
        href="/"
        className="mt-2 inline-block text-sm text-zinc-500 underline hover:text-zinc-700"
      >
        {t("notFound.goBack")}
      </Link>
    </div>
  );
}
