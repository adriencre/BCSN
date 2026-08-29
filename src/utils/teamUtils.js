/**
 * Utilitaires pour la gestion des équipes multiples au BCSN
 */

/**
 * Extrait le tableau des équipes d'un membre.
 * Compatible avec member.teams (tableau) et member.team (chaîne avec séparateurs).
 * @param {Object} member 
 * @returns {string[]} Tableau des noms d'équipes
 */
export function getMemberTeams(member) {
  if (!member) return [];
  if (Array.isArray(member.teams) && member.teams.length > 0) {
    return member.teams.filter(Boolean);
  }
  if (member.team) {
    if (typeof member.team === 'string') {
      return member.team
        .split(/[,;\n]/)
        .map(t => t.trim())
        .filter(Boolean);
    }
  }
  return [];
}

/**
 * Vérifie si un membre appartient à une équipe spécifique.
 * @param {Object} member 
 * @param {string} teamName 
 * @returns {boolean}
 */
export function hasMemberTeam(member, teamName) {
  if (!member || !teamName) return false;
  const teams = getMemberTeams(member);
  const target = teamName.toLowerCase().trim();
  return teams.some(t => t.toLowerCase().trim() === target);
}

/**
 * Formate les équipes d'un membre sous forme de texte séparé par des virgules.
 * @param {Object} member 
 * @param {string} fallback 
 * @returns {string}
 */
export function formatMemberTeams(member, fallback = '—') {
  const teams = getMemberTeams(member);
  if (teams.length === 0) return fallback;
  return teams.join(', ');
}

/**
 * Normalise un nom (minuscules, sans accents, sans espaces ni caractères spéciaux)
 * pour effectuer une correspondance stricte insensible à la casse/accents.
 * @param {string} name 
 * @returns {string}
 */
export function normalizeName(name) {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}
