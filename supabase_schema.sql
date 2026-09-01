-- ============================================================
-- BCSN DASHBOARD - CONFIGURATION SUPABASE (Tables préfixées dash_)
-- ============================================================
-- Ce script est à exécuter dans la console Supabase (onglet SQL Editor).
-- Il crée les tables nécessaires pour le dashboard BCSN de manière isolée
-- avec le préfixe "dash_", sans impacter les autres tables de votre projet.
-- Ce script est 100% NON-DESTRUCTIF (aucun DROP de table ou de données).

-- 1. Table des Membres & Coachs (Joueurs, Entraîneurs, Photos, Questionnaires)
CREATE TABLE IF NOT EXISTS public.dash_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    team TEXT,
    team_id TEXT,
    role TEXT DEFAULT 'Joueur',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    image_consent TEXT DEFAULT 'pending',
    form_completed BOOLEAN DEFAULT false,
    photo TEXT,
    form_answers JSONB DEFAULT '{}'::jsonb,
    teams JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des Événements & Calendrier (Matchs, Entraînements, Scores)
CREATE TABLE IF NOT EXISTS public.dash_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'match',
    category TEXT DEFAULT 'general',
    date TEXT NOT NULL,
    time TEXT,
    end_time TEXT,
    team_id TEXT,
    opponent TEXT,
    location TEXT,
    is_home BOOLEAN DEFAULT true,
    score TEXT,
    status TEXT DEFAULT 'upcoming',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table de la Médiathèque & Ressources Visuelles (Arrière-plans, Logos)
CREATE TABLE IF NOT EXISTS public.dash_custom_assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'background' ou 'logo'
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des Équipes (Optionnel pour personnalisation dynamique)
CREATE TABLE IF NOT EXISTS public.dash_teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    coach TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. SÉCURITÉ (Row Level Security - RLS)
-- ============================================================

ALTER TABLE public.dash_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dash_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dash_custom_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dash_teams ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Politiques dash_members
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_members' AND policyname = 'Allow public read dash_members') THEN
    CREATE POLICY "Allow public read dash_members" ON public.dash_members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_members' AND policyname = 'Allow public insert dash_members') THEN
    CREATE POLICY "Allow public insert dash_members" ON public.dash_members FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_members' AND policyname = 'Allow public update dash_members') THEN
    CREATE POLICY "Allow public update dash_members" ON public.dash_members FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_members' AND policyname = 'Allow public delete dash_members') THEN
    CREATE POLICY "Allow public delete dash_members" ON public.dash_members FOR DELETE USING (true);
  END IF;

  -- Politiques dash_events
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_events' AND policyname = 'Allow public read dash_events') THEN
    CREATE POLICY "Allow public read dash_events" ON public.dash_events FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_events' AND policyname = 'Allow public insert dash_events') THEN
    CREATE POLICY "Allow public insert dash_events" ON public.dash_events FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_events' AND policyname = 'Allow public update dash_events') THEN
    CREATE POLICY "Allow public update dash_events" ON public.dash_events FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_events' AND policyname = 'Allow public delete dash_events') THEN
    CREATE POLICY "Allow public delete dash_events" ON public.dash_events FOR DELETE USING (true);
  END IF;

  -- Politiques dash_custom_assets
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_custom_assets' AND policyname = 'Allow public read dash_custom_assets') THEN
    CREATE POLICY "Allow public read dash_custom_assets" ON public.dash_custom_assets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_custom_assets' AND policyname = 'Allow public insert dash_custom_assets') THEN
    CREATE POLICY "Allow public insert dash_custom_assets" ON public.dash_custom_assets FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_custom_assets' AND policyname = 'Allow public update dash_custom_assets') THEN
    CREATE POLICY "Allow public update dash_custom_assets" ON public.dash_custom_assets FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_custom_assets' AND policyname = 'Allow public delete dash_custom_assets') THEN
    CREATE POLICY "Allow public delete dash_custom_assets" ON public.dash_custom_assets FOR DELETE USING (true);
  END IF;

  -- Politiques dash_teams
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_teams' AND policyname = 'Allow public read dash_teams') THEN
    CREATE POLICY "Allow public read dash_teams" ON public.dash_teams FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_teams' AND policyname = 'Allow public insert dash_teams') THEN
    CREATE POLICY "Allow public insert dash_teams" ON public.dash_teams FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_teams' AND policyname = 'Allow public update dash_teams') THEN
    CREATE POLICY "Allow public update dash_teams" ON public.dash_teams FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'dash_teams' AND policyname = 'Allow public delete dash_teams') THEN
    CREATE POLICY "Allow public delete dash_teams" ON public.dash_teams FOR DELETE USING (true);
  END IF;
END $$;

-- ============================================================
-- 6. TEMPS RÉEL (Supabase Realtime)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'dash_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dash_members;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'dash_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dash_events;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'dash_custom_assets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dash_custom_assets;
  END IF;
END $$;
