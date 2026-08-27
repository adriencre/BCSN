import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Database, 
  Download, Filter, Search, CheckCircle, RefreshCw, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { EVENT_TYPES } from '../data/teamsData';
import { ALL_PLANNING_2026_2027 } from '../data/planning2026_2027';
import { generateId } from '../hooks/useLocalStorage';
import { isCloudEnabled, saveEventCloud, deleteEventCloud, seedEventsToCloud } from '../services/firebase';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const days = [];
  // Previous month
  const prevLast = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevLast - i, month: month - 1, year, isOtherMonth: true });
  }
  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ day: d, month, year, isOtherMonth: false });
  }
  // Next month
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, month: month + 1, year, isOtherMonth: true });
  }
  return days;
}

export function CalendarPage({ events = [], onUpdateEvents }) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'match', date: '', time: '', lieu: '', category: 'Seniors' });

  const cloudActive = isCloudEnabled();
  const calendarDays = getCalendarDays(viewYear, viewMonth);
  const today = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    const matchesSearch = !searchQuery.trim() || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.lieu && e.lieu.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.equipe && e.equipe.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.adversaire && e.adversaire.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || e.type === filterType;
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory || (e.equipe && e.equipe.toLowerCase().includes(filterCategory.toLowerCase()));

    return matchesSearch && matchesType && matchesCategory;
  });

  const getEventsForDay = (day, month, year) => {
    return filteredEvents.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  // Add event handler with Cloud BDD support
  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const evtType = EVENT_TYPES.find(t => t.id === newEvent.type);
    const event = {
      id: generateId(),
      title: newEvent.title.trim(),
      type: newEvent.type,
      typeLabel: evtType?.label || newEvent.type,
      color: evtType?.color || '#3B82F6',
      date: newEvent.date,
      time: newEvent.time,
      lieu: newEvent.lieu,
      category: newEvent.category,
    };

    onUpdateEvents(prev => [...prev, event]);

    if (cloudActive) {
      try {
        await saveEventCloud(event);
        setSyncStatus('Événement sauvegardé dans la BDD Firestore !');
        setTimeout(() => setSyncStatus(null), 3000);
      } catch (err) {
        console.error("Erreur sauvegarde cloud", err);
      }
    }

    setNewEvent({ title: '', type: 'match', date: '', time: '', lieu: '', category: 'Seniors' });
    setShowAdd(false);
  };

  const handleDeleteEvent = async (id) => {
    onUpdateEvents(prev => prev.filter(e => e.id !== id));
    if (cloudActive) {
      try {
        await deleteEventCloud(id);
      } catch (err) {
        console.error("Erreur suppression cloud", err);
      }
    }
  };

  const handleDayClick = (dayInfo) => {
    const dateStr = `${dayInfo.year}-${String(dayInfo.month + 1).padStart(2,'0')}-${String(dayInfo.day).padStart(2,'0')}`;
    setSelectedDate(dateStr);
    setNewEvent(prev => ({ ...prev, date: dateStr }));
  };

  // Sync entire 2026-2027 Planning directly to Database (Firestore BDD)
  const handleSyncToDatabase = async () => {
    setIsSyncing(true);
    setSyncStatus('Envoi de tout le planning 2026-2027 dans la base de données...');

    try {
      if (cloudActive) {
        await seedEventsToCloud(ALL_PLANNING_2026_2027);
        setSyncStatus('✅ 133 Matchs et Événements synchronisés dans la BDD Firestore !');
      } else {
        onUpdateEvents(ALL_PLANNING_2026_2027);
        setSyncStatus('✅ Planning 2026-2027 chargé en mémoire !');
      }
    } catch (err) {
      console.error(err);
      setSyncStatus(`❌ Erreur : ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // Export planning as CSV for Excel / SQL import
  const handleExportCSV = () => {
    const headers = ['ID', 'Titre', 'Type', 'Catégorie', 'Équipe', 'Adversaire', 'Lieu', 'Date', 'Heure', 'Note'];
    const rows = events.map(e => [
      e.id,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      e.typeLabel || e.type,
      e.category || '',
      e.equipe || '',
      e.adversaire || '',
      `"${(e.lieu || '').replace(/"/g, '""')}"`,
      e.date || '',
      e.time || '',
      e.note || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bcsn_planning_2026_2027_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upcoming events sorted
  const sortedEvents = [...filteredEvents]
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalMatchesCount = events.filter(e => e.type === 'match').length;
  const totalEventsCount = events.filter(e => e.type !== 'match').length;

  return (
    <div>
      {/* Top Header & BDD Controls */}
      <div className="card mb-16" style={{ background: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={20} color="var(--primary-light)" />
              Gestion BDD Planning Saison 2026-2027
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Base de données : <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{events.length} entrées</span> ({totalMatchesCount} Matchs · {totalEventsCount} Événements Club)
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleSyncToDatabase}
              disabled={isSyncing}
              style={{ background: cloudActive ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)', color: cloudActive ? '#10B981' : '#3B82F6', borderColor: 'currentColor' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
              {cloudActive ? '⚡ Injecter dans la BDD Firestore' : '🔄 Recharger le Planning (133 Entrées)'}
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Exporter CSV pour Excel / SQL">
              <FileSpreadsheet size={14} /> Exporter (CSV/Excel)
            </button>

            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Ajouter un événement
            </button>
          </div>
        </div>

        {syncStatus && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={15} />
            {syncStatus}
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card mb-16" style={{ padding: '12px 16px' }}>
        <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input" 
              style={{ paddingLeft: 36 }}
              placeholder="Rechercher une équipe, un lieu, un adversaire (ex: Longueau, Loto...)" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <select className="input select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tous les types ({events.length})</option>
              <option value="match">Matchs uniquement ({totalMatchesCount})</option>
              <option value="evenement">Événements Club</option>
              <option value="reunion">Réunions</option>
              <option value="deadline">Indisponibilités / Vacances</option>
            </select>
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <select className="input select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">Toutes les catégories</option>
              <option value="Seniors">Séniors (M & F)</option>
              <option value="Juniors">Juniors / U18</option>
              <option value="Cadets">Cadets / U15 / U13</option>
              <option value="Jeunes">Jeunes / U11</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Event Form Modal */}
      {showAdd && (
        <div className="card mb-16" style={{ borderColor: 'var(--primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="card-title">Nouvel événement BDD</h3>
            <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={16} /></button>
          </div>
          <div className="grid-3 mb-16">
            <div className="input-group">
              <label className="input-label">Titre de l'événement</label>
              <input className="input" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Ex: SENIORS M A à Gouvieux" />
            </div>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="input select" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                {EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Catégorie</label>
              <select className="input select" value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})}>
                <option value="Seniors">Séniors</option>
                <option value="Juniors">Juniors (U18)</option>
                <option value="Cadets">Cadets (U15/U13)</option>
                <option value="Jeunes">Jeunes (U11)</option>
              </select>
            </div>
          </div>
          <div className="grid-3 mb-16">
            <div className="input-group">
              <label className="input-label">Date</label>
              <input className="input" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Heure (optionnel)</label>
              <input className="input" type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Lieu (optionnel)</label>
              <input className="input" value={newEvent.lieu} onChange={e => setNewEvent({...newEvent, lieu: e.target.value})} placeholder="Gymnase, Dourges, ..." />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAddEvent}>Enregistrer dans la BDD</button>
        </div>
      )}

      {/* Main Grid: Calendar View & Scrollable BDD List */}
      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={18} /></button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
              {MONTHS[viewMonth]} {viewYear}
            </h3>
            <button className="btn-icon" onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>

          <div className="calendar-grid">
            {DAYS.map(d => <div key={d} className="calendar-header-cell">{d}</div>)}
            {calendarDays.map((dayInfo, i) => {
              const dayEvents = getEventsForDay(dayInfo.day, dayInfo.month, dayInfo.year);
              const isToday = dayInfo.day === today && dayInfo.month === todayMonth && dayInfo.year === todayYear;
              const dateStr = `${dayInfo.year}-${String(dayInfo.month + 1).padStart(2,'0')}-${String(dayInfo.day).padStart(2,'0')}`;
              const isSelected = selectedDate === dateStr;
              return (
                <div
                  key={i}
                  className={`calendar-cell ${dayInfo.isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDayClick(dayInfo)}
                  style={isSelected ? { borderColor: 'var(--info)', background: 'rgba(59,130,246,0.08)' } : {}}
                >
                  <div className="calendar-day">{dayInfo.day}</div>
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} className="calendar-event-label" style={{ background: ev.color + '22', color: ev.color, fontSize: 9 }}>
                      {ev.title.slice(0, 12)}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>+{dayEvents.length - 3}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="card-title">📋 Liste BDD Événements ({filteredEvents.length})</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Synchro BDD Active</span>
          </div>

          {sortedEvents.length === 0 ? (
            <div className="empty-state">
              <p>Aucun événement ne correspond aux filtres</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Essayez de réinitialiser la recherche ou les filtres</p>
            </div>
          ) : (
            <div className="event-list" style={{ maxHeight: 540, overflowY: 'auto' }}>
              {sortedEvents.map(evt => (
                <div className="event-item" key={evt.id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
                  <div className="event-color-bar" style={{ background: evt.color || '#3B82F6' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {evt.title}
                      {evt.note === '*' && <span style={{ color: 'var(--warning)', fontWeight: 900 }}>*</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>
                        {evt.date ? new Date(evt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date non fixée'}
                        {evt.time ? ` · ${evt.time}` : ''}
                      </span>
                      {evt.lieu && (
                        <span>
                          <MapPin size={11} style={{ display: 'inline', marginRight: 2 }} />
                          {evt.lieu}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>{evt.typeLabel || evt.type}</span>
                    <button className="btn-icon" onClick={() => handleDeleteEvent(evt.id)} title="Supprimer de la BDD" style={{ color: 'var(--danger)' }}><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
