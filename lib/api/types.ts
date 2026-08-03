// TypeScript interfaces matching Rails Blueprinter serializer output

export interface User {
  id: number;
  name: string;
  email: string;
  role: "coach" | "client";
  avatar_url: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: Pick<User, "id" | "name" | "email" | "role">;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface ClientInvitation {
  id: number;
  email: string;
  status: "pending" | "expired" | "accepted" | "revoked";
  expires_at: string;
  sent_at: string | null;
  created_at: string;
  coach_name: string;
}

export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  is_custom: boolean;
  video_url: string | null;
  thumbnail_url: string | null;
}

export interface Program {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ProgramExtended extends Program {
  weeks: WeekExtended[];
}

export interface Week {
  id: number;
  position: number;
}

export interface WeekExtended extends Week {
  workouts: Workout[];
}

export interface Workout {
  id: number;
  name: string;
  day: number;
  volume_sets: Record<string, number>;
}

export interface WorkoutExtended extends Workout {
  workout_exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: number;
  position: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  rir: number | null;
  weight: number | null;
  notes: string | null;
  exercise: Exercise;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  source_workout_id: number;
  created_at: string;
}

export interface ProgramAssignment {
  id: number;
  start_date: string;
  status: "active" | "completed" | "paused";
  notes: string | null;
  program: Program;
  client: User;
}

export interface WorkoutSession {
  id: number;
  workout_id: number;
  started_at: string;
  completed_at: string | null;
  notes: string | null;
}

export interface WorkoutSessionExtended extends WorkoutSession {
  exercise_logs: ExerciseLogExtended[];
}

export interface ExerciseLog {
  id: number;
  workout_exercise_id: number;
  notes: string | null;
  photo_url: string | null;
}

export interface ExerciseLogExtended extends ExerciseLog {
  set_logs: SetLog[];
}

export interface SetLog {
  id: number;
  position: number;
  weight_kg: number;
  reps: number;
}
