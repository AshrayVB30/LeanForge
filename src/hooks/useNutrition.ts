'use client';

// ============================================================
// LeanForge — Nutrition Hook (localStorage-based, works offline)
// ============================================================

import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  getTodayNutrition,
  upsertNutrition,
  addWaterLocal,
  toggleSupplementLocal,
  getNutritionHistory,
} from '@/lib/storage';
import type { NutritionLog, SupplementsTaken } from '@/lib/types';
import { getToday } from '@/lib/utils';

export function useNutrition() {
  const { user } = useAuth();
  const today = getToday();
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Today's nutrition — reactive via refreshKey
  const nutritionData = user ? getTodayNutrition(today) : null;

  const todayNutrition = {
    data: nutritionData,
    isLoading: false,
    error: null,
    _refreshKey: refreshKey,
  };

  // Update nutrition
  const updateNutrition = {
    mutate: (updates: Partial<NutritionLog>) => {
      if (!user) return;
      upsertNutrition(today, updates);
      refresh();
    },
    isPending: false,
  };

  // Add water
  const addWater = {
    mutate: (amount: number) => {
      if (!user) return;
      addWaterLocal(today, amount);
      refresh();
    },
    isPending: false,
  };

  // Toggle supplement
  const toggleSupplement = {
    mutate: (key: keyof SupplementsTaken) => {
      if (!user) return;
      toggleSupplementLocal(today, key);
      refresh();
    },
    isPending: false,
  };

  // History
  const nutritionHistory = {
    data: user ? getNutritionHistory() : [],
    isLoading: false,
    error: null,
  };

  return {
    todayNutrition,
    updateNutrition,
    addWater,
    toggleSupplement,
    nutritionHistory,
  };
}
