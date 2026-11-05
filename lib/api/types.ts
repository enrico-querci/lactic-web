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

export interface Subscription {
  plan: "free" | "pro" | "pro_plus" | "unlimited" | "founding";
  client_limit: number | null;
  client_slots_used: number;
  expires_at: string | null;
  auto_renew: boolean | null;
  billing_issue: boolean;
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

export type ClientLevel = "beginner" | "intermediate" | "advanced";
export type ClientGoal = "strength" | "muscle_gain" | "fat_loss" | "health" | "other";

/**
 * The coach's own record of a client. It can exist before the person has an
 * account: `prepared` (not invited), `invited` (a pending invitation for the
 * email) or `active` (they accepted, and `user_id` is their account).
 */
export interface ClientProfile {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  level: ClientLevel | null;
  goal: ClientGoal | null;
  limitations: string | null;
  notes: string | null;
  user_id: number | null;
  created_at: string;
  status: "active" | "invited" | "prepared";
  invitation_id: number | null;
  invitation_expires_at: string | null;
}

export type AttentionKind =
  | "inactive"
  | "program_ended"
  | "program_ending"
  | "no_program"
  | "invitation_expired"
  | "invitation_expiring";

/** Something the coach should look at, from the dashboard. */
export interface AttentionItem {
  kind: AttentionKind;
  /** Null for an invitation that has not been accepted. */
  client_id: number | null;
  profile_id: number | null;
  /** The client's name, or the invited email when there is no profile. */
  name: string;
  /** Days without training, or until/since a program ends; null otherwise. */
  days: number | null;
  never_trained?: boolean;
}

export interface CoachDashboard {
  clients: { active: number; slots_used: number; limit: number | null };
  sessions: { this_week: number; last_week: number };
  pending_invitations: number;
  inactive_clients: number;
  attention: AttentionItem[];
  attention_total: number;
  recent_activity: {
    id: number;
    client_id: number;
    client_name: string;
    workout_name: string;
    completed_at: string;
  }[];
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
  /** The current client's assignment for this program. Required to start a
   *  workout session: WorkoutSession belongs to a specific assignment, not
   *  just a program, since a client could hold more than one against it. */
  assignment_id: number;
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
  /**
   * Where the template was saved from. A template owns a copy of its
   * exercises, so this is null once that workout has been deleted.
   */
  source_workout_id: number | null;
  exercise_count: number;
  created_at: string;
}

/** A template with its exercises, in the same shape as a workout's. */
export interface WorkoutTemplateExtended extends WorkoutTemplate {
  workout_exercises: WorkoutExercise[];
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
