// BCSN — Répertoire officiel du club

export const TEAMS = [
  // ── Masculines ──
  { id: 'sen-a-m', name: 'Séniors A (M)', category: 'Seniors', coach: 'Gregory Duquesne', coachPhone: '06.68.75.73.30', players: [] },
  { id: 'sen-b-m', name: 'Séniors B (M)', category: 'Seniors', coach: 'Malo', coachPhone: '06.29.50.62.43', players: [] },
  { id: 'sen-c-m', name: 'Séniors C (M)', category: 'Seniors', coach: 'Nicolas Chabé', coachPhone: '06.03.57.66.62', players: [] },
  { id: 'u18-a-m', name: 'U18-A (M)', category: 'Juniors', coach: 'Eric Pénichon', coachPhone: '06.03.38.22.89', players: [] },
  { id: 'u18-b-m', name: 'U18-B (M)', category: 'Juniors', coach: 'Alexandre Delbecq / Jérôme Kreel', coachPhone: '06.19.87.03.83', players: [] },
  { id: 'u15-a-m', name: 'U15-A (M)', category: 'Cadets', coach: 'Dany Deretz', coachPhone: '06.23.19.64.59', players: [] },
  { id: 'u15-b-m', name: 'U15-B (M)', category: 'Cadets', coach: 'Pierre Lemos', coachPhone: '', players: [] },
  { id: 'u13-a-m', name: 'U13-A (M)', category: 'Cadets', coach: 'Houleye Tzhirou', coachPhone: '06.95.51.99.40', players: [] },
  { id: 'u13-b-m', name: 'U13-B (M)', category: 'Cadets', coach: 'Arnaud Sansen', coachPhone: '06.82.78.34.47', players: [] },
  { id: 'u11-a-m', name: 'U11-A (M)', category: 'Jeunes', coach: 'Loic Tricquet', coachPhone: '06.58.09.87.33', players: [] },
  { id: 'u11-b-m', name: 'U11-B (M)', category: 'Jeunes', coach: 'Christophe Maupin', coachPhone: '06.71.91.63.72', players: [] },

  // ── Féminines ──
  { id: 'sen-f', name: 'Séniors (F)', category: 'Seniors', coach: 'Thomas Boucrelle', coachPhone: '06.50.55.83.32', players: [] },
  { id: 'u18-f', name: 'U18 (F)', category: 'Juniors', coach: 'Gérard Cathier', coachPhone: '06.20.79.23.65', players: [] },
  { id: 'u15-f', name: 'U15 (F)', category: 'Cadets', coach: 'Vincent Herbet', coachPhone: '06.70.46.51.03', players: [] },
  { id: 'u13-f', name: 'U13 (F)', category: 'Cadets', coach: 'Sarah Penichon', coachPhone: '07.50.38.19.12', players: [] },
  { id: 'u11-f', name: 'U11 (F)', category: 'Jeunes', coach: 'En attente', coachPhone: '', players: [] },

  // ── Mixtes ──
  { id: 'loisirs', name: 'Loisirs (Mixte)', category: 'Loisirs', coach: 'Evelyne Duquesnoy', coachPhone: '06.32.81.07.43', players: [] },
  { id: 'u9-mix', name: 'U9 (Mixte)', category: 'Jeunes', coach: 'Julie Duquesne / Noham', coachPhone: '06.83.47.16.65', players: [] },
  { id: 'ecole', name: 'École de Basket', category: 'Jeunes', coach: 'Gregory Duquesne / Alexandre Delbecq', coachPhone: '06.68.75.73.30', players: [] },
];

export const CATEGORIES = ['Jeunes', 'Cadets', 'Juniors', 'Seniors', 'Loisirs'];

export const BUREAU = [
  { name: 'Stéphane Pochet', role: 'Président', phone: '06.11.89.43.60', email: '' },
  { name: 'Alain de Brie', role: 'Trésorier et correspondant', phone: '06.60.16.12.34', email: '' },
  { name: 'Isabelle Coppens', role: 'Secrétaire, Responsable licences et OTM', phone: '06.32.31.90.12', email: '' },
  { name: 'Eric Penichon', role: 'Responsable sportif et des plannings', phone: '06.03.38.22.89', email: '' },
  { name: 'Jérôme Kreel', role: 'Membre et recherche de sponsoring', phone: '06.73.31.43.72', email: '' },
  { name: 'Valérie Lempereur', role: 'Responsable achats buvette et textile', phone: '06.31.23.99.10', email: '' },
  { name: 'Mickaël Lempereur', role: 'Responsable buvette', phone: '07.85.27.88.32', email: '' },
];

export const EVENT_TYPES = [
  { id: 'match', label: 'Match', color: '#EF4444' },
  { id: 'entrainement', label: 'Entraînement', color: '#3B82F6' },
  { id: 'reunion', label: 'Réunion', color: '#F59E0B' },
  { id: 'publication', label: 'Publication', color: '#8B5CF6' },
  { id: 'evenement', label: 'Événement', color: '#10B981' },
  { id: 'deadline', label: 'Deadline', color: '#EC4899' },
];

export const VISUAL_TEMPLATES = [
  { id: 'match_day', name: 'Match Day', description: 'Annonce de match avec scores', gradient: 'linear-gradient(135deg, #0F6D42, #168E56)' },
  { id: 'result', name: 'Résultat', description: 'Score final du match', gradient: 'linear-gradient(135deg, #1E3A5F, #2563EB)' },
  { id: 'player_spotlight', name: 'Joueur du match', description: 'Mise en avant joueur', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  { id: 'info', name: 'Info Club', description: 'Communication générale', gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)' },
  { id: 'recruitment', name: 'Recrutement', description: 'Appel à joueurs', gradient: 'linear-gradient(135deg, #EC4899, #F43F5E)' },
  { id: 'training', name: 'Entraînement', description: 'Horaires et lieu', gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)' },
];
