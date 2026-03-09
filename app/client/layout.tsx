"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/lib/auth/guard";
import { useAuth } from "@/lib/auth/context";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/client/programs", label: "Programs" },
  { href: "/client/history", label: "History" },
];

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

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold text-zinc-900">Lactic</h1>
          <nav className="flex gap-4">
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
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-zinc-600"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
