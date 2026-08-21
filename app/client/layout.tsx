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
  const [menuOpen, setMenuOpen] = useState(false);

  // A route change should always close the mobile menu, whether the client
  // tapped a nav link or navigated some other way.
  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    closeMenu();
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const navLinks = (
    <>
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
              isActive ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="relative border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link href={HOME_HREF} className="shrink-0 text-lg font-bold text-zinc-900">
            Lactic
          </Link>
          {/* Below sm: four nav links plus the language switcher, name, and
              logout button no longer fit one row and overlap — confirmed on
              a real phone. Tuck everything but the wordmark behind a
              hamburger there; sm: and up keeps this row exactly as before. */}
          <nav className="hidden gap-4 sm:flex">{navLinks}</nav>
        </div>
        {/* The name is the next thing to go below md: even once the full row
            is showing, keeping some headroom right at the sm: boundary;
            "Log out" must stay reachable. */}
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <LanguageSwitcher />
          <span className="hidden text-sm text-zinc-500 md:inline">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-zinc-600"
          >
            {t("nav.logOut")}
          </button>
        </div>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={t("nav.openMenu")}
          className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 sm:hidden"
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

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-50 border-t border-zinc-200 bg-white px-4 py-3 sm:hidden">
            <nav className="flex flex-col gap-3">{navLinks}</nav>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
              <span className="text-sm text-zinc-500">{user?.name}</span>
              <LanguageSwitcher />
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 text-sm text-zinc-400 hover:text-zinc-600"
            >
              {t("nav.logOut")}
            </button>
          </div>
        </>
      )}
    </header>
  );
}
