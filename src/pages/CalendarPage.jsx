import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Database, 
  Download, Filter, Search, CheckCircle, RefreshCw, AlertCircle, FileSpreadsheet,
  Calendar as CalendarIcon, ArrowRight, Palette, Layers, Trophy, Check, Sparkles
} from 'lucide-react';
import { EVENT_TYPES } from '../data/teamsData';
import { ALL_PLANNING_2026_2027 } from '../data/planning2026_2027';
import { generateId } from '../hooks/useLocalStorage';
import { isCloudEnabled, saveEventCloud, deleteEventCloud, seedEventsToCloud } from '../services/firebase';

const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6; // Adjust for Sunday (0 -> 6)
  
  const days = [];
  const prevLast = new Date(year, month, 0).getDate();
  
  // Previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevLast - i, month: month - 1, year, isOtherMonth: true });
  }
  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ day: d, month, year, isOtherMonth: false });
  }
  // Next month padding to complete 42 cells grid
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, month: month + 1, year, isOtherMonth: true });
  }
  return days;
}

function formatDateISO(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function formatDateLongFR(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const dayName = d.toLocaleDateString('fr-FR', { weekday: 'long' });
  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString('fr-FR', { month: 'long' });
  const yearNum = d.getFullYear();
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum} ${monthName} ${yearNum}`;
}

export function CalendarPage({ events = [], onUpdateEvents, onNavigateToVisuals }) {
  const now = new Date();
  
  // Default to September 2026 if today is before 2026
  const defaultYear = now.getFullYear() < 2026 ? 2026 : now.getFullYear();
  const defaultMonth = now.getFullYear() < 2026 ? 8 : now.getMonth(); // 8 = September

  const [viewMonth, setViewMonth] = useState(defaultMonth);
  const [viewYear, setViewYear] = useState(defaultYear);
  const [selectedDate, setSelectedDate] = useState('2026-09-12'); // Default selected day to 12 Sept 2026 (busy weekend)
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  
  // Form state
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    type: 'match', 
    date: selectedDate || '', 
    time: '20:30', 
    lieu: 'Gymnase BCSN', 
    equipe: 'SENIORS M A',
    adversaire: '',
    category: 'Seniors' 
  });

  const cloudActive = isCloudEnabled();
  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const todayStr = formatDateISO(now.getFullYear(), now.getMonth(), now.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Jump directly to month/year selector
  const handleMonthSelect = (e) => {
    const [y, m] = e.target.value.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m);
  };

  // Filter events based on type, category, search query
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = !searchQuery.trim() || 
        (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.lieu && e.lieu.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.equipe && e.equipe.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.adversaire && e.adversaire.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'all' || e.type === filterType;
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory || 
        (e.equipe && e.equipe.toLowerCase().includes(filterCategory.toLowerCase()));

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [events, searchQuery, filterType, filterCategory]);

  // Events for current view month
  const monthEventsCount = useMemo(() => {
    return filteredEvents.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date + 'T00:00:00');
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    }).length;
  }, [filteredEvents, viewMonth, viewYear]);

  // Events strictly matching the selected day
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents.filter(e => e.date === selectedDate);
  }, [filteredEvents, selectedDate]);

  // Map events per day key for fast lookup in month grid
  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(e => {
      if (!e.date) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filteredEvents]);

  // Handle Day Cell Click
  const handleDayClick = (dayInfo) => {
    const dateStr = formatDateISO(dayInfo.year, dayInfo.month, dayInfo.day);
    setSelectedDate(dateStr);
    setNewEvent(prev => ({ ...prev, date: dateStr }));
  };

  // Save new event to state and Cloud BDD
  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const evtType = EVENT_TYPES.find(t => t.id === newEvent.type);
    
    const eventObj = {
      id: generateId(),
      title: newEvent.title.trim(),
      type: newEvent.type,
      typeLabel: evtType?.label || newEvent.type,
      color: evtType?.color || '#3B82F6',
      date: newEvent.date,
      time: newEvent.time,
      lieu: newEvent.lieu,
      equipe: newEvent.equipe,
      adversaire: newEvent.adversaire,
      category: newEvent.category,
      isAway: newEvent.lieu && !newEvent.lieu.toLowerCase().includes('domicile') && !newEvent.lieu.toLowerCase().includes('bcsn'),
      createdAt: new Date().toISOString()
    };

    onUpdateEvents(prev => [...prev, eventObj]);

    if (cloudActive) {
      try {
        await saveEventCloud(eventObj);
        setSyncStatus('Événement enregistré dans la BDD Firestore !');
        setTimeout(() => setSyncStatus(null), 3000);
      } catch (err) {
        console.error("Erreur enregistrement Firestore BDD", err);
      }
    }

    setShowAddModal(false);
    setNewEvent({ title: '', type: 'match', date: selectedDate || '', time: '20:30', lieu: 'Gymnase BCSN', equipe: 'SENIORS M A', adversaire: '', category: 'Seniors' });
  };

  // Delete event
  const handleDeleteEvent = async (id) => {
    onUpdateEvents(prev => prev.filter(e => e.id !== id));
    if (cloudActive) {
      try {
        await deleteEventCloud(id);
      } catch (err) {
        console.error("Erreur suppression BDD", err);
      }
    }
  };

  // Seed full 2026-2027 Planning directly to Database (Firestore BDD)
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
      setSyncStatus(`❌ Erreur BDD : ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // Export CSV
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
    link.setAttribute('download', `bcsn_planning_bdd_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMatches = events.filter(e => e.type === 'match').length;
  const totalEvents = events.filter(e => e.type !== 'match').length;

  return (
    <div>
      {/* Top Banner: Database & Sync Status */}
      <div className="card mb-16" style={{ background: 'linear-gradient(135deg, rgba(26,29,39,0.9), rgba(37,40,48,0.9))', borderColor: 'var(--border-light)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: cloudActive ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: cloudActive ? '#10B981' : '#3B82F6', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                <Database size={20} style={{ margin: 'auto' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Planning Saison 2026-2027
                  <span className={`badge ${cloudActive ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                    {cloudActive ? '● BDD Firestore Connectée' : 'Stockage Local'}
                  </span>
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Base de données active : <span style={{ fontWeight: 700, color: 'var(--text)' }}>{events.length} événements</span> ({totalMatches} Matchs · {totalEvents} Club & Réunions)
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleSyncToDatabase}
              disabled={isSyncing}
              style={{ background: cloudActive ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)', color: cloudActive ? '#10B981' : '#3B82F6', borderColor: 'currentColor' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
              {cloudActive ? '⚡ Synchro BDD Firestore (133)' : '🔄 Charger Planning 2026-2027'}
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Exporter les données pour SQL / Excel">
              <FileSpreadsheet size={14} /> CSV / Excel
            </button>

            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Ajouter un événement
            </button>
          </div>
        </div>

        {syncStatus && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} />
            {syncStatus}
          </div>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card mb-16" style={{ padding: '14px 18px' }}>
        <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input" 
              style={{ paddingLeft: 36 }}
              placeholder="Rechercher par équipe, adversaire ou lieu (ex: Longueau, Arras, Loto...)" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="input-group" style={{ margin: 0 }}>
            <select className="input select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tous les types ({events.length})</option>
              <option value="match">Matchs uniquement ({totalMatches})</option>
              <option value="evenement">Événements Club</option>
              <option value="reunion">Réunions</option>
              <option value="deadline">Indisponibilités & Vacances</option>
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

      {/* Main Interactive Grid: Calendar Left, Selected Day View Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20 }}>
        
        {/* LEFT COLUMN: Interactive Month Calendar */}
        <div className="card" style={{ padding: 20 }}>
          {/* Calendar Header with Quick Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn-icon" onClick={prevMonth} title="Mois précédent"><ChevronLeft size={18} /></button>
              
              {/* Quick Jump Month Select Dropdown */}
              <select 
                className="select" 
                value={`${viewYear}-${viewMonth}`} 
                onChange={handleMonthSelect}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, border: 'none', background: 'transparent', padding: '4px 8px', cursor: 'pointer' }}
              >
                <option value="2026-7">Août 2026</option>
                <option value="2026-8">Septembre 2026</option>
                <option value="2026-9">Octobre 2026</option>
                <option value="2026-10">Novembre 2026</option>
                <option value="2026-11">Décembre 2026</option>
                <option value="2027-0">Janvier 2027</option>
                <option value="2027-1">Février 2027</option>
                <option value="2027-2">Mars 2027</option>
                <option value="2027-3">Avril 2027</option>
                <option value="2027-4">Mai 2027</option>
              </select>

              <button className="btn-icon" onClick={nextMonth} title="Mois suivant"><ChevronRight size={18} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-neutral" style={{ fontSize: 11 }}>{monthEventsCount} événements en {MONTHS_FR[viewMonth]}</span>
              
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const nowY = now.getFullYear() < 2026 ? 2026 : now.getFullYear();
                  const nowM = now.getFullYear() < 2026 ? 8 : now.getMonth();
                  setViewYear(nowY);
                  setViewMonth(nowM);
                  setSelectedDate('2026-09-12');
                }}
                style={{ fontSize: 11, padding: '4px 8px' }}
              >
                Aujourd'hui
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {DAYS_SHORT.map((d, index) => (
              <div 
                key={d} 
                className="calendar-header-cell"
                style={index >= 5 ? { color: 'var(--accent)', fontWeight: 700 } : {}}
              >
                {d}
              </div>
            ))}

            {calendarDays.map((dayInfo, idx) => {
              const dateStr = formatDateISO(dayInfo.year, dayInfo.month, dayInfo.day);
              const dayEvts = eventsByDate[dateStr] || [];
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;
              const isWeekend = (idx % 7 === 5) || (idx % 7 === 6); // Samedi ou Dimanche

              const matchesCount = dayEvts.filter(e => e.type === 'match').length;
              const otherCount = dayEvts.filter(e => e.type !== 'match').length;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(dayInfo)}
                  className={`calendar-cell ${dayInfo.isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  style={{
                    position: 'relative',
                    minHeight: 76,
                    padding: 6,
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: isSelected 
                      ? 'rgba(59,130,246,0.18)' 
                      : (isWeekend && !dayInfo.isOtherMonth ? 'rgba(255,255,255,0.025)' : 'var(--bg-card)'),
                    border: isSelected 
                      ? '2px solid #3B82F6' 
                      : (isToday ? '2px solid var(--primary-light)' : '1px solid var(--border)'),
                    boxShadow: isSelected ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Day Number Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: 12, 
                      fontWeight: isSelected || isToday ? 800 : 600,
                      color: isSelected ? '#3B82F6' : (isToday ? 'var(--primary-light)' : (dayInfo.isOtherMonth ? 'var(--text-muted)' : 'var(--text)'))
                    }}>
                      {dayInfo.day}
                    </span>

                    {/* Badge event counter if any */}
                    {dayEvts.length > 0 && (
                      <span 
                        className="badge" 
                        style={{ 
                          fontSize: 9, 
                          padding: '1px 5px', 
                          background: isSelected ? '#3B82F6' : 'rgba(15,109,66,0.25)', 
                          color: isSelected ? 'white' : 'var(--primary-light)',
                          fontWeight: 800
                        }}
                      >
                        {dayEvts.length}
                      </span>
                    )}
                  </div>

                  {/* Day event preview chips */}
                  <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayEvts.slice(0, 2).map((ev) => (
                      <div 
                        key={ev.id} 
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          padding: '2px 4px',
                          borderRadius: 4,
                          background: ev.color ? ev.color + '22' : 'rgba(59,130,246,0.2)',
                          color: ev.color || '#3B82F6',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.2
                        }}
                      >
                        {ev.type === 'match' ? '🏀 ' : '📅 '}
                        {ev.equipe || ev.title.split(' ')[0]}
                      </div>
                    ))}

                    {dayEvts.length > 2 && (
                      <span style={{ fontSize: 8.5, color: 'var(--text-muted)', fontWeight: 600 }}>
                        +{dayEvts.length - 2} autres...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Focused Day View (Événements de la journée sélectionnée) */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          
          {/* Day View Title & Header */}
          <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary-light)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarIcon size={13} />
                Vue Journée Sélectionnée
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>
                {selectedDate ? formatDateLongFR(selectedDate) : 'Sélectionnez un jour'}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedDate && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setNewEvent(prev => ({ ...prev, date: selectedDate }));
                    setShowAddModal(true);
                  }}
                  title="Ajouter un événement ce jour-là"
                >
                  <Plus size={14} /> Ce jour
                </button>
              )}
            </div>
          </div>

          {/* List of events STRICTLY for selectedDate */}
          {!selectedDate ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <CalendarIcon size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontWeight: 600 }}>Cliquez sur un jour du calendrier</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Sélectionnez une date pour afficher ses matchs et ses réunions.
              </p>
            </div>
          ) : selectedDayEvents.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>☕</div>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Aucun événement le {formatDateLongFR(selectedDate)}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, maxWidth: 280, margin: '4px auto 16px' }}>
                Pas de match ni de réunion programmée pour cette journée.
              </p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setNewEvent(prev => ({ ...prev, date: selectedDate }));
                  setShowAddModal(true);
                }}
              >
                <Plus size={14} /> Programmer un match / événement
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedDayEvents.length} événement(s) trouvé(s)</span>
                <span>{selectedDayEvents.filter(e => e.type === 'match').length} Match(s)</span>
              </div>

              {selectedDayEvents.map(evt => {
                const isMatch = evt.type === 'match';
                const isAway = evt.isAway || (evt.lieu && evt.lieu.toLowerCase().startsWith('à '));

                return (
                  <div 
                    key={evt.id}
                    className="card"
                    style={{ 
                      padding: 16, 
                      background: 'var(--bg-elevated)', 
                      borderColor: evt.color ? evt.color + '44' : 'var(--border)',
                      borderLeft: `4px solid ${evt.color || '#3B82F6'}`,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      
                      <div style={{ flex: 1 }}>
                        {/* Event Category & Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span 
                            className="badge" 
                            style={{ 
                              background: evt.color ? evt.color + '22' : 'rgba(59,130,246,0.15)', 
                              color: evt.color || '#3B82F6',
                              fontSize: 10,
                              fontWeight: 800
                            }}
                          >
                            {evt.typeLabel || evt.type}
                          </span>

                          {evt.category && (
                            <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                              {evt.category}
                            </span>
                          )}

                          {isMatch && (
                            <span 
                              className={`badge ${isAway ? 'badge-warning' : 'badge-success'}`}
                              style={{ fontSize: 10, fontWeight: 700 }}
                            >
                              {isAway ? '✈️ Extérieur' : '🏠 Domicile'}
                            </span>
                          )}

                          {evt.note === '*' && (
                            <span className="badge badge-danger" style={{ fontSize: 10 }} title="Mention spéciale inscrite au planning">
                              ⭐ Note *
                            </span>
                          )}
                        </div>

                        {/* Title & Match details */}
                        <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text)' }}>
                          {evt.title}
                        </h4>

                        {/* Meta info: Time & Location */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                          {evt.time && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontWeight: 600 }}>
                              <Clock size={13} color="var(--primary-light)" />
                              {evt.time}
                            </span>
                          )}

                          {evt.lieu && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={13} color="var(--accent)" />
                              {evt.lieu}
                            </span>
                          )}
                        </div>

                        {evt.details && (
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: 6 }}>
                            {evt.details}
                          </p>
                        )}
                      </div>

                      {/* Right Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {isMatch && onNavigateToVisuals && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => onNavigateToVisuals(evt)}
                            title="Créer un visuel réseaux sociaux pour ce match"
                            style={{ fontSize: 11, padding: '4px 8px', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}
                          >
                            <Palette size={13} /> Visuel
                          </button>
                        )}

                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteEvent(evt.id)} 
                          title="Supprimer l'événement de la BDD"
                          style={{ color: 'var(--danger)', width: 28, height: 28, alignSelf: 'flex-end' }}
                        >
                          <X size={14} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer shortcut to clear filter & show all month events */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Vue globale : <b>{filteredEvents.length} événements</b></span>
            
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => setSelectedDate(null)}
              style={{ fontSize: 11 }}
            >
              Afficher tout le mois
            </button>
          </div>

        </div>

      </div>

      {/* Add Event Modal Form */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} color="var(--primary-light)" />
                Ajouter un Événement BDD
              </h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={16} /></button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Titre de l'événement / Intitulé du Match</label>
                <input 
                  className="input" 
                  value={newEvent.title} 
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                  placeholder="Ex: SENIORS M A à Gouvieux" 
                />
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Type d'événement</label>
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

              <div className="grid-2" style={{ gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input className="input" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </div>

                <div className="input-group">
                  <label className="input-label">Heure (ex: 20:30)</label>
                  <input className="input" type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Lieu (Gymnase / Ville)</label>
                <input className="input" value={newEvent.lieu} onChange={e => setNewEvent({...newEvent, lieu: e.target.value})} placeholder="Gymnase BCSN, Dourges, Arras..." />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleAddEvent}>
                <Check size={16} /> Enregistrer dans la BDD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
