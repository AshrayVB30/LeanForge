// ============================================================
// LeanForge — Core TypeScript Types
// ============================================================

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  target_weight: number;
  daily_calorie_target: number;
  daily_protein_target: number;
  // Onboarding & Health Data
  is_onboarded: boolean;
  current_weight?: number;
  height_cm?: number;
  age?: number;
  gender?: 'male' | 'female';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal?: 'bulk' | 'cut' | 'maintain';
}

export type RoutineType = 'Push' | 'Pull' | 'Legs' | 'Rest';

export interface WorkoutLog {
  id: string;
  user_id: string;
  date: string;
  routine_type: RoutineType;
  notes: string | null;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  workout_log_id: string;
  exercise_name: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  created_at: string;
}

export interface SupplementsTaken {
  creatine: boolean;
  soya_chunks: boolean;
  dry_fruits: boolean;
  fruits: boolean;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  date: string;
  calories: number;
  protein_g: number;
  water_liters: number;
  supplements_taken: SupplementsTaken;
  created_at: string;
}

export interface ExerciseSet {
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface ExerciseEntry {
  exercise_name: string;
  sets: ExerciseSet[];
  previousBest?: {
    weight_kg: number;
    reps: number;
  };
}

export interface WorkoutSession {
  routine_type: RoutineType;
  exercises: ExerciseEntry[];
  notes: string;
}

// Analytics
export interface WeightDataPoint {
  date: string;
  weight: number;
}

export interface StrengthDataPoint {
  date: string;
  estimated_1rm: number;
  exercise_name: string;
}

export interface CalorieDataPoint {
  date: string;
  calories: number;
  target: number;
  protein_g: number;
}

export type DateRange = '7d' | '30d' | '90d' | '6mo';

// ─── Social & Community Types ──────────────────────────────

export interface Group {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
  created_by: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  email: string;
  current_streak: number;
}
