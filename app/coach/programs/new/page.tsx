"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProgram } from "@/lib/api/endpoints/programs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewProgramPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const program = await createProgram({ name, description });
      router.push(`/coach/programs/${program.id}`);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">New Program</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Push Pull Legs"
        />
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="Optional description"
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? "Creating..." : "Create Program"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
