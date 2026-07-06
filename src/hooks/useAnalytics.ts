'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import type { CalorieDataPoint, StrengthDataPoint, DateRange, NutritionLog, ExerciseLog } from '@/lib/types';
import { getDaysAgo, getDateRangeDays } from '@/lib/utils';
import { calculateEstimated1RM, KEY_LIFTS } from '@/lib/ppl';

export function useAnalytics(dateRange: DateRange = '30d') {
  const { user, profile } = useAuth();
  const days = getDateRangeDays(dateRange);
  const startDate = getDaysAgo(days);
  const supabase = createClient();

  // Shared query for nutrition data
  const { data: nutritionLogs, isLoading: isNutritionLoading } = useQuery({
    queryKey: ['nutrition_logs', startDate, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .order('date', { ascending: true });
        
      if (error) throw error;
      return data as NutritionLog[];
    },
    enabled: !!user,
  });

  // Calorie data processing
  const calorieChartData: CalorieDataPoint[] = (nutritionLogs || []).map((d) => ({
    date: d.date,
    calories: d.calories,
    target: profile?.daily_calorie_target || 2500,
    protein_g: d.protein_g,
  }));

  const calorieData = {
    data: calorieChartData,
    isLoading: isNutritionLoading,
    error: null,
  };

  // Shared query for workout + exercise logs
  const { data: rawExerciseLogs, isLoading: isStrengthLoading } = useQuery({
    queryKey: ['exercise_logs', startDate, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get workout logs since startDate
      const { data: workouts, error: workoutError } = await supabase
        .from('workout_logs')
        .select('id, date')
        .eq('user_id', user.id)
        .gte('date', startDate);
        
      if (workoutError || !workouts || workouts.length === 0) return [];
      
      const workoutIds = workouts.map(w => w.id);
      const workoutDateMap = new Map(workouts.map(w => [w.id, w.date]));
      
      // Get exercise logs for key lifts
      const { data: exercises, error: exerciseError } = await supabase
        .from('exercise_logs')
        .select('*')
        .in('workout_log_id', workoutIds)
        .in('exercise_name', KEY_LIFTS);
        
      if (exerciseError || !exercises) return [];
      
      // Attach date
      return exercises.map(ex => ({
        ...ex,
        date: workoutDateMap.get(ex.workout_log_id) as string
      }));
    },
    enabled: !!user,
  });

  // Strength data processing
  const grouped = new Map<string, StrengthDataPoint>();
  if (rawExerciseLogs) {
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
  }
  const strengthChartData = Array.from(grouped.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const strengthData = {
    data: strengthChartData,
    isLoading: isStrengthLoading,
    error: null,
  };

  // Adherence data processing
  const totalDays = nutritionLogs?.length || 0;
  const waterDays = (nutritionLogs || []).filter((d) => d.water_liters >= 3).length;
  const supplementDays = (nutritionLogs || []).filter((d) => {
    return d.supplements_taken && d.supplements_taken.creatine;
  }).length;

  const adherenceData = {
    data: {
      waterDays,
      totalDays,
      supplementRate: totalDays > 0 ? Math.round((supplementDays / totalDays) * 100) : 0,
    },
    isLoading: isNutritionLoading,
    error: null,
  };

  return {
    calorieData,
    strengthData,
    adherenceData,
  };
}
