// ============================================================
// LeanForge — PPL Split Logic & Exercise Constants
// ============================================================

import { RoutineType, ExerciseEntry } from './types';

/**
 * 6-day PPL split cycle:
 * Day 0: Push, Day 1: Pull, Day 2: Legs,
 * Day 3: Push, Day 4: Pull, Day 5: Legs,
 * Day 6: Rest
 */
const PPL_CYCLE: RoutineType[] = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'];

// Epoch reference date (a known Monday) for consistent cycle calculation
const EPOCH_DATE = new Date('2024-01-01');

export function getTodayRoutine(date: Date = new Date()): RoutineType {
  const diffTime = date.getTime() - EPOCH_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycleDay = ((diffDays % 7) + 7) % 7; // handle negative
  return PPL_CYCLE[cycleDay];
}

export function getRoutineColor(routine: RoutineType): string {
  switch (routine) {
    case 'Push': return 'text-blue-400';
    case 'Pull': return 'text-purple-400';
    case 'Legs': return 'text-orange-400';
    case 'Rest': return 'text-slate-400';
    default: return 'text-emerald-400';
  }
}

export function getRoutineBgColor(routine: RoutineType): string {
  switch (routine) {
    case 'Push': return 'bg-blue-500/20 border-blue-500/30';
    case 'Pull': return 'bg-purple-500/20 border-purple-500/30';
    case 'Legs': return 'bg-orange-500/20 border-orange-500/30';
    case 'Rest': return 'bg-slate-500/20 border-slate-500/30';
    default: return 'bg-emerald-500/20 border-emerald-500/30';
  }
}

export const PUSH_EXERCISES: string[] = [
  'Bench Press',
  'Overhead Press',
  'Incline Dumbbell Press',
  'Lateral Raises',
  'Tricep Pushdowns',
  'Overhead Tricep Extension',
];

export const PULL_EXERCISES: string[] = [
  'Deadlifts',
  'Barbell Rows',
  'Pull-ups',
  'Face Pulls',
  'Barbell Curls',
  'Hammer Curls',
];

export const LEGS_EXERCISES: string[] = [
  'Squats',
  'Leg Press',
  'Romanian Deadlifts',
  'Leg Curls',
  'Calf Raises',
  'Leg Extensions',
];

export function getExercisesForRoutine(routine: RoutineType): string[] {
  switch (routine) {
    case 'Push': return PUSH_EXERCISES;
    case 'Pull': return PULL_EXERCISES;
    case 'Legs': return LEGS_EXERCISES;
    default: return [];
  }
}

export function createEmptyExerciseEntries(routine: RoutineType): ExerciseEntry[] {
  const exercises = getExercisesForRoutine(routine);
  return exercises.map((name) => ({
    exercise_name: name,
    sets: [{ set_number: 1, weight_kg: 0, reps: 0 }],
  }));
}

/**
 * Epley formula for estimated 1RM:
 * 1RM = weight × (1 + reps / 30)
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps === 0 || weight === 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export const KEY_LIFTS = ['Bench Press', 'Squats', 'Deadlifts'];

export const SUPPLEMENTS = [
  { key: 'creatine' as const, label: 'Creatine', emoji: '💊' },
  { key: 'soya_chunks' as const, label: 'Soya Chunks', emoji: '🫘' },
  { key: 'dry_fruits' as const, label: 'Dry Fruits', emoji: '🥜' },
  { key: 'fruits' as const, label: 'Fruits', emoji: '🍎' },
];

export const WATER_TARGET = 3.0; // liters
export const DEFAULT_CALORIE_TARGET = 2500;
export const DEFAULT_PROTEIN_TARGET = 130;
export const DEFAULT_TARGET_WEIGHT = 52;
