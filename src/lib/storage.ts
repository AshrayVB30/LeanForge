// ============================================================
// LeanForge — LocalStorage Data Store
// Complete offline data layer that works without Supabase
// ============================================================

import type {
  WorkoutLog,
  ExerciseLog,
  NutritionLog,
  SupplementsTaken,
  ExerciseEntry,
  UserProfile,
  Group,
  GroupMember,
  LeaderboardEntry,
} from './types';

const STORAGE_KEYS = {
  USER_PROFILE: 'leanforge_user_profile',
  WORKOUT_LOGS: 'leanforge_workout_logs',
  EXERCISE_LOGS: 'leanforge_exercise_logs',
  NUTRITION_LOGS: 'leanforge_nutrition_logs',
} as const;

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

let activeUserId = 'demo@leanforge.app';

export function setActiveUserId(email: string | null) {
  if (typeof window !== 'undefined') {
    if (email) {
      localStorage.setItem('active_demo_user', email);
    } else {
      localStorage.removeItem('active_demo_user');
    }
  }
  activeUserId = email || 'demo@leanforge.app';
}

export function getActiveUserId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('active_demo_user') || 'demo@leanforge.app';
  }
  return activeUserId;
}

function getScopedKey(key: string): string {
  const userId = getActiveUserId();
  // Don't scope if there is no user, though it defaults to demo@leanforge.app
  return `${key}_${userId}`;
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(getScopedKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getScopedKey(key), JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

// ─── User Profile ───────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  email: 'demo@leanforge.app',
  created_at: new Date().toISOString(),
  target_weight: 0,
  daily_calorie_target: 0,
  daily_protein_target: 0,
  is_onboarded: false,
};

export function getLocalProfile(): UserProfile {
  return getItem(STORAGE_KEYS.USER_PROFILE, DEFAULT_PROFILE);
}

export function updateLocalProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getLocalProfile();
  const updated = { ...current, ...updates };
  setItem(STORAGE_KEYS.USER_PROFILE, updated);
  return updated;
}

// ─── Workout Logs ───────────────────────────────────────

export function getWorkoutLogs(): (WorkoutLog & { exercise_logs: ExerciseLog[] })[] {
  const workouts = getItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
  const exercises = getItem<ExerciseLog[]>(STORAGE_KEYS.EXERCISE_LOGS, []);
  return workouts.map((w) => ({
    ...w,
    exercise_logs: exercises.filter((e) => e.workout_log_id === w.id),
  }));
}

export function getTodayWorkout(date: string): (WorkoutLog & { exercise_logs: ExerciseLog[] }) | null {
  const all = getWorkoutLogs();
  return all.find((w) => w.date === date) || null;
}

export function getPreviousExercise(exerciseName: string): { weight_kg: number; reps: number } | null {
  const exercises = getItem<ExerciseLog[]>(STORAGE_KEYS.EXERCISE_LOGS, []);
  const matching = exercises
    .filter((e) => e.exercise_name === exerciseName && (e.weight_kg > 0 || e.reps > 0))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  if (matching.length === 0) return null;
  return { weight_kg: matching[0].weight_kg, reps: matching[0].reps };
}

export function saveWorkoutLocal(
  routineType: string,
  exercises: ExerciseEntry[],
  notes: string,
  date: string
): WorkoutLog {
  const workoutId = generateId();
  const now = new Date().toISOString();

  const workoutLog: WorkoutLog = {
    id: workoutId,
    user_id: 'local-user',
    date,
    routine_type: routineType as WorkoutLog['routine_type'],
    notes: notes || null,
    created_at: now,
  };

  // Save workout log
  const workouts = getItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
  workouts.push(workoutLog);
  setItem(STORAGE_KEYS.WORKOUT_LOGS, workouts);

  // Save exercise logs
  const exerciseLogs = getItem<ExerciseLog[]>(STORAGE_KEYS.EXERCISE_LOGS, []);
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (set.weight_kg > 0 || set.reps > 0) {
        exerciseLogs.push({
          id: generateId(),
          workout_log_id: workoutId,
          exercise_name: exercise.exercise_name,
          set_number: set.set_number,
          weight_kg: set.weight_kg,
          reps: set.reps,
          created_at: now,
        });
      }
    }
  }
  setItem(STORAGE_KEYS.EXERCISE_LOGS, exerciseLogs);

  return workoutLog;
}

