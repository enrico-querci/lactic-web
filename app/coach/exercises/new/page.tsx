"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExercise } from "@/lib/api/endpoints/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Quadriceps",
  "Hamstrings",
  "Glutes",
  "Biceps",
  "Triceps",
  "Core",
  "Calves",
  "Forearms",
  "Traps",
  "Full Body",
];

export default function NewExercisePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("Chest");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createExercise({
        name,
        muscle_group: muscleGroup,
        video_url: videoUrl || undefined,
        thumbnail_url: thumbnailUrl || undefined,
      });
      router.push("/coach/exercises");
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        New Custom Exercise
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Zercher Squat"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Muscle Group
          </label>
          <select
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="videoUrl"
          label="Video URL (optional)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://..."
        />
        <Input
          id="thumbnailUrl"
          label="Thumbnail URL (optional)"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://..."
        />
        <div className="flex gap-3">
          <Button type="submit" disabled={saving || !name.trim()}>
            {saving ? "Creating..." : "Create Exercise"}
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
