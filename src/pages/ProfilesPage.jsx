import React, { useState } from 'react';
import { Search, Filter, FileCheck, Camera, Eye, ArrowLeft } from 'lucide-react';
import { getInitials } from '../hooks/useLocalStorage';
import { getMemberTeams, formatMemberTeams } from '../utils/teamUtils';

export function ProfilesPage({ members, onUpdateMembers, teams, onSelectMember }) {
  const [search, setSearch] = useState('');
  const [filterConsent, setFilterConsent] = useState('all');
  const [filterForm, setFilterForm] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);

  const handleMemberClick = (memberId) => {
    if (onSelectMember) {
      onSelectMember(memberId);
    } else {
      setSelectedMember(memberId);
    }
  };

  const filtered = members.filter(m => {
    const memberTeamsStr = getMemberTeams(m).join(' ').toLowerCase();
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !memberTeamsStr.includes(search.toLowerCase())) return false;
    if (filterConsent !== 'all' && m.imageConsent !== filterConsent) return false;
    if (filterForm === 'complete' && !m.formCompleted) return false;
    if (filterForm === 'pending' && m.formCompleted) return false;
    return true;
  });

  const updateMember = (id, updates) => {
    onUpdateMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  if (selectedMember) {
    const m = members.find(mb => mb.id === selectedMember);
    if (!m) { setSelectedMember(null); return null; }

    const memberTeams = getMemberTeams(m);

    return (
      <div>
        <button className="btn btn-ghost mb-16" onClick={() => setSelectedMember(null)}>
          <ArrowLeft size={16} /> Retour à la liste
        </button>

        <div className="profile-header">
          {m.photo ? (
            <img src={m.photo} alt={m.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div className="profile-avatar">{getInitials(m.name)}</div>
          )}
          <div style={{ flex: 1 }}>
            <div className="profile-name">{m.name}</div>
            <div className="profile-role">{m.role || 'Joueur'} — {formatMemberTeams(m, 'Non assigné')}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <span className={`badge ${m.formCompleted ? 'badge-success' : 'badge-warning'}`}>
                {m.formCompleted ? '✓ Fiche complète' : '⏳ Fiche en attente'}
              </span>
              <span className={`badge ${m.imageConsent === 'granted' ? 'badge-success' : m.imageConsent === 'denied' ? 'badge-danger' : 'badge-warning'}`}>
                {m.imageConsent === 'granted' ? '✓ Droit à l\'image' : m.imageConsent === 'denied' ? '✗ Image refusée' : '⏳ En attente'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 className="card-title mb-16">📋 Informations</h3>
            <div className="profile-grid">
              <div className="profile-field">
                <div className="profile-field-label">Nom complet</div>
                <div className="profile-field-value">{m.name}</div>
              </div>
              <div className="profile-field">
                <div className="profile-field-label">Équipe(s)</div>
                <div className="profile-field-value">
                  {memberTeams.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                      {memberTeams.map((tName, idx) => (
                        <span key={idx} className="badge badge-neutral">{tName}</span>
                      ))}
                    </div>
                  ) : 'Non assigné'}
                </div>
              </div>
              <div className="profile-field">
                <div className="profile-field-label">Rôle</div>
                <div className="profile-field-value">{m.role || 'Joueur'}</div>
              </div>
              {(m.poste || m.formAnswers?.['Poste de jeu']) && (m.poste || m.formAnswers?.['Poste de jeu']) !== '—' && (
                <div className="profile-field">
                  <div className="profile-field-label">Poste(s) de jeu</div>
                  <div className="profile-field-value" style={{ color: '#10B981', fontWeight: 600 }}>
                    {m.poste || m.formAnswers['Poste de jeu']}
                  </div>
                </div>
              )}
              <div className="profile-field">
                <div className="profile-field-label">Téléphone</div>
                <div className="profile-field-value">{m.phone || '—'}</div>
              </div>
              <div className="profile-field">
                <div className="profile-field-label">Email</div>
                <div className="profile-field-value">{m.email || '—'}</div>
              </div>
              <div className="profile-field">
                <div className="profile-field-label">Date d'inscription</div>
                <div className="profile-field-value">{m.createdAt ? new Date(m.createdAt).toLocaleDateString('fr-FR') : '—'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title mb-16">📝 Consentement & Droit à l'image</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Statut du consentement</label>
                <select className="input select" value={m.imageConsent || 'pending'} onChange={e => updateMember(m.id, { imageConsent: e.target.value })}>
                  <option value="pending">⏳ En attente</option>
                  <option value="granted">✓ Autorisé</option>
                  <option value="denied">✗ Refusé</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Fiche complétée</label>
                <select className="input select" value={m.formCompleted ? 'yes' : 'no'} onChange={e => updateMember(m.id, { formCompleted: e.target.value === 'yes' })}>
                  <option value="no">Non</option>
                  <option value="yes">Oui</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-16">
          <h3 className="card-title mb-16">💬 Réponses au formulaire</h3>
          {m.formAnswers && Object.keys(m.formAnswers).length > 0 ? (
            <div className="profile-grid">
              {Object.entries(m.formAnswers).map(([key, val]) => (
                <div key={key} className="profile-field">
                  <div className="profile-field-label">{key}</div>
                  <div className="profile-field-value">{String(val)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Aucune réponse enregistrée</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Les réponses apparaîtront ici quand le membre aura rempli le formulaire</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <Search size={16} className="search-icon" />
          <input className="input" placeholder="Rechercher par nom ou équipe..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input select" style={{ width: 'auto', minWidth: 160 }} value={filterConsent} onChange={e => setFilterConsent(e.target.value)}>
          <option value="all">Tous les consentements</option>
          <option value="granted">✓ Autorisé</option>
          <option value="denied">✗ Refusé</option>
          <option value="pending">⏳ En attente</option>
        </select>
        <select className="input select" style={{ width: 'auto', minWidth: 140 }} value={filterForm} onChange={e => setFilterForm(e.target.value)}>
          <option value="all">Toutes les fiches</option>
          <option value="complete">✓ Complètes</option>
          <option value="pending">⏳ En attente</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontWeight: 600 }}>Aucun profil trouvé</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {members.length === 0 ? 'Ajoute des membres depuis la section Équipes ou via le formulaire public' : 'Essaie de modifier tes filtres'}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Membre</th>
                <th>Équipe(s)</th>
                <th>Rôle</th>
                <th>Fiche</th>
                <th>Droit Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const memberTeams = getMemberTeams(m);
                return (
                  <tr key={m.id}>
                    <td>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                        onClick={() => handleMemberClick(m.id)}
                      >
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div className="table-avatar">{getInitials(m.name)}</div>
                        )}
                        <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{m.name}</span>
                      </div>
                    </td>
                    <td>
                      {memberTeams.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {memberTeams.map((tName, idx) => (
                            <span key={idx} className="badge badge-neutral" style={{ fontSize: 11 }}>{tName}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>—</span>
                      )}
                    </td>
                    <td><span className="badge badge-neutral">{m.role || 'Joueur'}</span></td>
                    <td>
                      <span className={`badge ${m.formCompleted ? 'badge-success' : 'badge-warning'}`}>
                        {m.formCompleted ? '✓ OK' : '⏳'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${m.imageConsent === 'granted' ? 'badge-success' : m.imageConsent === 'denied' ? 'badge-danger' : 'badge-warning'}`}>
                        {m.imageConsent === 'granted' ? '✓ Autorisé' : m.imageConsent === 'denied' ? '✗ Refusé' : '⏳ En attente'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleMemberClick(m.id)}>
                        <Eye size={14} /> Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
