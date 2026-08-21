"use client";

import { useState } from "react";
import type { WeekExtended } from "@/lib/api/types";
import { WorkoutCard } from "@/components/domain/workout-card";
import { Button } from "@/components/ui/button";
import { dayName } from "@/lib/utils/format";
import { useLocale } from "@/lib/i18n/context";

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
  const { t, locale } = useLocale();
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
        <h3 className="font-semibold text-zinc-900">{t("program.week", { position: week.position })}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowAddForm(!showAddForm)}>
            {t("weekPanel.addWorkout")}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm(t("weekPanel.confirmDeleteWeek"))) {
                onDeleteWeek(week.id);
              }
            }}
          >
            {t("common.delete")}
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
              placeholder={t("weekPanel.workoutNamePlaceholder")}
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
                {dayName(d, locale)}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={handleAdd}>
            {t("common.add")}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>
            {t("common.cancel")}
          </Button>
        </div>
      )}

      {/* Below lg: this scrolls horizontally as a week strip rather than
          crushing 7 columns into a width WorkoutCard's own name+actions
          header can't render legibly (name and volume badges break
          mid-word below ~150px of content room). The 220px floor must live
          on the grid TRACK (minmax(220px,1fr)), not just the item — Tailwind's
          plain grid-cols-7 tracks are minmax(0,1fr), which caps track growth
          regardless of an item's own min-width, so items would overflow and
          overlap their track instead of widening it. At lg: and up, revert to
          plain grid-cols-7 (equal-fraction, no floor) — the natural columns
          already worked fine pre-responsive-pass and a 220px floor would
          force scrolling even on desktop. */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[repeat(7,minmax(220px,1fr))] gap-px bg-zinc-200 lg:grid-cols-7">
          {days.map((day) => {
            const dayWorkouts = week.workouts.filter((w) => w.day === day);
            return (
              <div key={day} className="min-h-[120px] bg-zinc-50 p-2">
                <p className="mb-2 text-center text-xs font-medium text-zinc-500">
                  {dayName(day, locale)}
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
    </div>
  );
}
