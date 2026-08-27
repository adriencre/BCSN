import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Palette, BookUser, CalendarDays, UserCircle, 
  Menu, X, Link2, Copy, CheckCircle, ExternalLink, LogOut, Cloud
} from 'lucide-react';
import { TEAMS } from './data/teamsData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { OverviewPage } from './pages/OverviewPage';
import { TeamsPage } from './pages/TeamsPage';
import { VisualsPage } from './pages/VisualsPage';
import { ContactsPage } from './pages/ContactsPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { FormPublicJoueur } from './pages/FormPublicJoueur';
import { FormPublicCoach } from './pages/FormPublicCoach';
import { LoginGate, isAuthenticated } from './components/LoginGate';
import { CloudConfigModal } from './components/CloudConfigModal';
import { MemberProfileModal } from './components/MemberProfileModal';
import { subscribeMembers, subscribeEvents, isCloudEnabled } from './services/firebase';

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard, section: 'principal' },
  { id: 'teams', label: 'Équipes & Effectifs', icon: Users, section: 'principal' },
  { id: 'visuals', label: 'Générateur Visuels', icon: Palette, section: 'outils' },
  { id: 'contacts', label: 'Contacts', icon: BookUser, section: 'outils' },
  { id: 'calendar', label: 'Calendrier', icon: CalendarDays, section: 'outils' },
  { id: 'profiles', label: 'Profils & Consentements', icon: UserCircle, section: 'gestion' },
];

