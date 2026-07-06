'use client';

// ============================================================
// LeanForge — Dashboard Page
// ============================================================

import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import { useNutrition } from '@/hooks/useNutrition';
import { useWorkout } from '@/hooks/useWorkout';
import { getTodayRoutine, SUPPLEMENTS, WATER_TARGET } from '@/lib/ppl';
import { percentage } from '@/lib/utils';
import type { SupplementsTaken } from '@/lib/types';
import Link from 'next/link';
import {
  Flame,
  Beef,
  Droplets,
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Circle,
  TrendingUp,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { todayNutrition } = useNutrition();
  const { todayWorkout } = useWorkout();

  const routine = getTodayRoutine();
  const nutrition = todayNutrition.data;
  const workout = todayWorkout.data;

  const calorieTarget = profile?.daily_calorie_target || 2500;
  const proteinTarget = profile?.daily_protein_target || 130;
  const currentCalories = nutrition?.calories || 0;
  const currentProtein = nutrition?.protein_g || 0;
  const currentWater = nutrition?.water_liters || 0;
  const supplements = (nutrition?.supplements_taken as SupplementsTaken) || {
    creatine: false,
    soya_chunks: false,
    dry_fruits: false,
    fruits: false,
  };

  if (authLoading) {
    return (
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </PageContainer>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {greeting()} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Calories Card */}
        <Card variant="glass" className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Calories</span>
              </div>
              <span className="text-xs text-slate-500">{percentage(currentCalories, calorieTarget)}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{currentCalories}</span>
                <span className="text-slate-500 text-sm">/ {calorieTarget} kcal</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(percentage(currentCalories, calorieTarget), 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {currentCalories >= calorieTarget ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Target reached!
                  </span>
                ) : (
                  `${calorieTarget - currentCalories} kcal remaining`
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Protein Card */}
        <Card variant="glass" className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Beef className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Protein</span>
              </div>
              <span className="text-xs text-slate-500">{percentage(currentProtein, proteinTarget)}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{currentProtein}</span>
                <span className="text-slate-500 text-sm">/ {proteinTarget}g</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(percentage(currentProtein, proteinTarget), 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {currentProtein >= proteinTarget ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Target reached!
                  </span>
                ) : (
                  `${proteinTarget - currentProtein}g remaining`
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Water Card */}
        <Card variant="glass" className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-300">Water</span>
              </div>
              <span className="text-xs text-slate-500">{percentage(currentWater, WATER_TARGET)}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{currentWater.toFixed(1)}</span>
                <span className="text-slate-500 text-sm">/ {WATER_TARGET}L</span>
              </div>
              {/* Water drops visualization */}
              <div className="flex gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                      i < Math.floor(currentWater * 2)
                        ? 'bg-gradient-to-t from-blue-500 to-cyan-400'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <Link href="/nutrition" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Log water →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Today's Workout Quick Start */}
        <Card variant="glass" hover className="md:col-span-2 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                  <Dumbbell className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">Today&apos;s Workout</h3>
                    <Badge variant="routine" routine={routine}>{routine}</Badge>
                  </div>
                  {workout ? (
                    <p className="text-sm text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed today
                    </p>
                  ) : routine === 'Rest' ? (
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Rest day — recover and grow
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Time to push your limits
                    </p>
                  )}
                </div>
              </div>
              {routine !== 'Rest' && !workout && (
                <Link href="/workout">
                  <Button size="lg">
                    Start Workout
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supplements Checklist */}
        <Card variant="glass" className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="text-lg">💊</span> Supplements
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {SUPPLEMENTS.map((supp) => {
                const checked = supplements[supp.key];
                return (
                  <div
                    key={supp.key}
                    className="flex items-center gap-3 text-sm"
                  >
                    {checked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <span className={checked ? 'text-slate-300 line-through' : 'text-slate-400'}>
                      {supp.emoji} {supp.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link href="/nutrition" className="block mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                Update Supplements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
