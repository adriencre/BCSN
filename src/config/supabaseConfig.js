// Configuration Supabase BCSN (Projet partagé - Tables préfixées dash_)

export const SUPABASE_URL = "https://tkgncolcibwuvuuoapsk.supabase.co";
export const TABLE_PREFIX = "dash_";

// Clé par défaut (peut être configurée via les variables d'environnement ou le dashboard)
export const DEFAULT_SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: "", // À renseigner via le modal de configuration Cloud ou la variable VITE_SUPABASE_ANON_KEY
  tablePrefix: TABLE_PREFIX,
};

// Récupère la configuration actuelle (priorité : localStorage > .env > défaut)
export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem('bcsn_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          tablePrefix: parsed.tablePrefix || TABLE_PREFIX,
        };
      }
    }
  } catch (e) {
    console.warn("Erreur lecture config supabase localStorage", e);
  }

  // Fallback si défini dans l'environnement Vite
  const envUrl = import.meta.env?.VITE_SUPABASE_URL || SUPABASE_URL;
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

  return {
    url: envUrl,
    anonKey: envKey,
    tablePrefix: TABLE_PREFIX,
  };
}

export function saveSupabaseConfig(config) {
  try {
    localStorage.setItem('bcsn_supabase_config', JSON.stringify({
      url: config.url || SUPABASE_URL,
      anonKey: config.anonKey,
      tablePrefix: config.tablePrefix || TABLE_PREFIX,
    }));
  } catch (e) {
    console.error("Erreur sauvegarde config supabase", e);
  }
}

export function resetSupabaseConfig() {
  try {
    localStorage.removeItem('bcsn_supabase_config');
  } catch (e) {
    console.error("Erreur reset config supabase", e);
  }
}
