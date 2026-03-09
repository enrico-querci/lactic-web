"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/lib/auth/guard";
import { useAuth } from "@/lib/auth/context";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/coach/programs", label: "Programs" },
  { href: "/coach/clients", label: "Clients" },
  { href: "/coach/exercises", label: "Exercises" },
  { href: "/coach/assignments", label: "Assignments" },
  { href: "/coach/templates", label: "Templates" },
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 px-4 py-4">
        <p className="mb-2 truncate text-sm font-medium text-zinc-700">
          {user?.name}
        </p>
        <button
          onClick={handleLogout}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
