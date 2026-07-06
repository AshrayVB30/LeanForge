# 🏋️ LeanForge

**Track the Surplus. Forge the Muscle.**

A minimalist, high-performance PPL (Push-Pull-Legs) and calorie tracker built specifically for clean bulking — without the bloat of traditional fitness apps.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3fcf8e?logo=supabase)
![PWA](https://img.shields.io/badge/PWA-Installable-purple)

---

## ✨ Features

### 🏠 Dashboard
- Daily macro overview (Calories / Protein) with progress rings
- Water intake visualization with animated progress
- Today's PPL routine with quick-start workout button
- Supplement checklist status at a glance

### 💪 Workout Tracker
- **Auto-detects** today's routine based on a 6-day PPL split cycle
- **Progressive Overload UI** — see your last session's weight & reps directly under each exercise
- Dynamic set management — add/remove sets per exercise
- +/- stepper buttons for mobile-friendly weight (2.5kg steps) and rep input
- Configurable **rest timer** (60s / 90s / 120s)
- Pre-configured exercises:
  - **Push:** Bench Press, OHP, Incline DB Press, Lateral Raises, Tricep Pushdowns, Overhead Tricep Extension
  - **Pull:** Deadlifts, Barbell Rows, Pull-ups, Face Pulls, Barbell Curls, Hammer Curls
  - **Legs:** Squats, Leg Press, Romanian Deadlifts, Leg Curls, Calf Raises, Leg Extensions

### 🍽️ Nutrition Logger
- Large numeric calorie & protein inputs with +/- buttons and quick-add presets
- Water tracking with +0.25L / +0.5L / +1L buttons and visual progress bar
- Supplement toggle chips (Creatine, Soya Chunks, Dry Fruits, Fruits)
- Auto-saves on interaction (debounced upsert)

### 📊 Analytics
- **Calorie Adherence** — bar chart with daily target reference line
- **Protein Trend** — area chart with gradient fill
- **Strength Progression** — estimated 1RM (Epley formula) for Bench, Squat, Deadlift
- Date range selector: 7 days / 30 days / 90 days / 6 months
- Summary stats: days logged, hydration adherence, creatine consistency

### 👥 Community & Social
- **Create & Join Groups** using unique 6-character Invite Codes
- **Workout Streaks** automatically calculated from logged sessions (includes 1-day grace period for Rest Days)
- **Live Leaderboards** ranking group members by their current streak
- **Offline Multi-User Demo Mode:** The local storage engine safely partitions data per-credential, allowing multiple demo accounts to join groups and compete on the same device before connecting a real backend.

### 📱 PWA (Progressive Web App)
- Installable on iOS, Android, and desktop
- Service worker with cache-first strategy for static assets
- Standalone display mode — feels like a native app
- Dark theme optimized for OLED screens

---

## 🏗️ Architecture

```
[ User Device: Mobile / Desktop / Tablet ]
                    │
                    ▼
    [ Next.js Front-End (Vercel) ]
  (Tailwind CSS + PWA Service Worker)
                    │
  ┌─────────────────┴─────────────────┐
  ▼                                   ▼
[ Supabase Auth ]           [ Supabase Database ]
(Session Mgmt)             (PostgreSQL - Logs & Analytics)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- A **Supabase** project ([create one free](https://supabase.com))

### 1. Clone & Install

```bash
cd leanforge
npm install
```

### 2. Configure Supabase

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> 💡 Find these in: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

### 3. Initialize Database

Run the SQL migration in your Supabase SQL Editor:

```bash
# Copy the contents of this file and paste in the Supabase SQL Editor:
supabase/migrations/001_initial_schema.sql
```

This creates:
- `users` — User profiles with calorie/protein/weight targets
- `workout_logs` — Workout session records
- `exercise_logs` — Individual sets (weight × reps)
- `nutrition_logs` — Daily calorie, protein, water, supplements
- **Row Level Security** — Users can only access their own data
- **Auto-profile trigger** — Creates user profile on signup

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
leanforge/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── icons/                  # PWA icons (192, 512)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + providers
│   │   ├── client-layout.tsx   # Conditional nav rendering
│   │   ├── globals.css         # Tailwind + design tokens
│   │   ├── page.tsx            # Redirect → /dashboard
│   │   ├── login/page.tsx      # Auth (sign in / sign up)
│   │   ├── dashboard/page.tsx  # Daily overview
│   │   ├── workout/page.tsx    # PPL workout tracker
│   │   ├── nutrition/page.tsx  # Calorie/protein/water/supplements
│   │   └── analytics/page.tsx  # Charts & trends
│   ├── components/
│   │   ├── ui/                 # Button, Card, Input, Badge, Skeleton
│   │   └── layout/             # Navbar, BottomNav, PageContainer
│   ├── hooks/                  # useWorkout, useNutrition, useAnalytics
│   ├── lib/
│   │   ├── supabase/           # Browser + server clients
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── ppl.ts              # PPL logic, exercises, 1RM calc
│   │   └── utils.ts            # Date/math helpers
│   ├── providers/              # AuthProvider, QueryProvider
│   └── store/                  # Zustand (UI state, timer)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── middleware.ts                # Auth route protection
└── .env.local.example          # Environment template
```

---

## 🎨 Design System

| Token              | Value       | Usage                           |
|---------------------|-------------|----------------------------------|
| Background          | `#0f172a`   | Dark Slate — main background     |
| Surface             | `#1e293b`   | Cards, inputs                    |
| Primary             | `#10b981`   | Emerald — CTAs, positive states  |
| Calories            | `#f97316`   | Orange — calorie indicators      |
| Protein             | `#ef4444`   | Red — protein indicators         |
| Water               | `#3b82f6`   | Blue — hydration indicators      |
| Push Routine        | `#60a5fa`   | Blue — Push day badge            |
| Pull Routine        | `#a78bfa`   | Purple — Pull day badge          |
| Legs Routine        | `#fb923c`   | Orange — Legs day badge          |

---

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Framework      | Next.js 14 (App Router)              |
| Language       | TypeScript 5                         |
| Styling        | Tailwind CSS 4                       |
| Icons          | Lucide React                         |
| State (UI)     | Zustand                              |
| Data Fetching  | TanStack React Query                 |
| Charts         | Recharts                             |
| Auth           | Supabase Auth                        |
| Database       | Supabase (PostgreSQL)                |
| PWA            | Custom Service Worker + Manifest     |

---

## 📱 PWA Installation

### iOS (Safari)
1. Open LeanForge in Safari
2. Tap the **Share** button (↑)
3. Select **"Add to Home Screen"**

### Android (Chrome)
1. Open LeanForge in Chrome
2. Tap the **three-dot menu** (⋮)
3. Select **"Install app"** or **"Add to Home screen"**

### Desktop (Chrome/Edge)
1. Look for the **install icon** (⊕) in the URL bar
2. Click **"Install"**

---

## 🧮 PPL Split Schedule

| Cycle Day | Routine |
|-----------|---------|
| Day 1     | Push    |
| Day 2     | Pull    |
| Day 3     | Legs    |
| Day 4     | Push    |
| Day 5     | Pull    |
| Day 6     | Legs    |
| Day 7     | Rest    |

The app automatically determines today's routine based on a rolling 7-day cycle.

---

## 🔒 Security

- **Row Level Security (RLS):** All database tables enforce that users can only read/write their own data
- **Server-side auth:** Next.js middleware validates sessions on every protected route
- **No client-side data exposure:** Supabase anon key is safe for client use (RLS enforces access control)

---

## 📄 License

MIT — Built for personal use, open for the community.

---

<p align="center">
  <strong>Built with 💪 for clean bulking. No bloat. Just gains.</strong>
</p>
