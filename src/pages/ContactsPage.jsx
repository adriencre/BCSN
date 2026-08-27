import React, { useState } from 'react';
import { Search, Phone, Mail, Copy, CheckCircle, Users, Building2 } from 'lucide-react';
import { BUREAU } from '../data/teamsData';
import { getInitials, copyToClipboard } from '../hooks/useLocalStorage';

export function ContactsPage({ teams, members }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('coaches');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Build coach contacts from teams
  const coachContacts = teams.map(t => ({
    id: `coach-${t.id}`,
    name: t.coach,
    role: `Coach ${t.name}`,
    phone: t.coachPhone,
    type: 'coach',
  }));

  // Bureau contacts
  const bureauContacts = BUREAU.map((b, i) => ({
    id: `bureau-${i}`,
    name: b.name,
    role: b.role,
    phone: b.phone,
    email: b.email,
    type: 'bureau',
  }));

  // Member contacts (those with phone numbers)
  const memberContacts = members
    .filter(m => m.phone)
    .map(m => ({
      id: m.id,
      name: m.name,
      role: `${m.role || 'Joueur'} — ${m.team || 'Non assigné'}`,
      phone: m.phone,
      type: 'member',
    }));

  const allContacts = {
    coaches: coachContacts,
    bureau: bureauContacts,
    members: memberContacts,
  };

  const contacts = allContacts[activeTab].filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="tabs mb-16">
        <button className={`tab ${activeTab === 'coaches' ? 'active' : ''}`} onClick={() => setActiveTab('coaches')}>
          Coachs ({coachContacts.length})
        </button>
        <button className={`tab ${activeTab === 'bureau' ? 'active' : ''}`} onClick={() => setActiveTab('bureau')}>
          Bureau ({bureauContacts.length})
        </button>
        <button className={`tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
          Membres ({memberContacts.length})
        </button>
      </div>

      <div className="search-wrapper mb-16">
        <Search size={16} className="search-icon" />
        <input className="input" placeholder="Rechercher un contact..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="contacts-grid">
        {contacts.map(c => (
          <div key={c.id} className="contact-card">
            <div className="contact-avatar">{getInitials(c.name)}</div>
            <div className="contact-info">
              <div className="contact-name">{c.name}</div>
              <div className="contact-role">{c.role}</div>
              {c.phone && <div className="contact-phone"><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />{c.phone}</div>}
              {c.email && <div className="contact-phone"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />{c.email}</div>}
            </div>
            <div className="contact-actions">
              {c.phone && (
                <button className="btn-icon" title="Copier le numéro" onClick={() => handleCopy(c.phone.replace(/\s/g, ''), c.id)}>
                  {copiedId === c.id ? <CheckCircle size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                </button>
              )}
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="btn-icon" title="Appeler">
                  <Phone size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="empty-state">
          <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Aucun contact trouvé</p>
        </div>
      )}
    </div>
  );
}
