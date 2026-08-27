import React from 'react';
import { Users, FileCheck, Camera, CalendarDays, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export function OverviewPage({ members, events, teams }) {
  const totalMembers = members.length;
  const completedForms = members.filter(m => m.formCompleted).length;
  const consentGranted = members.filter(m => m.imageConsent === 'granted').length;
  const consentPending = members.filter(m => m.imageConsent === 'pending').length;

  const now = new Date();
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const recentMembers = [...members]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><Users size={22} /></div>
          <div>
            <div className="stat-value">{totalMembers}</div>
            <div className="stat-label">Membres inscrits</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><FileCheck size={22} /></div>
          <div>
            <div className="stat-value">{completedForms}/{totalMembers || 0}</div>
            <div className="stat-label">Fiches complétées</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Camera size={22} /></div>
          <div>
            <div className="stat-value">{consentGranted}</div>
            <div className="stat-label">Droits à l'image OK</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertCircle size={22} /></div>
          <div>
            <div className="stat-value">{consentPending}</div>
            <div className="stat-label">Consentements en attente</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-8">
              <CalendarDays size={18} /> Prochains événements
            </h3>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="empty-state">
              <Clock size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>Aucun événement à venir</p>
            </div>
          ) : (
            <div className="event-list">
              {upcomingEvents.map(evt => (
                <div className="event-item" key={evt.id}>
                  <div className="event-color-bar" style={{ background: evt.color || '#3B82F6' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{evt.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(evt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {evt.time ? ` · ${evt.time}` : ''}
                    </div>
                  </div>
                  <span className={`badge badge-${evt.type === 'match' ? 'danger' : evt.type === 'reunion' ? 'warning' : 'info'}`}>
                    {evt.typeLabel || evt.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-8">
              <TrendingUp size={18} /> Dernières inscriptions
            </h3>
          </div>
          {recentMembers.length === 0 ? (
            <div className="empty-state">
              <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>Aucun membre inscrit</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Les fiches apparaîtront ici quand les joueurs les rempliront via le lien de formulaire</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="table-avatar">{m.name ? m.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.team || 'Non assigné'}</div>
                  </div>
                  <span className={`badge ${m.imageConsent === 'granted' ? 'badge-success' : m.imageConsent === 'denied' ? 'badge-danger' : 'badge-warning'}`}>
                    {m.imageConsent === 'granted' ? '✓ Image' : m.imageConsent === 'denied' ? '✗ Image' : '⏳ Image'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-header">
          <h3 className="card-title">📊 Répartition par équipe</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {teams.map(t => {
            const count = members.filter(m => m.team === t.name).length;
            return (
              <div key={t.id} style={{ background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{t.name}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
