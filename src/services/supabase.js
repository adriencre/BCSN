import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig, TABLE_PREFIX } from '../config/supabaseConfig';
import migratedMembers from '../data/migrated_firebase_members.json';
import { ALL_PLANNING_2026_2027 } from '../data/planning2026_2027';

let supabase = null;
let currentConfigKey = '';

export function getTable(name) {
  return `${TABLE_PREFIX}${name}`;
}

export function initSupabase() {
  const config = getSupabaseConfig();
  if (config && config.url && config.anonKey) {
    const configKey = `${config.url}_${config.anonKey}`;
    if (!supabase || currentConfigKey !== configKey) {
      try {
        supabase = createClient(config.url, config.anonKey, {
          auth: {
            persistSession: false,
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        });
        currentConfigKey = configKey;
      } catch (err) {
        console.error("Erreur initialisation Supabase :", err);
        return { supabase: null, isConnected: false, error: err.message };
      }
    }
    return { supabase, isConnected: true };
  }
  return { supabase: null, isConnected: false };
}

// Initialise au chargement
initSupabase();

export function isCloudEnabled() {
  const { isConnected } = initSupabase();
  return isConnected;
}

export async function testSupabaseConnection(customConfig) {
  try {
    const config = customConfig || getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      return { success: false, message: 'URL ou Clé Anon manquante' };
    }
    const testClient = createClient(config.url, config.anonKey);
    const { error } = await testClient
      .from(getTable('members'))
      .select('id')
      .limit(1);

    if (error) {
      // Si la table n'existe pas encore
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { 
          success: false, 
          tableMissing: true,
          message: `Connexion réussie mais la table "${getTable('members')}" n'existe pas encore. Exécutez le script SQL dans Supabase.` 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connexion à Supabase établie avec succès !' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ── Convertisseurs Modèles React <-> Tables PostgreSQL ──

function memberToCloud(m) {
  return {
    id: m.id || `member-${Date.now()}`,
    name: m.name || '',
    team: m.team || '',
    team_id: m.teamId || m.team_id || '',
    role: m.role || 'Joueur',
    phone: m.phone || '',
    email: m.email || '',
    image_consent: m.imageConsent || m.image_consent || 'pending',
    form_completed: m.formCompleted !== undefined ? m.formCompleted : (m.form_completed || false),
    photo: m.photo || null,
    form_answers: m.formAnswers || m.form_answers || {},
    teams: m.teams || [],
    created_at: m.createdAt || m.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function cloudToMember(row) {
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    teamId: row.team_id,
    role: row.role,
    phone: row.phone,
    email: row.email,
    imageConsent: row.image_consent,
    formCompleted: row.form_completed,
    photo: row.photo,
    formAnswers: row.form_answers || {},
    teams: row.teams || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function eventToCloud(e) {
  return {
    id: String(e.id),
    title: e.title || '',
    type: e.type || 'match',
    category: e.category || 'general',
    date: e.date || '',
    time: e.time || '',
    end_time: e.endTime || e.end_time || '',
    team_id: e.teamId || e.team_id || '',
    opponent: e.opponent || '',
    location: e.location || '',
    is_home: e.isHome !== undefined ? e.isHome : (e.is_home !== undefined ? e.is_home : true),
    score: e.score || '',
    status: e.status || 'upcoming',
    notes: e.notes || '',
    created_at: e.createdAt || e.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function cloudToEvent(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    category: row.category,
    date: row.date,
    time: row.time,
    endTime: row.end_time,
    teamId: row.team_id,
    opponent: row.opponent,
    location: row.location,
    isHome: row.is_home,
    score: row.score,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assetToCloud(a) {
  return {
    id: a.id || `asset-${Date.now()}`,
    name: a.name || 'Sans titre',
    type: a.type || 'background',
    url: a.url || '',
    created_at: a.createdAt || a.created_at || new Date().toISOString(),
  };
}

function cloudToAsset(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    url: row.url,
    createdAt: row.created_at,
  };
}

// ── Synchronisation Membres (dash_members) ──

export function subscribeMembers(onUpdate) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return null;

  const tableName = getTable('members');

  // Chargement initial
  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn(`Erreur lecture ${tableName} Supabase :`, error);
        return;
      }
      if (data) {
        onUpdate(data.map(cloudToMember));
      }
    } catch (err) {
      console.error(`Erreur fetch ${tableName} :`, err);
    }
  };

  fetchAll();

  // Écoute des changements en temps réel
  const channel = supabase
    .channel(`realtime_${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      () => {
        fetchAll();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function saveMemberCloud(memberData) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return false;

  try {
    const row = memberToCloud(memberData);
    const { data, error } = await supabase
      .from(getTable('members'))
      .upsert(row)
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || row.id;
  } catch (err) {
    console.error("Erreur sauvegarde membre Supabase :", err);
    throw err;
  }
}

export async function updateMemberCloud(memberId, updates) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return false;

  try {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.team !== undefined) dbUpdates.team = updates.team;
    if (updates.teamId !== undefined || updates.team_id !== undefined) dbUpdates.team_id = updates.teamId || updates.team_id;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.imageConsent !== undefined || updates.image_consent !== undefined) dbUpdates.image_consent = updates.imageConsent || updates.image_consent;
    if (updates.formCompleted !== undefined || updates.form_completed !== undefined) dbUpdates.form_completed = updates.formCompleted !== undefined ? updates.formCompleted : updates.form_completed;
    if (updates.photo !== undefined) dbUpdates.photo = updates.photo;
    if (updates.formAnswers !== undefined || updates.form_answers !== undefined) dbUpdates.form_answers = updates.formAnswers || updates.form_answers;
    if (updates.teams !== undefined) dbUpdates.teams = updates.teams;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from(getTable('members'))
      .update(dbUpdates)
      .eq('id', memberId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erreur mise à jour membre Supabase :", err);
    throw err;
  }
}

export async function deleteMemberCloud(memberId) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return false;

  try {
    const { error } = await supabase
      .from(getTable('members'))
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erreur suppression membre Supabase :", err);
    throw err;
  }
}

export async function seedMembersToCloud(membersList) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) throw new Error("Supabase non connecté.");

  try {
    const rows = membersList.map(memberToCloud);
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from(getTable('members'))
        .upsert(chunk, { onConflict: 'id' });
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error("Erreur seed membres Supabase :", err);
    throw err;
  }
}

// ── Synchronisation Événements & Calendrier (dash_events) ──

export function subscribeEvents(onUpdate) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return null;

  const tableName = getTable('events');

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.warn(`Erreur lecture ${tableName} Supabase :`, error);
        return;
      }
      if (data) {
        onUpdate(data.map(cloudToEvent));
      }
    } catch (err) {
      console.error(`Erreur fetch ${tableName} :`, err);
    }
  };

  fetchAll();

  const channel = supabase
    .channel(`realtime_${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      () => {
        fetchAll();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function saveEventCloud(eventData) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return false;

  try {
    const row = eventToCloud(eventData);
    const { error } = await supabase
      .from(getTable('events'))
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
    return row.id;
  } catch (err) {
    console.error("Erreur sauvegarde événement Supabase :", err);
    throw err;
  }
}

export async function deleteEventCloud(eventId) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return false;

  try {
    const { error } = await supabase
      .from(getTable('events'))
      .delete()
      .eq('id', String(eventId));

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erreur suppression événement Supabase :", err);
    throw err;
  }
}

export async function seedEventsToCloud(eventsList) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) throw new Error("Supabase non connecté.");

  try {
    const rows = eventsList.map(eventToCloud);
    const chunkSize = 100;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from(getTable('events'))
        .upsert(chunk, { onConflict: 'id' });
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error("Erreur seed événements Supabase :", err);
    throw err;
  }
}

export async function deleteAllEventsCloud() {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return false;

  try {
    const { error } = await supabase
      .from(getTable('events'))
      .delete()
      .neq('id', '___non_existent___');

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erreur suppression globale événements Supabase :", err);
    throw err;
  }
}

// ── Synchronisation Médiathèque (dash_custom_assets) ──

export function subscribeCustomAssets(onUpdate) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return null;

  const tableName = getTable('custom_assets');

  const fetchAll = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn(`Erreur lecture ${tableName} Supabase :`, error);
        return;
      }
      if (data) {
        onUpdate(data.map(cloudToAsset));
      }
    } catch (err) {
      console.error(`Erreur fetch ${tableName} :`, err);
    }
  };

  fetchAll();

  const channel = supabase
    .channel(`realtime_${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      () => {
        fetchAll();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function saveCustomAssetCloud(assetData) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return false;

  try {
    const row = assetToCloud(assetData);
    const { error } = await supabase
      .from(getTable('custom_assets'))
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;
    return row.id;
  } catch (err) {
    console.error("Erreur sauvegarde asset Supabase :", err);
    throw err;
  }
}

export async function deleteCustomAssetCloud(assetId) {
  const { supabase, isConnected } = initSupabase();
  if (!isConnected || !supabase) return false;

  try {
    const { error } = await supabase
      .from(getTable('custom_assets'))
      .delete()
      .eq('id', assetId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erreur suppression asset Supabase :", err);
    throw err;
  }
}

// ── Migration & Intégration globale des données existantes en 1 Clic ──

export async function migrateAllToSupabase(customAssets = []) {
  const { isConnected } = initSupabase();
  if (!isConnected) {
    throw new Error("Veuillez d'abord configurer et connecter votre projet Supabase.");
  }

  const results = {
    membersCount: 0,
    eventsCount: 0,
    assetsCount: 0,
  };

  // 1. Membres existants (Firebase récupéré + localStorage)
  let localMembers = [];
  try {
    localMembers = JSON.parse(localStorage.getItem('bcsn_members') || '[]');
  } catch {
    localMembers = [];
  }
  
  // Combine membres Firebase et localStorage en dédoublonnant par ID ou Nom
  const combinedMembersMap = new Map();
  migratedMembers.forEach(m => combinedMembersMap.set(m.id || m.name, m));
  localMembers.forEach(m => combinedMembersMap.set(m.id || m.name, m));
  const membersToMigrate = Array.from(combinedMembersMap.values());

  if (membersToMigrate.length > 0) {
    await seedMembersToCloud(membersToMigrate);
    results.membersCount = membersToMigrate.length;
  }

  // 2. Événements (Calendrier 2026-2027)
  let localEvents = [];
  try {
    localEvents = JSON.parse(localStorage.getItem('bcsn_events') || '[]');
  } catch {
    localEvents = [];
  }
  const eventsToMigrate = localEvents.length > 0 ? localEvents : ALL_PLANNING_2026_2027;
  if (eventsToMigrate.length > 0) {
    await seedEventsToCloud(eventsToMigrate);
    results.eventsCount = eventsToMigrate.length;
  }

  // 3. Custom Assets
  if (customAssets.length > 0) {
    for (const asset of customAssets) {
      await saveCustomAssetCloud(asset);
    }
    results.assetsCount = customAssets.length;
  }

  return results;
}
