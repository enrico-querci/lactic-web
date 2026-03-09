"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getExercises,
  deleteExercise,
} from "@/lib/api/endpoints/exercises";
import type { Exercise } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";

const MUSCLE_GROUPS = [
  "All",
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

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("All");

  useEffect(() => {
    setLoading(true);
    const params: { search?: string; muscle_group?: string } = {};
    if (search) params.search = search;
    if (muscleGroup !== "All") params.muscle_group = muscleGroup;

    getExercises(params)
      .then(setExercises)
      .finally(() => setLoading(false));
  }, [search, muscleGroup]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exercise?")) return;
    await deleteExercise(id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Exercises</h1>
        <Link href="/coach/exercises/new">
          <Button>New Exercise</Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <select
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : exercises.length === 0 ? (
        <EmptyState message="No exercises found" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Muscle Group</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {exercises.map((exercise) => (
                <tr key={exercise.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                    {exercise.name}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {exercise.muscle_group}
                  </td>
                  <td className="px-6 py-3 text-sm text-zinc-500">
                    {exercise.is_custom ? (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        Custom
                      </span>
                    ) : (
                      "Catalog"
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {exercise.is_custom && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(exercise.id)}
                      >
                        Delete
                      </Button>
                    )}
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