const PAGE_TITLES = {
  overview: 'Vue d\'ensemble',
  teams: 'Équipes & Effectifs',
  visuals: 'Générateur de Visuels',
  contacts: 'Contacts',
  calendar: 'Calendrier',
  profiles: 'Profils & Consentements',
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useLocalStorage('bcsn_members', []);
  const [events, setEvents] = useLocalStorage('bcsn_events', []);
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // Real-time Cloud subscription (Firestore)
  useEffect(() => {
    if (!isCloudEnabled()) return;

    const unsubMembers = subscribeMembers((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setMembers(cloudMembers);
      }
    });

    const unsubEvents = subscribeEvents((cloudEvents) => {
      if (cloudEvents && cloudEvents.length > 0) {
        setEvents(cloudEvents);
      }
    });

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubEvents) unsubEvents();
    };
  }, []);

  // Hash-based routing for public forms
  const [publicForm, setPublicForm] = useState(null);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#formulaire-joueur') setPublicForm('joueur');
      else if (hash === '#formulaire-coach') setPublicForm('coach');
      else setPublicForm(null);
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Public forms do NOT require authentication
  if (publicForm === 'joueur') return <FormPublicJoueur />;
  if (publicForm === 'coach') return <FormPublicCoach />;

  // Protected dashboard gate
  if (!authenticated) {
    return <LoginGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('bcsn_auth');
    setAuthenticated(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const linkJoueur = `${baseUrl}#formulaire-joueur`;
  const linkCoach = `${baseUrl}#formulaire-coach`;

  const handleCopyLink = (link, type) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(type);
    showToast(`Lien formulaire ${type === 'joueur' ? 'joueur' : 'coach'} copié !`);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const navigateTo = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const handleUpdateMember = (id, updates) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const selectedMember = selectedMemberId ? members.find(m => m.id === selectedMemberId) : null;

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <OverviewPage members={members} events={events} teams={TEAMS} onSelectMember={setSelectedMemberId} />;
      case 'teams': return <TeamsPage teams={TEAMS} members={members} onNavigateProfile={() => setActivePage('profiles')} onUpdateMembers={setMembers} onSelectMember={setSelectedMemberId} />;
      case 'visuals': return <VisualsPage teams={TEAMS} members={members} events={events} />;
      case 'contacts': return <ContactsPage teams={TEAMS} members={members} onSelectMember={setSelectedMemberId} />;
      case 'calendar': return <CalendarPage events={events} onUpdateEvents={setEvents} />;
      case 'profiles': return <ProfilesPage members={members} onUpdateMembers={setMembers} teams={TEAMS} onSelectMember={setSelectedMemberId} />;
      default: return <OverviewPage members={members} events={events} teams={TEAMS} onSelectMember={setSelectedMemberId} />;
    }
  };

  const sections = {
    principal: NAV_ITEMS.filter(n => n.section === 'principal'),
    outils: NAV_ITEMS.filter(n => n.section === 'outils'),
    gestion: NAV_ITEMS.filter(n => n.section === 'gestion'),
  };

  const pendingCount = members.filter(m => m.imageConsent === 'pending').length;
  const cloudActive = isCloudEnabled();

  return (
    <div className="app-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🏀</div>
          <div>
            <div className="sidebar-title">BCSN</div>
            <div className="sidebar-subtitle">Dashboard Admin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Principal</div>
          {sections.principal.map(item => (
            <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => navigateTo(item.id)}>
              <item.icon size={18} className="nav-icon" />
              {item.label}
            </button>
          ))}

          <div className="sidebar-section-label">Outils</div>
          {sections.outils.map(item => (
            <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => navigateTo(item.id)}>
              <item.icon size={18} className="nav-icon" />
              {item.label}
            </button>
          ))}

          <div className="sidebar-section-label">Gestion</div>
          {sections.gestion.map(item => (
            <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => navigateTo(item.id)}>
              <item.icon size={18} className="nav-icon" />
              {item.label}
              {item.id === 'profiles' && pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Liens formulaires publics, Status Cloud & Déconnexion */}
        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid var(--border)' }}>
          {/* Status Cloud DB */}
          <button 
            className="btn btn-secondary btn-sm w-full mb-12" 
            onClick={() => setShowCloudModal(true)}
            style={{ 
              justify: 'center', fontSize: 11, gap: 6,
              background: cloudActive ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
              borderColor: cloudActive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
              color: cloudActive ? '#10B981' : '#F59E0B',
            }}
          >
            <Cloud size={13} />
            {cloudActive ? '🟢 Cloud DB Actif' : '⚙️ Configurer Cloud DB'}
          </button>

          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>Liens formulaires publics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            <button className="btn btn-secondary btn-sm w-full" onClick={() => handleCopyLink(linkJoueur, 'joueur')} style={{ justifyContent: 'center', fontSize: 12 }}>
              {copiedLink === 'joueur' ? <CheckCircle size={13} style={{ color: 'var(--success)' }} /> : <Link2 size={13} />}
              {copiedLink === 'joueur' ? 'Copié !' : '📋 Lien Joueur'}
            </button>
            <button className="btn btn-secondary btn-sm w-full" onClick={() => handleCopyLink(linkCoach, 'coach')} style={{ justifyContent: 'center', fontSize: 12 }}>
              {copiedLink === 'coach' ? <CheckCircle size={13} style={{ color: 'var(--success)' }} /> : <Link2 size={13} />}
              {copiedLink === 'coach' ? 'Copié !' : '📋 Lien Coach'}
            </button>
          </div>

          <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout} style={{ justifyContent: 'center', fontSize: 12, color: 'var(--danger)' }}>
            <LogOut size={13} /> Se déconnecter
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-icon mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1>{PAGE_TITLES[activePage]}</h1>
          </div>
          <div className="main-header-actions">
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="page-content">
          {renderPage()}
        </div>
      </main>

      {toast && (
        <div className="toast toast-success">
          <CheckCircle size={16} style={{ color: 'var(--success)' }} />
          {toast}
        </div>
      )}

      <CloudConfigModal 
        isOpen={showCloudModal} 
        onClose={() => setShowCloudModal(false)}
        onSaved={() => showToast('Configuration Cloud mise à jour !')}
      />

      {selectedMember && (
        <MemberProfileModal 
          member={selectedMember} 
          onClose={() => setSelectedMemberId(null)}
          onUpdateMember={handleUpdateMember}
          teams={TEAMS}
        />
      )}
    </div>
  );
}
