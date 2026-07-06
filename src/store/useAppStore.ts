// ============================================================
// LeanForge — Zustand Global Store
// ============================================================

import { create } from 'zustand';
import { RoutineType } from '@/lib/types';

interface AppState {
  // Workout timer
  timerRunning: boolean;
  timerSeconds: number;
  timerDuration: number;
  startTimer: (duration?: number) => void;
  stopTimer: () => void;
  tickTimer: () => void;

  // Active workout
  activeRoutine: RoutineType | null;
  setActiveRoutine: (routine: RoutineType | null) => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Timer
  timerRunning: false,
  timerSeconds: 0,
  timerDuration: 90, // default 90s rest
  startTimer: (duration = 90) =>
    set({ timerRunning: true, timerSeconds: duration, timerDuration: duration }),
  stopTimer: () => set({ timerRunning: false, timerSeconds: 0 }),
  tickTimer: () =>
    set((state) => {
      if (state.timerSeconds <= 1) {
        return { timerRunning: false, timerSeconds: 0 };
      }
      return { timerSeconds: state.timerSeconds - 1 };
    }),

  // Active workout
  activeRoutine: null,
  setActiveRoutine: (routine) => set({ activeRoutine: routine }),

  // UI
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
