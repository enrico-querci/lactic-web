"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getClients, removeClient } from "@/lib/api/endpoints/clients";
import type { User } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients()
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id: number) => {
    if (!confirm("Remove this client?")) return;
    await removeClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Clients</h1>
      </div>

      {clients.length === 0 ? (
        <EmptyState message="No clients yet" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3">
                    <Link
                      href={`/coach/clients/${client.id}`}
                      className="text-sm font-medium text-zinc-900 hover:text-zinc-600"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {client.email}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link href={`/coach/clients/${client.id}`}>
                      <Button variant="secondary" size="sm" className="mr-2">
                        Progress
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemove(client.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
