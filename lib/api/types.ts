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

export interface MuscleRef {
  key: string;
  name: string;
  region: string | null;
}

export interface EquipmentRef {
  key: string;
  name: string;
}

export interface Exercise {
  id: number;
  /** Localized: the API resolves the language and falls back to English. */
  name: string;
  is_custom: boolean;
  category: string | null;
  difficulty: string | null;
  mechanic: string | null;
  force: string | null;
  prescription_type: string;
  active: boolean;
  assignable: boolean;
  primary_muscle: MuscleRef | null;
  equipment: EquipmentRef[];
  has_animation: boolean;
  /** A Lactic path, never the provider's URL. Requires authentication. */
  animation_url: string | null;
  /** Pre-catalog fields, still served until the catalog contract fully lands. */
  muscle_group: string;
  video_url: string | null;
  thumbnail_url: string | null;
}

export interface ExerciseDetail extends Exercise {
  description: string | null;
  instructions: string[];
  /** The locale actually served, which differs from the one asked for on fallback. */
  locale: string | null;
  secondary_muscles: EquipmentRef[];
}

export interface ExerciseTaxonomy {
  muscles: MuscleRef[];
  equipment: EquipmentRef[];
  categories: string[];
  difficulties: string[];
}

export interface PageMeta {
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Paged<T> {
  items: T[];
  meta: PageMeta;
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
