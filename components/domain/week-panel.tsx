"use client";

import { useState } from "react";
import type { WeekExtended } from "@/lib/api/types";
import { WorkoutCard } from "@/components/domain/workout-card";
import { Button } from "@/components/ui/button";
import { dayName } from "@/lib/utils/format";

interface WeekPanelProps {
  week: WeekExtended;
  programId: number;
  onAddWorkout: (weekId: number, name: string, day: number) => void;
  onDeleteWorkout: (weekId: number, workoutId: number) => void;
  onDuplicateWorkout: (weekId: number, workoutId: number) => void;
  onDeleteWeek: (weekId: number) => void;
}

export function WeekPanel({
  week,
  programId,
  onAddWorkout,
  onDeleteWorkout,
  onDuplicateWorkout,
  onDeleteWeek,
}: WeekPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDay, setNewDay] = useState(1);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddWorkout(week.id, newName, newDay);
    setNewName("");
    setNewDay(1);
    setShowAddForm(false);
  };

  // Group workouts by day
  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h3 className="font-semibold text-zinc-900">Week {week.position}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowAddForm(!showAddForm)}>
            + Workout
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm("Delete this week and all its workouts?")) {
                onDeleteWeek(week.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="flex items-end gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="flex-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Workout name"
              className="w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
            />
          </div>
          <select
            value={newDay}
            onChange={(e) => setNewDay(Number(e.target.value))}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {dayName(d)}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={handleAdd}>
            Add
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        </div>
      )}

      <div className="grid grid-cols-7 gap-px bg-zinc-200">
        {days.map((day) => {
          const dayWorkouts = week.workouts.filter((w) => w.day === day);
          return (
            <div key={day} className="min-h-[120px] bg-zinc-50 p-2">
              <p className="mb-2 text-center text-xs font-medium text-zinc-500">
                {dayName(day)}
              </p>
              <div className="space-y-2">
                {dayWorkouts.map((workout) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    programId={programId}
                    weekId={week.id}
                    onDelete={(id) => onDeleteWorkout(week.id, id)}
                    onDuplicate={(id) => onDuplicateWorkout(week.id, id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
