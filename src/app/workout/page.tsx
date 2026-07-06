'use client';

// ============================================================
// LeanForge — Workout Tracker Page
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkout } from '@/hooks/useWorkout';
import { useAppStore } from '@/store/useAppStore';
import {
  getTodayRoutine,
  getExercisesForRoutine,
  createEmptyExerciseEntries,
} from '@/lib/ppl';
import type { ExerciseEntry, ExerciseSet, RoutineType } from '@/lib/types';
import {
  Plus,
  Minus,
  Save,
  CheckCircle2,
  History,
  Timer,
  X,
  Dumbbell,
  TrendingUp,
  RotateCcw,
  Zap,
} from 'lucide-react';

// ---- Progressive Overload Hint ----
function PreviousSetHint({ exerciseName }: { exerciseName: string }) {
  const { usePreviousExercise } = useWorkout();
  const { data: previous, isLoading } = usePreviousExercise(exerciseName);

  if (isLoading) {
    return <div className="h-4 w-32 bg-slate-800 animate-pulse rounded" />;
  }

  if (!previous) {
    return (
      <span className="text-xs text-slate-600 italic">No previous data</span>
    );
  }

  return (
    <span className="text-xs text-amber-400/80 flex items-center gap-1">
      <History className="w-3 h-3" />
      Last: {previous.weight_kg}kg × {previous.reps} reps
    </span>
  );
}

// ---- Set Row ----
function SetRow({
  set,
  onUpdate,
  onRemove,
  canRemove,
}: {
  set: ExerciseSet;
  onUpdate: (field: 'weight_kg' | 'reps', value: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-8 text-center shrink-0">
        S{set.set_number}
      </span>

      {/* Weight Input */}
      <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden flex-1">
        <button
          type="button"
          onClick={() => onUpdate('weight_kg', Math.max(0, set.weight_kg - 2.5))}
          className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          value={set.weight_kg || ''}
          onChange={(e) => onUpdate('weight_kg', parseFloat(e.target.value) || 0)}
          className="w-full text-center bg-transparent text-white text-sm py-2 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0"
          step="2.5"
        />
        <button
          type="button"
          onClick={() => onUpdate('weight_kg', set.weight_kg + 2.5)}
          className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <span className="text-xs text-slate-500 shrink-0">kg</span>

      {/* Reps Input */}
      <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden flex-1">
        <button
          type="button"
          onClick={() => onUpdate('reps', Math.max(0, set.reps - 1))}
          className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          value={set.reps || ''}
          onChange={(e) => onUpdate('reps', parseInt(e.target.value) || 0)}
          className="w-full text-center bg-transparent text-white text-sm py-2 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0"
        />
        <button
          type="button"
          onClick={() => onUpdate('reps', set.reps + 1)}
          className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <span className="text-xs text-slate-500 shrink-0">reps</span>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ---- Exercise Card ----
function ExerciseCard({
  exercise,
  onUpdate,
}: {
  exercise: ExerciseEntry;
  onUpdate: (updated: ExerciseEntry) => void;
}) {
  const addSet = () => {
    const newSet: ExerciseSet = {
      set_number: exercise.sets.length + 1,
      weight_kg: exercise.sets[exercise.sets.length - 1]?.weight_kg || 0,
      reps: exercise.sets[exercise.sets.length - 1]?.reps || 0,
    };
    onUpdate({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const updateSet = (index: number, field: 'weight_kg' | 'reps', value: number) => {
    const updatedSets = exercise.sets.map((set, i) =>
      i === index ? { ...set, [field]: value } : set
    );
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const removeSet = (index: number) => {
    const updatedSets = exercise.sets
      .filter((_, i) => i !== index)
      .map((set, i) => ({ ...set, set_number: i + 1 }));
    onUpdate({ ...exercise, sets: updatedSets });
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">
              {exercise.exercise_name}
            </h3>
            <PreviousSetHint exerciseName={exercise.exercise_name} />
          </div>
          <span className="text-xs text-slate-500">
            {exercise.sets.length} set{exercise.sets.length > 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {exercise.sets.map((set, i) => (
            <SetRow
              key={i}
              set={set}
              onUpdate={(field, value) => updateSet(i, field, value)}
              onRemove={() => removeSet(i)}
              canRemove={exercise.sets.length > 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addSet}
          className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Set
        </button>
      </CardContent>
    </Card>
  );
}

// ---- Rest Timer ----
function RestTimer() {
  const { timerRunning, timerSeconds, startTimer, stopTimer, tickTimer } = useAppStore();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (timerRunning) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 animate-in">
        <div className="flex items-center gap-3">
          <Timer className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-2xl font-bold text-white font-mono">
            {formatTime(timerSeconds)}
          </span>
          <button
            onClick={stopTimer}
            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
      <div className="flex gap-1.5">
        {[60, 90, 120].map((secs) => (
          <button
            key={secs}
            onClick={() => startTimer(secs)}
            className="px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl text-xs text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
          >
            <Timer className="w-3 h-3 inline mr-1" />
            {secs}s
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function WorkoutPage() {
  const { loading: authLoading } = useAuth();
  const { todayWorkout, saveWorkout } = useWorkout();
  const routine = getTodayRoutine();
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineType>(
    routine === 'Rest' ? 'Push' : routine
  );

  // Initialize exercises when routine changes
  useEffect(() => {
    if (selectedRoutine && selectedRoutine !== 'Rest') {
      setExercises(createEmptyExerciseEntries(selectedRoutine));
    }
  }, [selectedRoutine]);

  const updateExercise = useCallback((index: number, updated: ExerciseEntry) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? updated : ex))
    );
  }, []);

  const handleSave = async () => {
    try {
      await saveWorkout.mutateAsync({
        routineType: selectedRoutine,
        exercises,
        notes,
      });
      setSaved(true);
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  if (authLoading) {
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

  // Workout already completed today
  if (todayWorkout.data || saved) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Workout Complete! 💪</h2>
          <p className="text-slate-400 mb-1">
            Great {selectedRoutine} session today.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Recovery is where the gains happen. Rest up.
          </p>
          <Button
            variant="secondary"
            onClick={() => { setSaved(false); }}
          >
            <RotateCcw className="w-4 h-4" />
            Log Another Workout
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-emerald-400" />
              Workout Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {routine === 'Rest' ? 'Rest day — but you can still train!' : `Today\'s routine`}
            </p>
          </div>
        </div>

        {/* Routine Selector */}
        <div className="flex gap-2">
          {(['Push', 'Pull', 'Legs'] as RoutineType[]).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoutine(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedRoutine === r
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {r}
              {r === routine && routine !== 'Rest' && (
                <Zap className="w-3 h-3 inline ml-1 text-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.map((exercise, i) => (
          <ExerciseCard
            key={exercise.exercise_name}
            exercise={exercise}
            onUpdate={(updated) => updateExercise(i, updated)}
          />
        ))}
      </div>

      {/* Notes */}
      <Card variant="glass" className="mt-4">
        <CardContent className="p-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Session notes (optional)..."
            className="w-full bg-transparent text-slate-300 text-sm placeholder-slate-600 resize-none focus:outline-none min-h-[60px]"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saveWorkout.isPending}
          className="min-w-[200px]"
        >
          {saveWorkout.isPending ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Workout
            </>
          )}
        </Button>
      </div>

      {/* Rest Timer */}
      <RestTimer />
    </PageContainer>
  );
}
