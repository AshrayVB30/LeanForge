import Link from 'next/link';
import { Dumbbell, ArrowRight, Flame, Beef, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Dumbbell className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">LeanForge</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-12 md:mt-24 mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Built for Clean Bulking
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl">
          Track the Surplus. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Forge the Muscle.
          </span>
        </h1>

        <p className="mt-4 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A minimalist, high-performance PPL and macro tracker built specifically for those who want to build muscle without the bloat of traditional fitness apps.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
          >
            Start Forging
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl transition-all active:scale-95"
          >
            See Features
          </a>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 bg-slate-900/50 border-t border-slate-800/50 py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Macros</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatically calculate your TDEE and set perfect surplus targets for optimal muscle growth with minimal fat gain.
              </p>
            </div>
            
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">PPL Tracking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Log your Push, Pull, and Legs sessions with ease. Track your progressive overload and beat your previous bests.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Beef className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Frictionless Logging</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No barcode scanners, no database searching. Just quick, manual entry of calories and protein to keep you focused.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
