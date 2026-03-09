"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPrograms, deleteProgram } from "@/lib/api/endpoints/programs";
import type { Program } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrograms()
      .then(setPrograms)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this program?")) return;
    await deleteProgram(id);
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Programs</h1>
        <Link href="/coach/programs/new">
          <Button>New Program</Button>
        </Link>
      </div>

      {programs.length === 0 ? (
        <EmptyState message="No programs yet. Create your first one!" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/coach/programs/${program.id}`}
                      className="font-medium text-zinc-900 hover:text-zinc-600"
                    >
                      {program.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {program.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {formatDate(program.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/coach/programs/${program.id}/edit`}>
                      <Button variant="secondary" size="sm" className="mr-2">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(program.id)}
                    >
                      Delete
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
