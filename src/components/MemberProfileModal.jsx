import React from 'react';
import { 
  X, CheckCircle, AlertTriangle, XCircle, Phone, Mail, 
  Calendar, Shield, Award, User, Sparkles, Image, Camera
} from 'lucide-react';
import { getInitials } from '../hooks/useLocalStorage';
import { getMemberTeams, formatMemberTeams } from '../utils/teamUtils';

export function MemberProfileModal({ member, onClose, onUpdateMember, teams = [] }) {
  if (!member) return null;

  const memberTeams = getMemberTeams(member);

  const handleConsentChange = (newConsent) => {
    if (onUpdateMember) {
      onUpdateMember(member.id, { imageConsent: newConsent });
    }
  };

  const handleStatusChange = (isComplete) => {
    if (onUpdateMember) {
      onUpdateMember(member.id, { formCompleted: isComplete });
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#161921', border: '1px solid #2A2D3A', borderRadius: 24,
        width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        color: '#F1F5F9'
      }}>
        {/* Header Banner & Close button */}
        <div style={{
          height: 100, background: 'linear-gradient(135deg, #168E56 0%, #0D5634 100%)',
          borderRadius: '24px 24px 0 0', position: 'relative', padding: 16
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', right: 16, top: 16, width: 36, height: 36,
              borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none',
              color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Avatar & Title */}
        <div style={{ padding: '0 24px 24px', marginTop: -48 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', border: '4px solid #161921',
              overflow: 'hidden', background: '#252830', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
              {member.photo ? (
                <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: 32, fontWeight: 800, color: '#168E56', fontFamily: 'var(--font-display)' }}>
                  {getInitials(member.name)}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 200, paddingBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC' }}>{member.name}</h2>
                <span className="badge badge-neutral" style={{ background: '#252836', color: '#168E56', borderColor: '#168E56' }}>
                  {member.role || 'Joueur'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                <Shield size={14} color="#94A3B8" />
                {memberTeams.length > 0 ? (
                  memberTeams.map((tName, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: 11, background: '#0F1117' }}>
                      {tName}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>Équipe non assignée</span>
                )}
              </div>

              {(member.poste || member.formAnswers?.['Poste de jeu']) && (member.poste || member.formAnswers?.['Poste de jeu']) !== '—' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>Poste(s) :</span>
                  {(member.poste || member.formAnswers['Poste de jeu']).split(',').map((p, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.25)', fontWeight: 600 }}>
                      🏀 {p.replace(/\s*\(Poste\s*\d+\)/gi, '').trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statut Badges Row */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <span className={`badge ${member.formCompleted ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 12px', fontSize: 12 }}>
              {member.formCompleted ? '✓ Fiche complétée' : '⏳ Formulaire en attente'}
            </span>

            <span className={`badge ${member.imageConsent === 'granted' ? 'badge-success' : member.imageConsent === 'denied' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '6px 12px', fontSize: 12 }}>
              <Image size={14} style={{ marginRight: 4 }} />
              {member.imageConsent === 'granted' ? '✓ Droit à l\'image OK' : member.imageConsent === 'denied' ? '✗ Droit à l\'image refusé' : '⏳ Consentement en attente'}
            </span>
          </div>

          {/* Grid Information / Content */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* General Info Card */}
            <div style={{ background: '#0F1117', border: '1px solid #252836', borderRadius: 16, padding: 16 }}>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#64748B', marginBottom: 12, fontWeight: 700 }}>
                📌 Contacts & Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E222D', paddingBottom: 6 }}>
                  <span style={{ color: '#94A3B8' }}>Téléphone</span>
                  <strong style={{ color: member.phone ? '#F1F5F9' : '#64748B' }}>
                    {member.phone ? (
                      <a href={`tel:${member.phone.replace(/\s/g, '')}`} style={{ color: '#168E56', textDecoration: 'none' }}>
                        <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />{member.phone}
                      </a>
                    ) : '—'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E222D', paddingBottom: 6 }}>
                  <span style={{ color: '#94A3B8' }}>Email</span>
                  <strong style={{ color: member.email ? '#F1F5F9' : '#64748B' }}>{member.email || '—'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Ajouté le</span>
                  <strong style={{ color: '#CBD5E1' }}>
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString('fr-FR') : '—'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Droit à l'image Status Admin Toggle */}
            <div style={{ background: '#0F1117', border: '1px solid #252836', borderRadius: 16, padding: 16 }}>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#64748B', marginBottom: 12, fontWeight: 700 }}>
                ⚖️ Autorisation Droit à l'image
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select 
                  className="input select" 
                  value={member.imageConsent || 'pending'} 
                  onChange={e => handleConsentChange(e.target.value)}
                  style={{ width: '100%', fontSize: 13 }}
                >
                  <option value="pending">⏳ En attente de consentement</option>
                  <option value="granted">✓ Autorisé (Réseaux / Web)</option>
                  <option value="denied">✗ Refusé</option>
                </select>

                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>
                  {member.imageConsent === 'granted' ? (
                    <span style={{ color: '#10B981' }}>✓ Ce membre a donné son accord pour la publication de ses visuels.</span>
                  ) : (
                    <span>⚠️ Vérifie le consentement avant toute publication sur les réseaux sociaux.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Answers Section */}
          <div style={{ background: '#0F1117', border: '1px solid #252836', borderRadius: 16, padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#168E56" /> Réponses au Formulaire Officiel
            </h3>

            {member.formAnswers && Object.keys(member.formAnswers).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {Object.entries(member.formAnswers).map(([key, val]) => (
                  <div key={key} style={{ background: '#161921', padding: 12, borderRadius: 12, border: '1px solid #252830' }}>
                    <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                      {key}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>
                      {String(val || '—')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                <p style={{ margin: 0 }}>Aucune réponse au formulaire soumise pour l'instant.</p>
                <p style={{ fontSize: 11, marginTop: 4, color: '#475569' }}>
                  Partage le lien du formulaire au membre pour compléter sa fiche.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