// ─── Nutrition Logs ─────────────────────────────────────

const DEFAULT_SUPPLEMENTS: SupplementsTaken = {
  creatine: false,
  soya_chunks: false,
  dry_fruits: false,
  fruits: false,
};

export function getTodayNutrition(date: string): NutritionLog | null {
  const all = getItem<NutritionLog[]>(STORAGE_KEYS.NUTRITION_LOGS, []);
  return all.find((n) => n.date === date) || null;
}

export function upsertNutrition(date: string, updates: Partial<NutritionLog>): NutritionLog {
  const all = getItem<NutritionLog[]>(STORAGE_KEYS.NUTRITION_LOGS, []);
  const existingIndex = all.findIndex((n) => n.date === date);

  if (existingIndex >= 0) {
    // Update existing
    all[existingIndex] = {
      ...all[existingIndex],
      ...updates,
    };
    setItem(STORAGE_KEYS.NUTRITION_LOGS, all);
    return all[existingIndex];
  } else {
    // Create new
    const newLog: NutritionLog = {
      id: generateId(),
      user_id: 'local-user',
      date,
      calories: updates.calories ?? 0,
      protein_g: updates.protein_g ?? 0,
      water_liters: updates.water_liters ?? 0,
      supplements_taken: updates.supplements_taken ?? DEFAULT_SUPPLEMENTS,
      created_at: new Date().toISOString(),
    };
    all.push(newLog);
    setItem(STORAGE_KEYS.NUTRITION_LOGS, all);
    return newLog;
  }
}

export function addWaterLocal(date: string, amount: number): NutritionLog {
  const current = getTodayNutrition(date);
  const currentWater = current?.water_liters ?? 0;
  return upsertNutrition(date, {
    ...(current || {}),
    water_liters: Math.max(0, Math.round((currentWater + amount) * 10) / 10),
  });
}

export function toggleSupplementLocal(date: string, key: keyof SupplementsTaken): NutritionLog {
  const current = getTodayNutrition(date);
  const currentSupps = (current?.supplements_taken as SupplementsTaken) ?? DEFAULT_SUPPLEMENTS;
  return upsertNutrition(date, {
    ...(current || {}),
    supplements_taken: {
      ...currentSupps,
      [key]: !currentSupps[key],
    },
  });
}

