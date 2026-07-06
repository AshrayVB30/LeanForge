'use client';

// ============================================================
// LeanForge — Workout Hook (localStorage-based, works offline)
// ============================================================

import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  getTodayWorkout,
  getPreviousExercise,
  saveWorkoutLocal,
  getWorkoutLogs,
} from '@/lib/storage';
import type { WorkoutLog, ExerciseLog, ExerciseEntry } from '@/lib/types';
import { getToday } from '@/lib/utils';

export function useWorkout() {
  const { user } = useAuth();
  const today = getToday();
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Today's workout (reads from localStorage)
  const todayWorkoutData = user ? getTodayWorkout(today) : null;

  const todayWorkout = {
    data: todayWorkoutData,
    isLoading: false,
    error: null,
    _refreshKey: refreshKey, // force re-reads
  };

  // Previous exercise data
  const usePreviousExercise = (exerciseName: string) => {
    const data = user ? getPreviousExercise(exerciseName) : null;
    return {
      data,
      isLoading: false,
      error: null,
    };
  };

  // Save workout
  const saveWorkout = {
    mutateAsync: async ({
      routineType,
      exercises,
      notes,
    }: {
      routineType: string;
      exercises: ExerciseEntry[];
      notes: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const result = saveWorkoutLocal(routineType, exercises, notes, today);
      refresh();
      return result;
    },
    isPending: false,
  };

  // Workout history
  const workoutHistory = {
    data: user ? getWorkoutLogs().slice(0, 30) : [],
    isLoading: false,
    error: null,
  };

  return {
    todayWorkout,
    usePreviousExercise,
    saveWorkout,
    workoutHistory,
  };
}
