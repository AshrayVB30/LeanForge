'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import type { WorkoutLog, ExerciseLog, ExerciseEntry } from '@/lib/types';
import { getToday } from '@/lib/utils';

export function useWorkout() {
  const { user } = useAuth();
  const today = getToday();
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Today's workout
  const todayWorkout = useQuery({
    queryKey: ['workout', today, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: workout, error: workoutError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
        
      if (workoutError || !workout) return null;

      const { data: exercises } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('workout_log_id', workout.id)
        .order('created_at', { ascending: true });

      return { workout: workout as WorkoutLog, exercises: exercises as ExerciseLog[] };
    },
    enabled: !!user,
  });

  // Previous exercise data
  const usePreviousExercise = (exerciseName: string) => {
    return useQuery({
      queryKey: ['exercise', exerciseName, 'previous', user?.id],
      queryFn: async () => {
        if (!user) return null;
        
        // Find most recent log for this exercise
        const { data: logs, error } = await supabase
          .from('exercise_logs')
          .select('workout_log_id, weight_kg, reps')
          .eq('exercise_name', exerciseName)
          .order('created_at', { ascending: false })
          .limit(10); // get a few to ensure we find one not from today

        if (error || !logs || logs.length === 0) return null;
        
        // Find the one that belongs to a previous workout
        // Need to fetch the workout dates to filter out today
        const workoutIds = logs.map(l => l.workout_log_id);
        const { data: workouts } = await supabase
          .from('workout_logs')
          .select('id, date')
          .in('id', workoutIds);
          
        if (!workouts) return null;
        
        const previousWorkouts = workouts.filter(w => w.date !== today).sort((a, b) => b.date.localeCompare(a.date));
        if (previousWorkouts.length === 0) return null;
        
        const lastWorkoutId = previousWorkouts[0].id;
        // get all sets for that exercise in that workout
        const { data: prevSets } = await supabase
          .from('exercise_logs')
          .select('*')
          .eq('workout_log_id', lastWorkoutId)
          .eq('exercise_name', exerciseName)
          .order('created_at', { ascending: true });
          
        if (!prevSets || prevSets.length === 0) return null;
        
        // Return the best/first set's weight and reps
        return {
          weight_kg: prevSets[0].weight_kg,
          reps: prevSets[0].reps
        };
      },
      enabled: !!user && !!exerciseName,
    });
  };

  // Save workout
  const saveWorkout = useMutation({
    mutationFn: async ({
      routineType,
      exercises,
      notes,
    }: {
      routineType: string;
      exercises: ExerciseEntry[];
      notes: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Upsert workout log
      const { data: workout, error: workoutError } = await supabase
        .from('workout_logs')
        .upsert({
          user_id: user.id,
          date: today,
          routine_type: routineType,
          notes,
          duration_minutes: 0,
        }, { onConflict: 'user_id,date' })
        .select()
        .single();
        
      if (workoutError) throw workoutError;

      // Delete existing exercise logs for this workout to recreate them
      await supabase
        .from('exercise_logs')
        .delete()
        .eq('workout_log_id', workout.id);

      // Insert new exercise logs
      const insertData = exercises.flatMap((ex) => 
        ex.sets.map((set, i) => ({
          workout_log_id: workout.id,
          exercise_name: ex.exercise_name,
          weight_kg: set.weight_kg,
          reps: set.reps,
          set_order: i
        }))
      );
      
      if (insertData.length > 0) {
        const { error: exerciseError } = await supabase
          .from('exercise_logs')
          .insert(insertData);
          
        if (exerciseError) throw exerciseError;
      }

      return workout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout'] });
      queryClient.invalidateQueries({ queryKey: ['exercise'] });
    },
  });

  return {
    todayWorkout,
    usePreviousExercise,
    saveWorkout,
  };
}
