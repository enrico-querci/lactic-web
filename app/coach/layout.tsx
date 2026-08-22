"use client";

import { useEffect, useState } from "react";
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
  { href: "/coach/billing", labelKey: "nav.billing" },
];

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="coach">
      <div className="flex h-screen flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-zinc-50 p-4 lg:p-8">{children}</main>
      </div>
    </RoleGuard>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // A route change should always close the drawer, whether the coach tapped
  // a nav link or navigated some other way (back button, a link inside a
  // page) — closing only on nav-link click would miss those.
  useEffect(() => {
    const closeDrawer = () => setDrawerOpen(false);
    closeDrawer();
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const navLinks = (
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
  );

  const footer = (
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
  );

  return (
    <>
      {/* Below lg: this top bar replaces the sidebar entirely; the fixed
          w-64 column has nowhere to go on a narrow viewport. */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
        <h1 className="text-lg font-bold text-zinc-900">Lactic Studio</h1>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label={t("nav.openMenu")}
          className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M2.5 5h15M2.5 10h15M2.5 15h15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-black/40 lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <aside className="flex h-full w-64 flex-col bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
              <h1 className="text-lg font-bold text-zinc-900">Lactic Studio</h1>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label={t("common.close")}
                className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100"
              >
                &times;
              </button>
            </div>
            {navLinks}
            {footer}
          </aside>
        </div>
      )}

      {/* lg: and up — unchanged from before, a permanent column. */}
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="border-b border-zinc-200 px-6 py-5">
          <h1 className="text-lg font-bold text-zinc-900">Lactic Studio</h1>
        </div>
        {navLinks}
        {footer}
      </aside>
    </>
  );
}
