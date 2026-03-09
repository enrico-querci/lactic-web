"use client";

import { useState, useEffect } from "react";
import {
  getWorkoutTemplates,
  deleteWorkoutTemplate,
} from "@/lib/api/endpoints/workout-templates";
import type { WorkoutTemplate } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkoutTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    await deleteWorkoutTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">
          Workout Templates
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Save workouts as templates and apply them to other weeks.
        </p>
      </div>

      {templates.length === 0 ? (
        <EmptyState message="No templates yet. Save a workout as a template from the program builder." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                    {template.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {formatDate(template.created_at)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
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
