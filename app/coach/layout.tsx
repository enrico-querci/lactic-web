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
  { href: "/coach/programs", labelKey: "nav.programs" },
  { href: "/coach/clients", labelKey: "nav.clients" },
  { href: "/coach/exercises", labelKey: "nav.exercises" },
  { href: "/coach/assignments", labelKey: "nav.assignments" },
  { href: "/coach/templates", labelKey: "nav.templates" },
];

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="coach">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-zinc-50 p-8">{children}</main>
      </div>
    </RoleGuard>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-6 py-5">
        <h1 className="text-lg font-bold text-zinc-900">Lactic Studio</h1>
      </div>

      <nav className="flex-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="truncate text-sm font-medium text-zinc-700">
            {user?.name}
          </p>
          <LanguageSwitcher />
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          {t("nav.logOut")}
        </button>
      </div>
    </aside>
  );
}
