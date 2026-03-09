"use client";

import { useState, useEffect } from "react";
import { getExercises } from "@/lib/api/endpoints/exercises";
import type { Exercise } from "@/lib/api/types";

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  onCancel: () => void;
}

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

export function ExercisePicker({ onSelect, onCancel }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: { search?: string; muscle_group?: string } = {};
    if (search) params.search = search;
    if (muscleGroup !== "All") params.muscle_group = muscleGroup;

    setLoading(true);
    getExercises(params)
      .then(setExercises)
      .finally(() => setLoading(false));
  }, [search, muscleGroup]);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
        />
        <select
          value={muscleGroup}
          onChange={(e) => setMuscleGroup(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
        >
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto rounded-md border border-zinc-200">
        {loading ? (
          <p className="p-4 text-center text-sm text-zinc-400">Loading...</p>
        ) : exercises.length === 0 ? (
          <p className="p-4 text-center text-sm text-zinc-400">
            No exercises found
          </p>
        ) : (
          exercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise)}
              className="flex w-full items-center justify-between border-b border-zinc-100 px-4 py-2 text-left text-sm hover:bg-zinc-50 last:border-0"
            >
              <span className="font-medium text-zinc-900">
                {exercise.name}
              </span>
              <span className="text-xs text-zinc-400">
                {exercise.muscle_group}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
