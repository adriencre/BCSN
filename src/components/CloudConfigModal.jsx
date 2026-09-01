import React, { useState } from 'react';
import { 
  Cloud, CheckCircle, X, ExternalLink, RefreshCw, Key, 
  Database, Copy, Check, Sparkles, AlertCircle, ShieldCheck, ArrowRight
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, resetSupabaseConfig, SUPABASE_URL } from '../config/supabaseConfig';
import { isCloudEnabled, testSupabaseConnection, migrateAllToSupabase } from '../services/supabase';

const SQL_SCHEMA_CONTENT = `-- BCSN DASHBOARD - TABLES SUPABASE (Préfixe dash_)
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

CREATE TABLE IF NOT EXISTS public.dash_custom_assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dash_teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    coach TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dash_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dash_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dash_custom_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dash_teams ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- dash_members
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

  -- dash_events
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

  -- dash_custom_assets
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

  -- dash_teams
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'dash_members') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dash_members;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'dash_events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dash_events;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'dash_custom_assets') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dash_custom_assets;
  END IF;
END $$;`;

export function CloudConfigModal({ isOpen, onClose, onSaved }) {
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url || SUPABASE_URL);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [status, setStatus] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);

  if (!isOpen) return null;

  const isConnected = isCloudEnabled();

  const handleTestConnection = async () => {
    setStatus({ type: 'info', msg: 'Test de connexion en cours...' });
    const result = await testSupabaseConnection({ url: supabaseUrl.trim(), anonKey: anonKey.trim() });
    if (result.success) {
      setStatus({ type: 'success', msg: result.message });
    } else {
      setStatus({ type: 'error', msg: result.message, tableMissing: result.tableMissing });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!anonKey.trim()) {
      setStatus({ type: 'error', msg: 'Veuillez saisir votre clé Anon / Public Supabase.' });
      return;
    }

    saveSupabaseConfig({
      url: supabaseUrl.trim() || SUPABASE_URL,
      anonKey: anonKey.trim(),
    });

    setStatus({ type: 'success', msg: 'Configuration enregistrée ! Synchronisation...' });
    setTimeout(() => {
      if (onSaved) onSaved();
      onClose();
      window.location.reload();
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Réinitialiser la configuration Supabase et repasser en mode local ?')) {
      resetSupabaseConfig();
      window.location.reload();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus(null);
    try {
      const res = await migrateAllToSupabase();
      setMigrationStatus({
        type: 'success',
        msg: `Migration réussie ! ${res.membersCount} membres et ${res.eventsCount} événements ont été synchronisés dans Supabase.`
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setMigrationStatus({
        type: 'error',
        msg: `Erreur lors de la migration : ${err.message}`
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#161921', border: '1px solid #2A2D3A', borderRadius: 24,
        width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)', color: '#F1F5F9'
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', right: 20, top: 20, background: '#252830', border: 'none', 
          color: '#94A3B8', cursor: 'pointer', width: 34, height: 34, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
        }}>
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: isConnected ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
          }}>
            <Database size={24} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-display, sans-serif)' }}>
                Base de Données Supabase
              </h2>
              <span style={{
                background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)',
                padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700
              }}>
                Préfixe dash_
              </span>
            </div>
            <p style={{ fontSize: 12, color: isConnected ? '#10B981' : '#F59E0B', fontWeight: 600, marginTop: 2 }}>
              {isConnected ? '🟢 Connecté à Supabase (Temps réel actif)' : '🟠 Mode local (En attente de la clé Anon)'}
            </p>
          </div>
        </div>

        {/* Info card */}
        <div style={{
          background: '#0F1117', border: '1px solid #252830', borderRadius: 14, padding: 14, marginBottom: 20, fontSize: 12.5, color: '#CBD5E1', lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 700, color: '#F1F5F9', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} color="#10B981" /> Configuration du projet partagé
          </div>
          <p style={{ margin: '0 0 8px', color: '#94A3B8' }}>
            Toutes les données BCSN sont stockées de façon isolée dans des tables dédiées (<code>dash_members</code>, <code>dash_events</code>, <code>dash_custom_assets</code>) pour ne pas interférer avec vos autres projets.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <button 
              type="button" 
              onClick={handleCopySql} 
              className="btn btn-secondary" 
              style={{ fontSize: 12, padding: '7px 12px', gap: 6, background: '#1E2330', color: copiedSql ? '#10B981' : '#E2E8F0' }}
            >
              {copiedSql ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              {copiedSql ? 'Script SQL copié !' : 'Copier le script SQL Supabase'}
            </button>
            <a 
              href="https://supabase.com/dashboard/project/tkgncolcibwuvuuoapsk/sql" 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-ghost" 
              style={{ fontSize: 12, padding: '7px 12px', gap: 6, color: '#60A5FA' }}
            >
              Ouvrir SQL Editor <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
              URL du Projet Supabase :
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://xxx.supabase.co"
              style={{
                width: '100%', padding: '10px 14px', background: '#0F1117', border: '1px solid #2A2D38',
                borderRadius: 10, color: '#F1F5F9', fontFamily: 'monospace', fontSize: 13, outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1' }}>
                Clé Publique Supabase (Anon Key) :
              </label>
              <a 
                href="https://supabase.com/dashboard/project/tkgncolcibwuvuuoapsk/settings/api" 
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
              >
                Trouver ma clé API <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              style={{
                width: '100%', padding: '10px 14px', background: '#0F1117', border: '1px solid #2A2D38',
                borderRadius: 10, color: '#F1F5F9', fontFamily: 'monospace', fontSize: 13, outline: 'none'
              }}
            />
          </div>

          {status && (
            <div style={{
              marginBottom: 16, padding: 12, borderRadius: 10, fontSize: 12.5, fontWeight: 600,
              background: status.type === 'success' ? 'rgba(16,185,129,0.12)' : status.type === 'info' ? 'rgba(59,130,246,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.3)' : status.type === 'info' ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: status.type === 'success' ? '#10B981' : status.type === 'info' ? '#60A5FA' : '#FCA5A5',
            }}>
              {status.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button 
              type="button" 
              onClick={handleTestConnection} 
              className="btn btn-secondary" 
              style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}
            >
              Tester la connexion
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1.2, justifyContent: 'center', fontSize: 13 }}
            >
              <Key size={15} /> Enregistrer & Activer
            </button>
          </div>
        </form>

        {/* Data Migration Section */}
        <div style={{
          marginTop: 16, paddingTop: 16, borderTop: '1px solid #252830',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={15} color="#F59E0B" /> Intégration des Données Existantes
              </div>
              <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>
                Injecte les 4 fiches membres récupérées (Vincent, Loïc, Gregory...) et les 153 événements 2026-2027 dans Supabase.
              </p>
            </div>
          </div>

          {migrationStatus && (
            <div style={{
              marginBottom: 12, padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: migrationStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: migrationStatus.type === 'success' ? '#10B981' : '#FCA5A5',
            }}>
              {migrationStatus.msg}
            </div>
          )}

          <button
            type="button"
            onClick={handleRunMigration}
            disabled={isMigrating || !isConnected}
            className="btn btn-secondary"
            style={{
              width: '100%', justifyContent: 'center', fontSize: 13, fontWeight: 700,
              background: isConnected ? 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)' : '#252830',
              color: isConnected ? '#FFF' : '#64748B',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              opacity: isMigrating ? 0.7 : 1,
            }}
          >
            {isMigrating ? (
              <>
                <RefreshCw size={15} className="spin" /> Migration en cours...
              </>
            ) : (
              <>
                <Database size={15} /> 🚀 Transférer toutes les données existantes dans Supabase
              </>
            )}
          </button>
        </div>

        {isConnected && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={handleReset} 
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Déconnecter Supabase et repasser en mode local
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
