'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Dumbbell, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form State
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [goal, setGoal] = useState<'bulk' | 'cut' | 'maintain'>('bulk');

  const calculateMacros = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return { calories: 2500, protein: 130 };

    // Mifflin-St Jeor Equation
    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr += gender === 'male' ? 5 : -161;

    // Activity Multiplier
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    let tdee = bmr * multipliers[activity];

    // Goal Modifier
    if (goal === 'bulk') tdee += 300;
    if (goal === 'cut') tdee -= 500;

    // Protein: 2.2g per kg of bodyweight
    const protein = Math.round(w * 2.2);

    return {
      calories: Math.round(tdee),
      protein: protein,
    };
  };

  const handleComplete = async () => {
    if (!age || !weight || !height) return;
    setLoading(true);
    
    const macros = calculateMacros();

    await updateProfile({
      is_onboarded: true,
      age: parseInt(age),
      current_weight: parseFloat(weight),
      target_weight: parseFloat(weight), // They can change this later
      height_cm: parseFloat(height),
      gender,
      activity_level: activity,
      goal,
      daily_calorie_target: macros.calories,
      daily_protein_target: macros.protein,
    });

    router.push('/dashboard');
  };

  const isFormValid = age && weight && height;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/20 mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Build Your Profile</h1>
          <p className="text-slate-400 text-sm">
            Enter your metrics so LeanForge can calculate your optimal caloric surplus and protein targets.
          </p>
        </div>

        <div className="space-y-6">
          {/* Gender & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Gender</label>
              <div className="flex gap-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium capitalize transition-all ${
                      gender === g 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Age (yrs)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="25"
              />
            </div>
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="75"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                placeholder="175"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Activity Level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as any)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
            >
              <option value="sedentary">Sedentary (Office job, no exercise)</option>
              <option value="light">Lightly Active (1-3 days/week)</option>
              <option value="moderate">Moderately Active (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very_active">Very Active (Physical job + training)</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Primary Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {(['cut', 'maintain', 'bulk'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    goal === g 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Preview macros */}
          {isFormValid && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400/80 uppercase tracking-wider font-medium">Daily Targets</p>
                <div className="flex gap-4 mt-1">
                  <p className="text-white font-bold">{calculateMacros().calories} <span className="text-sm font-normal text-slate-400">kcal</span></p>
                  <p className="text-white font-bold">{calculateMacros().protein}g <span className="text-sm font-normal text-slate-400">protein</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full py-6 mt-4"
            disabled={!isFormValid || loading}
            onClick={handleComplete}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Complete Profile
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
