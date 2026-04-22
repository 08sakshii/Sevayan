-- PHASE 1 — DATABASE SCHEMA

-- 1. users (profile table, id matches auth.users.id)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('USER', 'ORGANIZER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. categories (fixed predefined data)
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('CLEANLINESS', 'PLANTATION', 'DONATION')),
  description TEXT
);

-- 3. events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  duration TEXT NOT NULL,
  city TEXT NOT NULL,
  location TEXT NOT NULL,
  map_link TEXT,
  image TEXT,
  organization_name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. registrations
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- PHASE 2 — ROW LEVEL SECURITY

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- users: read and update only own row; insert own (for signup profile)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- categories: read-only for all (fixed data)
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);

-- events: anyone can read; organizer can create; organizer can update/delete only own
CREATE POLICY "events_select_all" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "events_insert_organizer" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ORGANIZER')
  );

CREATE POLICY "events_update_own" ON public.events
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "events_delete_own" ON public.events
  FOR DELETE USING (created_by = auth.uid());

-- registrations: user can insert own (register); user can select own; organizer can select for their events
CREATE POLICY "registrations_select_own" ON public.registrations
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND created_by = auth.uid())
  );

CREATE POLICY "registrations_insert_own" ON public.registrations
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'USER')
  );

-- PHASE 3 — FIXED CATEGORY SEED DATA (match frontend IDs: cleanliness, plantation, donation)

INSERT INTO public.categories (id, name, type, description) VALUES
  ('cleanliness', 'Cleanliness', 'CLEANLINESS', 'Beach, river, road, and temple cleaning drives'),
  ('plantation', 'Plantation', 'PLANTATION', 'Tree plantation and plant distribution events'),
  ('donation', 'Donation', 'DONATION', 'Blood, food, clothes, and books donation camps');
