"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/lib/auth/guard";
import { useAuth } from "@/lib/auth/context";
import { useLocale } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import type { ReactNode } from "react";
import type { MessageKey } from "@/lib/i18n/messages/en";

const NAV_ITEMS: { href: string; labelKey: MessageKey }[] = [
  { href: "/client/programs", labelKey: "nav.programs" },
  { href: "/client/history", labelKey: "nav.history" },
  { href: "/client/settings", labelKey: "nav.settings" },
];

// "/client" prefixes every other route, so startsWith would mark Home active
// everywhere. It needs an exact match.
const HOME_HREF = "/client";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="client">
      <div className="min-h-screen bg-zinc-50">
        <TopNav />
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      </div>
    </RoleGuard>
  );
}

function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link href={HOME_HREF} className="shrink-0 text-lg font-bold text-zinc-900">
            Lactic
          </Link>
          <nav className="flex gap-3 sm:gap-4">
            <Link
              href={HOME_HREF}
              className={`text-sm font-medium ${
                pathname === HOME_HREF
                  ? "text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t("nav.home")}
            </Link>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium ${
                    isActive
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* The name is the first thing to go on a narrow screen: the client
            knows who they are, and "Log out" must stay reachable. */}
        <div className="flex shrink-0 items-center gap-3">
          <LanguageSwitcher />
          <span className="hidden text-sm text-zinc-500 sm:inline">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-zinc-600"
          >
            {t("nav.logOut")}
          </button>
        </div>
      </div>
    </header>
  );
}
