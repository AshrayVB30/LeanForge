import { Dumbbell } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
        <div className="w-16 h-16 bg-slate-900 border border-emerald-500/30 rounded-2xl flex items-center justify-center relative shadow-2xl shadow-emerald-500/20 animate-bounce">
          <Dumbbell className="w-8 h-8 text-emerald-400" />
        </div>
      </div>
      <h2 className="mt-6 text-xl font-bold text-white tracking-tight animate-pulse">
        LeanForge
      </h2>
      <p className="text-sm text-slate-500 mt-2 font-medium tracking-wide">
        Forging your session...
      </p>
    </div>
  );
}