export function getNutritionHistory(limit: number = 180): NutritionLog[] {
  const all = getItem<NutritionLog[]>(STORAGE_KEYS.NUTRITION_LOGS, []);
  return all
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// ─── Analytics Helpers ──────────────────────────────────

export function getNutritionSince(startDate: string): NutritionLog[] {
  const all = getItem<NutritionLog[]>(STORAGE_KEYS.NUTRITION_LOGS, []);
  return all
    .filter((n) => n.date >= startDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getExerciseLogsSince(startDate: string, exerciseNames: string[]): {
  exercise_name: string;
  weight_kg: number;
  reps: number;
  date: string;
}[] {
  const workouts = getItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
  const exercises = getItem<ExerciseLog[]>(STORAGE_KEYS.EXERCISE_LOGS, []);

  const validWorkoutIds = new Set(
    workouts.filter((w) => w.date >= startDate).map((w) => w.id)
  );
  const workoutDateMap = new Map(workouts.map((w) => [w.id, w.date]));

  return exercises
    .filter(
      (e) =>
        validWorkoutIds.has(e.workout_log_id) &&
        exerciseNames.includes(e.exercise_name)
    )
    .map((e) => ({
      exercise_name: e.exercise_name,
      weight_kg: e.weight_kg,
      reps: e.reps,
      date: workoutDateMap.get(e.workout_log_id) || '',
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ─── Social & Community (Global Storage) ────────────────

const GLOBAL_GROUPS_KEY = 'leanforge_global_groups';
const GLOBAL_MEMBERS_KEY = 'leanforge_global_members';

function getGlobalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setGlobalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function calculateStreak(workouts: WorkoutLog[]): number {
  if (workouts.length === 0) return 0;
  const sorted = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let firstFound = false;
  const uniqueDates = Array.from(new Set(sorted.map(w => w.date)));
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    if (uniqueDates.includes(dateStr)) {
      streak++;
      firstFound = true;
    } else {
      if (!firstFound && i <= 1) {
         continue; // allow missing today, if they worked out yesterday streak still counts
      }
      break;
    }
  }
  return streak;
}

export function createGroup(name: string): Group {
  const groups = getGlobalItem<Group[]>(GLOBAL_GROUPS_KEY, []);
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const group: Group = {
    id: generateId(),
    name,
    join_code: joinCode,
    created_at: new Date().toISOString(),
    created_by: getActiveUserId(),
  };
  groups.push(group);
  setGlobalItem(GLOBAL_GROUPS_KEY, groups);
  
  joinGroup(joinCode); // Auto-join creator
  return group;
}

export function joinGroup(joinCode: string): Group | null {
  const groups = getGlobalItem<Group[]>(GLOBAL_GROUPS_KEY, []);
  const group = groups.find(g => g.join_code === joinCode);
  if (!group) return null;
  
  const members = getGlobalItem<GroupMember[]>(GLOBAL_MEMBERS_KEY, []);
  const userId = getActiveUserId();
  
  if (!members.find(m => m.group_id === group.id && m.user_id === userId)) {
    members.push({
      group_id: group.id,
      user_id: userId,
      joined_at: new Date().toISOString(),
    });
    setGlobalItem(GLOBAL_MEMBERS_KEY, members);
  }
  return group;
}

export function deleteGroup(groupId: string): boolean {
  const groups = getGlobalItem<Group[]>(GLOBAL_GROUPS_KEY, []);
  const userId = getActiveUserId();
  
  const groupIndex = groups.findIndex(g => g.id === groupId);
  if (groupIndex === -1) return false;
  
  // Only creator can delete
  if (groups[groupIndex].created_by !== userId) {
    return false;
  }
  
  // Remove group
  groups.splice(groupIndex, 1);
  setGlobalItem(GLOBAL_GROUPS_KEY, groups);
  
  // Remove all members of this group
  const members = getGlobalItem<GroupMember[]>(GLOBAL_MEMBERS_KEY, []);
  const updatedMembers = members.filter(m => m.group_id !== groupId);
  setGlobalItem(GLOBAL_MEMBERS_KEY, updatedMembers);
  
  return true;
}

export function getMyGroups(): Group[] {
  const groups = getGlobalItem<Group[]>(GLOBAL_GROUPS_KEY, []);
  const members = getGlobalItem<GroupMember[]>(GLOBAL_MEMBERS_KEY, []);
  const userId = getActiveUserId();
  
  const myGroupIds = members.filter(m => m.user_id === userId).map(m => m.group_id);
  return groups.filter(g => myGroupIds.includes(g.id));
}

export function getGroupLeaderboard(groupId: string): LeaderboardEntry[] {
  const members = getGlobalItem<GroupMember[]>(GLOBAL_MEMBERS_KEY, []);
  const groupMembers = members.filter(m => m.group_id === groupId);
  const leaderboard: LeaderboardEntry[] = [];
  
  for (const member of groupMembers) {
    const userProfileKey = `leanforge_user_profile_${member.user_id}`;
    const userWorkoutsKey = `leanforge_workout_logs_${member.user_id}`;
    
    let profile: UserProfile | null = null;
    let workouts: WorkoutLog[] = [];
    
    if (typeof window !== 'undefined') {
      try {
        const pRaw = localStorage.getItem(userProfileKey);
        if (pRaw) profile = JSON.parse(pRaw);
        const wRaw = localStorage.getItem(userWorkoutsKey);
        if (wRaw) workouts = JSON.parse(wRaw);
      } catch {}
    }
    
    leaderboard.push({
      user_id: member.user_id,
      email: profile?.email || member.user_id,
      current_streak: calculateStreak(workouts),
    });
  }
  
  return leaderboard.sort((a, b) => b.current_streak - a.current_streak);
}
