'use client';

// ============================================================
// LeanForge — Analytics Hook (localStorage-based)
// ============================================================

import { useAuth } from '@/providers/AuthProvider';
import type { CalorieDataPoint, StrengthDataPoint, DateRange } from '@/lib/types';
import { getDaysAgo, getDateRangeDays } from '@/lib/utils';
import { calculateEstimated1RM, KEY_LIFTS } from '@/lib/ppl';
import { getNutritionSince, getExerciseLogsSince } from '@/lib/storage';

export function useAnalytics(dateRange: DateRange = '30d') {
  const { user, profile } = useAuth();
  const days = getDateRangeDays(dateRange);
  const startDate = getDaysAgo(days);

  // Calorie data
  const calorieChartData: CalorieDataPoint[] = user
    ? getNutritionSince(startDate).map((d) => ({
        date: d.date,
        calories: d.calories,
        target: profile?.daily_calorie_target || 2500,
        protein_g: d.protein_g,
      }))
    : [];

  const calorieData = {
    data: calorieChartData,
    isLoading: false,
    error: null,
  };

  // Strength data
  const rawExerciseLogs = user ? getExerciseLogsSince(startDate, KEY_LIFTS) : [];
  
  const grouped = new Map<string, StrengthDataPoint>();
  for (const row of rawExerciseLogs) {
    const key = `${row.exercise_name}_${row.date}`;
    const e1rm = calculateEstimated1RM(row.weight_kg, row.reps);
    const existing = grouped.get(key);
    if (!existing || e1rm > existing.estimated_1rm) {
      grouped.set(key, {
        date: row.date,
        estimated_1rm: e1rm,
        exercise_name: row.exercise_name,
      });
    }
  }
  const strengthChartData = Array.from(grouped.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const strengthData = {
    data: strengthChartData,
    isLoading: false,
    error: null,
  };

  // Adherence data
  const nutritionSince = user ? getNutritionSince(startDate) : [];
  const totalDays = nutritionSince.length;
  const waterDays = nutritionSince.filter((d) => d.water_liters >= 3).length;
  const supplementDays = nutritionSince.filter((d) => {
    return d.supplements_taken && d.supplements_taken.creatine;
  }).length;

  const adherenceData = {
    data: {
      waterDays,
      totalDays,
      supplementRate: totalDays > 0 ? Math.round((supplementDays / totalDays) * 100) : 0,
    },
    isLoading: false,
    error: null,
  };

  return {
    calorieData,
    strengthData,
    adherenceData,
  };
}
