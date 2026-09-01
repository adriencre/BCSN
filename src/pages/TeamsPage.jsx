import React, { useState } from 'react';
import { Users, UserPlus, ChevronRight, Search, Phone, Shield, Edit2, Trash2, X } from 'lucide-react';
import { CATEGORIES } from '../data/teamsData';
import { hasMemberTeam, getMemberTeams } from '../utils/teamUtils';
import { isCloudEnabled, saveMemberCloud, deleteMemberCloud } from '../services/supabase';

export function TeamsPage({ teams, members, onNavigateProfile, onUpdateMembers, onSelectMember }) {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: 'Joueur', phone: '' });

  const filteredTeams = selectedCategory === 'Tous' 
    ? teams 
    : teams.filter(t => t.category === selectedCategory);

  const teamMembers = selectedTeam 
    ? members.filter(m => hasMemberTeam(m, selectedTeam.name)).filter(m =>
        !search || m.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleAddMember = async () => {
    if (!newMember.name.trim()) return;
    const member = {
      id: generateId(),
      name: newMember.name.trim(),
      role: newMember.role,
      phone: newMember.phone,
      teams: [selectedTeam.name],
      team: selectedTeam.name,
      imageConsent: 'pending',
      formCompleted: false,
      createdAt: new Date().toISOString(),
      formAnswers: {},
    };
    onUpdateMembers(prev => [...prev, member]);
    if (isCloudEnabled()) {
      try {
        await saveMemberCloud(member);
      } catch (err) {
        console.warn("Erreur ajout membre Supabase :", err);
      }
    }
    setNewMember({ name: '', role: 'Joueur', phone: '' });
    setShowAddMember(false);
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Supprimer ce membre ?')) {
      onUpdateMembers(prev => prev.filter(m => m.id !== memberId));
      if (isCloudEnabled()) {
        try {
          await deleteMemberCloud(memberId);
        } catch (err) {
          console.warn("Erreur suppression membre Supabase :", err);
        }
      }
    }
  };

  if (selectedTeam) {
    return (
      <div>
        <button className="btn btn-ghost mb-16" onClick={() => setSelectedTeam(null)}>
          ← Retour aux équipes
        </button>
        
        <div className="card mb-16">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="team-card-icon"><Shield size={22} /></div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>{selectedTeam.name}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Coach : {selectedTeam.coach} · <Phone size={12} style={{ display: 'inline' }} /> {selectedTeam.coachPhone}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddMember(true)}>
                <UserPlus size={14} /> Ajouter
              </button>
            </div>
          </div>
        </div>

        {showAddMember && (
          <div className="card mb-16" style={{ borderColor: 'var(--primary-light)' }}>
            <h3 className="card-title mb-16">Ajouter un membre à l'équipe {selectedTeam.name}</h3>
            <div className="grid-2 mb-16">
              <div className="input-group">
                <label className="input-label">Nom complet</label>
                <input className="input" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="Prénom Nom" />
              </div>
              <div className="input-group">
                <label className="input-label">Rôle</label>
                <select className="input select" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                  <option>Joueur</option>
                  <option>Coach</option>
                  <option>Assistant Coach</option>
                </select>
              </div>
            </div>
            <div className="input-group mb-16">
              <label className="input-label">Téléphone (optionnel)</label>
              <input className="input" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} placeholder="06 ..." />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handleAddMember}>Enregistrer</button>
              <button className="btn btn-secondary" onClick={() => setShowAddMember(false)}>Annuler</button>
            </div>
          </div>
        )}

        <div className="search-wrapper mb-16">
          <Search size={16} className="search-icon" />
          <input className="input" placeholder="Rechercher un membre..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {teamMembers.length === 0 ? (
          <div className="empty-state">
            <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontWeight: 600 }}>Aucun membre dans cette équipe</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Ajoute des membres manuellement ou via le formulaire public</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Équipes</th>
                  <th>Rôle</th>
                  <th>Fiche</th>
                  <th>Droit Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(m => {
                  const mTeams = getMemberTeams(m);
                  return (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => (onSelectMember ? onSelectMember(m.id) : onNavigateProfile(m.id))}>
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div className="table-avatar">{getInitials(m.name)}</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary-light)' }}>{m.name}</div>
                            {m.phone && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {mTeams.map((tName, idx) => (
                            <span
                              key={idx}
                              className="badge"
                              style={{
                                background: tName === selectedTeam.name ? 'rgba(15, 109, 66, 0.2)' : '#1E222D',
                                color: tName === selectedTeam.name ? '#10B981' : '#CBD5E1',
                                borderColor: tName === selectedTeam.name ? '#168E56' : '#2A2D38',
                                fontSize: 11
                              }}
                            >
                              {tName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td><span className="badge badge-neutral">{m.role || 'Joueur'}</span></td>
                      <td>
                        <span className={`badge ${m.formCompleted ? 'badge-success' : 'badge-warning'}`}>
                          {m.formCompleted ? '✓ Complète' : '⏳ En attente'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${m.imageConsent === 'granted' ? 'badge-success' : m.imageConsent === 'denied' ? 'badge-danger' : 'badge-warning'}`}>
                          {m.imageConsent === 'granted' ? '✓ Autorisé' : m.imageConsent === 'denied' ? '✗ Refusé' : '⏳ En attente'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" title="Voir profil" onClick={() => (onSelectMember ? onSelectMember(m.id) : onNavigateProfile(m.id))}><Edit2 size={14} /></button>
                          <button className="btn-icon" title="Supprimer" onClick={() => handleDeleteMember(m.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                        </div>
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

  return (
    <div>
      <div className="tabs mb-24">
        <button className={`tab ${selectedCategory === 'Tous' ? 'active' : ''}`} onClick={() => setSelectedCategory('Tous')}>Tous</button>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`tab ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
        ))}
      </div>

      <div className="teams-grid">
        {filteredTeams.map(team => {
          const count = members.filter(m => hasMemberTeam(m, team.name)).length;
          return (
            <div key={team.id} className="team-card" onClick={() => setSelectedTeam(team)}>
              <div className="team-card-header">
                <div className="team-card-icon"><Shield size={20} /></div>
                <div>
                  <div className="team-card-name">{team.name}</div>
                  <div className="team-card-meta">{team.category} · Coach : {team.coach}</div>
                </div>
              </div>
              <div className="team-card-stats">
                <div className="team-card-stat"><Users size={14} /> {count} membre{count !== 1 ? 's' : ''}</div>
                <div className="team-card-stat"><Phone size={14} /> {team.coachPhone}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
