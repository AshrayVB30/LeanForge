-- ============================================================
-- LeanForge — Database Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- Users profile table (extends Supabase auth.users)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  target_weight NUMERIC(5,2) DEFAULT 0.00,
  daily_calorie_target INT DEFAULT 0,
  daily_protein_target INT DEFAULT 0,
  is_onboarded BOOLEAN DEFAULT false,
  current_weight NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  age INT,
  gender TEXT,
  activity_level TEXT,
  goal TEXT
);

-- --------------------------------------------------------
-- Workout session logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  routine_type TEXT CHECK (routine_type IN ('Push', 'Pull', 'Legs')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, date);

-- --------------------------------------------------------
-- Individual exercise sets within a workout
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  set_number INT NOT NULL,
  weight_kg NUMERIC(5,2),
  reps INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_workout ON public.exercise_logs(workout_log_id);

-- --------------------------------------------------------
-- Daily nutrition tracking
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories INT DEFAULT 0,
  protein_g INT DEFAULT 0,
  water_liters NUMERIC(3,1) DEFAULT 0,
  supplements_taken JSONB DEFAULT '{"creatine":false,"soya_chunks":false,"dry_fruits":false,"fruits":false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON public.nutrition_logs(user_id, date);

-- --------------------------------------------------------
-- Row Level Security (RLS)
-- --------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Users can only CRUD their own profile
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_delete_own" ON public.users FOR DELETE USING (auth.uid() = id);

-- Users can only CRUD their own workout logs
CREATE POLICY "workout_select_own" ON public.workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_insert_own" ON public.workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_update_own" ON public.workout_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workout_delete_own" ON public.workout_logs FOR DELETE USING (auth.uid() = user_id);

-- Exercise logs: user can access if they own the parent workout log
CREATE POLICY "exercise_select_own" ON public.exercise_logs FOR SELECT
  USING (workout_log_id IN (SELECT id FROM public.workout_logs WHERE user_id = auth.uid()));
CREATE POLICY "exercise_insert_own" ON public.exercise_logs FOR INSERT
  WITH CHECK (workout_log_id IN (SELECT id FROM public.workout_logs WHERE user_id = auth.uid()));
CREATE POLICY "exercise_update_own" ON public.exercise_logs FOR UPDATE
  USING (workout_log_id IN (SELECT id FROM public.workout_logs WHERE user_id = auth.uid()));
CREATE POLICY "exercise_delete_own" ON public.exercise_logs FOR DELETE
  USING (workout_log_id IN (SELECT id FROM public.workout_logs WHERE user_id = auth.uid()));

-- Users can only CRUD their own nutrition logs
CREATE POLICY "nutrition_select_own" ON public.nutrition_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "nutrition_insert_own" ON public.nutrition_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "nutrition_update_own" ON public.nutrition_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "nutrition_delete_own" ON public.nutrition_logs FOR DELETE USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- Function: auto-create user profile on signup
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- Groups and Group Members
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Anyone can create a group
CREATE POLICY "groups_insert" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
-- Users can see groups they belong to
CREATE POLICY "groups_select" ON public.groups FOR SELECT 
  USING (id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));

-- Users can join a group (insert into members)
CREATE POLICY "group_members_insert" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can see members of groups they belong to
CREATE POLICY "group_members_select" ON public.group_members FOR SELECT 
  USING (group_id IN (SELECT group_id FROM public.group_members WHERE user_id = auth.uid()));
