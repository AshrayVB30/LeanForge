'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import type { NutritionLog, SupplementsTaken } from '@/lib/types';
import { getToday } from '@/lib/utils';

export function useNutrition() {
  const { user } = useAuth();
  const today = getToday();
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Today's nutrition
  const todayNutrition = useQuery({
    queryKey: ['nutrition', today, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      return data as NutritionLog | null;
    },
    enabled: !!user,
  });

  // Helper to upsert
  const upsertData = async (updates: Partial<NutritionLog>) => {
    if (!user) throw new Error('Not authenticated');
    
    // get existing to merge (since supabase upsert replaces entire row if not careful, though we can just update if it exists)
    const { data: existing } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    const merged = {
      user_id: user.id,
      date: today,
      calories: updates.calories ?? existing?.calories ?? 0,
      protein_g: updates.protein_g ?? existing?.protein_g ?? 0,
      water_liters: updates.water_liters ?? existing?.water_liters ?? 0,
      supplements_taken: {
        creatine: updates.supplements_taken?.creatine ?? existing?.supplements_taken?.creatine ?? false,
        soya_chunks: updates.supplements_taken?.soya_chunks ?? existing?.supplements_taken?.soya_chunks ?? false,
        dry_fruits: updates.supplements_taken?.dry_fruits ?? existing?.supplements_taken?.dry_fruits ?? false,
        fruits: updates.supplements_taken?.fruits ?? existing?.supplements_taken?.fruits ?? false,
      }
    };

    const { data, error } = await supabase
      .from('nutrition_logs')
      .upsert(merged, { onConflict: 'user_id,date' })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  };

  // Update nutrition (calories/protein)
  const updateNutrition = useMutation({
    mutationFn: async (updates: Partial<NutritionLog>) => upsertData(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', today, user?.id] });
    },
  });

  // Add water
  const addWater = useMutation({
    mutationFn: async (amount: number) => {
      const current = todayNutrition.data?.water_liters || 0;
      return upsertData({ water_liters: Math.max(0, current + amount) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', today, user?.id] });
    },
  });

  // Toggle supplement
  const toggleSupplement = useMutation({
    mutationFn: async (key: keyof SupplementsTaken) => {
      const currentSupps = todayNutrition.data?.supplements_taken || {
        creatine: false,
        soya_chunks: false,
        dry_fruits: false,
        fruits: false,
      };
      
      const updatedSupps = {
        ...currentSupps,
        [key]: !currentSupps[key],
      };
      
      return upsertData({ supplements_taken: updatedSupps });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', today, user?.id] });
    },
  });

  return {
    todayNutrition,
    updateNutrition,
    addWater,
    toggleSupplement,
  };
}
