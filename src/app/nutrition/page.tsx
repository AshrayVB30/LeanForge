'use client';

// ============================================================
// LeanForge — Nutrition Logger Page
// ============================================================

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import { useNutrition } from '@/hooks/useNutrition';
import { SUPPLEMENTS, WATER_TARGET } from '@/lib/ppl';
import { percentage } from '@/lib/utils';
import type { SupplementsTaken } from '@/lib/types';
import {
  Flame,
  Beef,
  Droplets,
  Plus,
  Minus,
  CheckCircle2,
  Circle,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';

export default function NutritionPage() {
  const { profile, loading: authLoading } = useAuth();
  const {
    todayNutrition,
    updateNutrition,
    addWater,
    toggleSupplement,
  } = useNutrition();

  const nutrition = todayNutrition.data;
  const calorieTarget = profile?.daily_calorie_target || 2500;
  const proteinTarget = profile?.daily_protein_target || 130;

  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);

  // Sync local state with server data (only when the actual remote values change)
  useEffect(() => {
    if (nutrition) {
      setCalories(nutrition.calories);
      setProtein(nutrition.protein_g);
    }
  }, [nutrition?.calories, nutrition?.protein_g]);

  const currentWater = nutrition?.water_liters || 0;
  const supplements = (nutrition?.supplements_taken as SupplementsTaken) || {
    creatine: false,
    soya_chunks: false,
    dry_fruits: false,
    fruits: false,
  };

  // Debounced save for calorie/protein
  useEffect(() => {
    if (!nutrition && calories === 0 && protein === 0) return;
    const timeout = setTimeout(() => {
      if (calories !== (nutrition?.calories || 0) || protein !== (nutrition?.protein_g || 0)) {
        updateNutrition.mutate({
          calories,
          protein_g: protein,
          water_liters: currentWater,
          supplements_taken: supplements,
        });
      }
    }, 800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calories, protein]);

  if (authLoading || todayNutrition.isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </PageContainer>
    );
  }

  const caloriePercent = percentage(calories, calorieTarget);
  const proteinPercent = percentage(protein, proteinTarget);
  const waterPercent = percentage(currentWater, WATER_TARGET);
  const supplementsDone = Object.values(supplements).filter(Boolean).length;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
          Nutrition
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-4">
        {/* Calories */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">Calories</span>
              <span className="ml-auto text-xs text-slate-500">{caloriePercent}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6 mb-4">
              <button
                onClick={() => setCalories(Math.max(0, calories - 100))}
                className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center">
                <input
                  type="number"
                  value={calories || ''}
                  onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                  className="text-5xl font-bold text-white bg-transparent text-center w-40 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                <p className="text-sm text-slate-500">/ {calorieTarget} kcal</p>
              </div>
              <button
                onClick={() => setCalories(calories + 100)}
                className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {/* Quick add buttons */}
            <div className="flex justify-center gap-2">
              {[250, 500, 750].map((val) => (
                <button
                  key={val}
                  onClick={() => setCalories(calories + val)}
                  className="px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all"
                >
                  +{val}
                </button>
              ))}
            </div>
            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(caloriePercent, 100)}%` }}
              />
            </div>
            {calories >= calorieTarget && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 justify-center">
                <Sparkles className="w-3 h-3" /> Surplus achieved! Keep fueling the gains.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Protein */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Beef className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">Protein</span>
              <span className="ml-auto text-xs text-slate-500">{proteinPercent}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6 mb-4">
              <button
                onClick={() => setProtein(Math.max(0, protein - 10))}
                className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center">
                <input
                  type="number"
                  value={protein || ''}
                  onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                  className="text-5xl font-bold text-white bg-transparent text-center w-32 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />
                <p className="text-sm text-slate-500">/ {proteinTarget}g</p>
              </div>
              <button
                onClick={() => setProtein(protein + 10)}
                className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {/* Quick add buttons */}
            <div className="flex justify-center gap-2">
              {[20, 30, 50].map((val) => (
                <button
                  key={val}
                  onClick={() => setProtein(protein + val)}
                  className="px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                >
                  +{val}g
                </button>
              ))}
            </div>
            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(proteinPercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Water Tracker */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-slate-300">Water Intake</span>
              <span className="ml-auto text-xs text-slate-500">{waterPercent}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-white">{currentWater.toFixed(1)}</span>
              <span className="text-slate-500 text-lg ml-1">/ {WATER_TARGET}L</span>
            </div>

            {/* Water level visualization */}
            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(waterPercent, 100)}%` }}
              />
            </div>

            {/* +/- buttons */}
            <div className="flex justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addWater.mutate(-0.5)}
                disabled={currentWater <= 0}
              >
                <Minus className="w-3.5 h-3.5" />
                0.5L
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addWater.mutate(0.25)}
              >
                <Plus className="w-3.5 h-3.5" />
                0.25L
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addWater.mutate(0.5)}
              >
                <Plus className="w-3.5 h-3.5" />
                0.5L
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addWater.mutate(1)}
              >
                <Plus className="w-3.5 h-3.5" />
                1L
              </Button>
            </div>

            {currentWater >= WATER_TARGET && (
              <p className="text-xs text-emerald-400 mt-3 flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3 h-3" /> Hydration goal met!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Supplements */}
        <Card variant="glass">
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="text-lg">💊</span> Daily Supplements
              <span className="ml-auto text-xs text-slate-500">
                {supplementsDone}/{SUPPLEMENTS.length}
              </span>
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {SUPPLEMENTS.map((supp) => {
                const checked = supplements[supp.key];
                return (
                  <button
                    key={supp.key}
                    onClick={() => toggleSupplement.mutate(supp.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-95 ${
                      checked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {checked ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 shrink-0" />
                    )}
                    <div className="text-left">
                      <span className="text-sm font-medium">{supp.emoji} {supp.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
