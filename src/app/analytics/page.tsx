'use client';

// ============================================================
// LeanForge — Analytics Page
// ============================================================

import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/providers/AuthProvider';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { DateRange } from '@/lib/types';
import { KEY_LIFTS } from '@/lib/ppl';
import { formatDateDisplay } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Droplets,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

// Custom tooltip
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '6mo', label: '6 Months' },
];

const LIFT_COLORS: Record<string, string> = {
  'Bench Press': '#3b82f6',
  'Squats': '#f97316',
  'Deadlifts': '#a855f7',
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { loading: authLoading, profile } = useAuth();
  const { calorieData, strengthData, adherenceData } = useAnalytics(dateRange);

  if (authLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </PageContainer>
    );
  }

  const calorieChartData = calorieData.data || [];
  const strengthChartData = strengthData.data || [];
  const adherence = adherenceData.data;

  // Group strength data by lift for separate lines
  const strengthByLift = KEY_LIFTS.reduce(
    (acc, lift) => {
      acc[lift] = strengthChartData.filter((d) => d.exercise_name === lift);
      return acc;
    },
    {} as Record<string, typeof strengthChartData>
  );

  // Create merged strength data for multi-line chart
  const allDates = [...new Set(strengthChartData.map((d) => d.date))].sort();
  const mergedStrength = allDates.map((date) => {
    const point: Record<string, string | number> = { date: formatDateDisplay(date) };
    KEY_LIFTS.forEach((lift) => {
      const entry = strengthChartData.find(
        (d) => d.date === date && d.exercise_name === lift
      );
      if (entry) point[lift] = entry.estimated_1rm;
    });
    return point;
  });

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">Track your progress over time</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                dateRange === range.value
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      {adherence && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card variant="glass" className="p-4 text-center">
            <Target className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{calorieChartData.length}</p>
            <p className="text-xs text-slate-500">Days Logged</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{adherence.waterDays}</p>
            <p className="text-xs text-slate-500">3L+ Water Days</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{adherence.supplementRate}%</p>
            <p className="text-xs text-slate-500">Creatine Rate</p>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        {/* Calorie Adherence Chart */}
        <Card variant="glass">
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              🔥 Calorie Adherence
            </h3>
          </CardHeader>
          <CardContent>
            {calorieChartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
                No nutrition data yet. Start logging to see trends.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calorieChartData.map((d) => ({ ...d, date: formatDateDisplay(d.date) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#1e293b' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#1e293b' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={profile?.daily_calorie_target || 2500}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      label={{ value: 'Target', position: 'right', fill: '#10b981', fontSize: 10 }}
                    />
                    <Bar
                      dataKey="calories"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                      name="Calories"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Protein Trend Chart */}
        <Card variant="glass">
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              🥩 Protein Trend
            </h3>
          </CardHeader>
          <CardContent>
            {calorieChartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
                No data yet.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calorieChartData.map((d) => ({ ...d, date: formatDateDisplay(d.date) }))}>
                    <defs>
                      <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#1e293b' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#1e293b' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={profile?.daily_protein_target || 130}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      label={{ value: 'Target', position: 'right', fill: '#10b981', fontSize: 10 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="protein_g"
                      stroke="#ef4444"
                      fill="url(#proteinGradient)"
                      name="Protein (g)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strength Progression Chart */}
        <Card variant="glass">
          <CardHeader>
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              💪 Strength Progression (Est. 1RM)
            </h3>
          </CardHeader>
          <CardContent>
            {mergedStrength.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-600 text-sm">
                No workout data yet. Complete workouts to track strength gains.
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedStrength}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#1e293b' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={{ stroke: '#1e293b' }}
                      label={{
                        value: 'kg',
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#64748b',
                        fontSize: 10,
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                    />
                    {KEY_LIFTS.map((lift) => (
                      <Line
                        key={lift}
                        type="monotone"
                        dataKey={lift}
                        stroke={LIFT_COLORS[lift]}
                        strokeWidth={2}
                        dot={{ r: 4, fill: LIFT_COLORS[lift] }}
                        connectNulls
                        name={lift}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
