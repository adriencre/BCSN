import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Database, 
  Search, CheckCircle, RefreshCw, FileSpreadsheet,
  Calendar as CalendarIcon, Palette, Check
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
  if (startDay < 0) startDay = 6;
  
  const days = [];
  const prevLast = new Date(year, month, 0).getDate();
  
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ day: prevLast - i, month: month - 1, year, isOtherMonth: true });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ day: d, month, year, isOtherMonth: false });
  }
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
  
  const defaultYear = now.getFullYear() < 2026 ? 2026 : now.getFullYear();
  const defaultMonth = now.getFullYear() < 2026 ? 8 : now.getMonth(); // Septembre

  const [viewMonth, setViewMonth] = useState(defaultMonth);
  const [viewYear, setViewYear] = useState(defaultYear);
  const [selectedDate, setSelectedDate] = useState('2026-09-12');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  
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

  const handleMonthSelect = (e) => {
    const [y, m] = e.target.value.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m);
  };

  // Filter events
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

  const monthEventsCount = useMemo(() => {
    return filteredEvents.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date + 'T00:00:00');
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    }).length;
  }, [filteredEvents, viewMonth, viewYear]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents.filter(e => e.date === selectedDate);
  }, [filteredEvents, selectedDate]);

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(e => {
      if (!e.date) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filteredEvents]);

  const handleDayClick = (dayInfo) => {
    const dateStr = formatDateISO(dayInfo.year, dayInfo.month, dayInfo.day);
    setSelectedDate(dateStr);
    setNewEvent(prev => ({ ...prev, date: dateStr }));
  };

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
        setSyncStatus('Événement enregistré en BDD !');
        setTimeout(() => setSyncStatus(null), 3000);
      } catch (err) {
        console.error(err);
      }
    }

    setShowAddModal(false);
    setNewEvent({ title: '', type: 'match', date: selectedDate || '', time: '20:30', lieu: 'Gymnase BCSN', equipe: 'SENIORS M A', adversaire: '', category: 'Seniors' });
  };

  const handleDeleteEvent = async (id) => {
    onUpdateEvents(prev => prev.filter(e => e.id !== id));
    if (cloudActive) {
      try {
        await deleteEventCloud(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSyncToDatabase = async () => {
    setIsSyncing(true);
    setSyncStatus('Envoi du planning dans la BDD...');

    try {
      if (cloudActive) {
        await seedEventsToCloud(ALL_PLANNING_2026_2027);
        setSyncStatus('✅ 133 Matchs et Événements enregistrés en BDD Firestore !');
      } else {
        onUpdateEvents(ALL_PLANNING_2026_2027);
        setSyncStatus('✅ Planning 2026-2027 synchronisé !');
      }
    } catch (err) {
      console.error(err);
      setSyncStatus(`❌ Erreur : ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

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
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      {/* HEADER BANNER & BDD ACTIONS */}
      <div className="card mb-16" style={{ padding: '16px 20px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: cloudActive ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: cloudActive ? '#10B981' : '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                Planning & Calendrier BDD
                <span className={`badge ${cloudActive ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: 10 }}>
                  {cloudActive ? '● BDD Firestore' : 'Local'}
                </span>
              </h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                <strong style={{ color: 'var(--text)' }}>{events.length} entrées</strong> ({totalMatches} Matchs · {totalEvents} Événements Club)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleSyncToDatabase}
              disabled={isSyncing}
              style={{ background: cloudActive ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)', color: cloudActive ? '#10B981' : '#3B82F6', borderColor: 'currentColor' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
              {cloudActive ? '⚡ Synchro BDD Firestore' : '🔄 Synchroniser (133)'}
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
              <FileSpreadsheet size={14} /> CSV / Excel
            </button>

            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>

        {syncStatus && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={15} />
            {syncStatus}
          </div>
        )}
      </div>

      {/* COMPACT TOOLBAR FILTER BAR (NO LONGER FULL WIDTH STRETCHING) */}
      <div className="card mb-16" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          
          {/* Search Input */}
          <div style={{ flex: '1 1 240px', minWidth: 200, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input" 
              style={{ paddingLeft: 34, height: 36, fontSize: 13 }}
              placeholder="Rechercher (équipe, lieu, etc)..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Type Filter Select */}
          <div style={{ flex: '0 1 180px', minWidth: 150 }}>
            <select className="input select" style={{ height: 36, fontSize: 13 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tous les types ({events.length})</option>
              <option value="match">Matchs ({totalMatches})</option>
              <option value="evenement">Événements Club</option>
              <option value="reunion">Réunions</option>
              <option value="deadline">Indisponibilités</option>
            </select>
          </div>

          {/* Category Filter Select */}
          <div style={{ flex: '0 1 180px', minWidth: 150 }}>
            <select className="input select" style={{ height: 36, fontSize: 13 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">Toutes les catégories</option>
              <option value="Seniors">Séniors (M & F)</option>
              <option value="Juniors">Juniors / U18</option>
              <option value="Cadets">Cadets / U15 / U13</option>
              <option value="Jeunes">Jeunes / U11</option>
            </select>
          </div>

          {(filterType !== 'all' || filterCategory !== 'all' || searchQuery) && (
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => { setFilterType('all'); setFilterCategory('all'); setSearchQuery(''); }}
              style={{ fontSize: 12, height: 36 }}
            >
              Effacer filtres
            </button>
          )}

        </div>
      </div>

      {/* MAIN TWO-COLUMN GRID: STRICT MONTH GRID (LEFT) & DAY FOCUS (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)', gap: 16, alignItems: 'start' }}>
        
        {/* LEFT COLUMN: PERFECTLY STRAIGHT 7-COLUMN MONTH GRID */}
        <div className="card" style={{ padding: 16 }}>
          
          {/* Header Month Control */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={prevMonth} title="Mois précédent"><ChevronLeft size={16} /></button>
              
              <select 
                className="select" 
                value={`${viewYear}-${viewMonth}`} 
                onChange={handleMonthSelect}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, border: 'none', background: 'transparent', padding: '2px 4px', cursor: 'pointer' }}
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

              <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={nextMonth} title="Mois suivant"><ChevronRight size={16} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="badge badge-neutral" style={{ fontSize: 10 }}>{monthEventsCount} événements</span>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const nowY = now.getFullYear() < 2026 ? 2026 : now.getFullYear();
                  const nowM = now.getFullYear() < 2026 ? 8 : now.getMonth();
                  setViewYear(nowY);
                  setViewMonth(nowM);
                  setSelectedDate('2026-09-12');
                }}
                style={{ fontSize: 11, padding: '2px 6px' }}
              >
                Aujourd'hui
              </button>
            </div>
          </div>

          {/* STRICT EQUAL HEIGHT & WIDTH 7-COLUMN GRID */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', 
            gap: 4 
          }}>
            
            {/* Weekday Header */}
            {DAYS_SHORT.map((d, index) => (
              <div 
                key={d} 
                style={{ 
                  textAlign: 'center', 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: index >= 5 ? 'var(--accent)' : 'var(--text-muted)', 
                  padding: '6px 0',
                  textTransform: 'uppercase'
                }}
              >
                {d}
              </div>
            ))}

            {/* 42 Calendar Cells (Strictly Fixed Height = 68px for perfect alignment) */}
            {calendarDays.map((dayInfo, idx) => {
              const dateStr = formatDateISO(dayInfo.year, dayInfo.month, dayInfo.day);
              const dayEvts = eventsByDate[dateStr] || [];
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;
              const isWeekend = (idx % 7 === 5) || (idx % 7 === 6);

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(dayInfo)}
                  style={{
                    height: 68,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    borderRadius: 8,
                    padding: '4px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    background: isSelected 
                      ? 'rgba(59,130,246,0.18)' 
                      : (isWeekend && !dayInfo.isOtherMonth ? 'rgba(255,255,255,0.025)' : 'var(--bg-card)'),
                    border: isSelected 
                      ? '2px solid #3B82F6' 
                      : (isToday ? '2px solid var(--primary-light)' : '1px solid var(--border)'),
                    opacity: dayInfo.isOtherMonth ? 0.35 : 1,
                    transition: 'all 0.12s ease'
                  }}
                >
                  {/* Top row: Day Number & Event Counter */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: 11.5, 
                      fontWeight: isSelected || isToday ? 800 : 600,
                      color: isSelected ? '#3B82F6' : (isToday ? 'var(--primary-light)' : 'var(--text)')
                    }}>
                      {dayInfo.day}
                    </span>

                    {dayEvts.length > 0 && (
                      <span 
                        style={{ 
                          fontSize: 9, 
                          padding: '1px 5px', 
                          borderRadius: 10,
                          background: isSelected ? '#3B82F6' : 'rgba(15,109,66,0.3)', 
                          color: isSelected ? 'white' : 'var(--primary-light)',
                          fontWeight: 800,
                          lineHeight: 1
                        }}
                      >
                        {dayEvts.length}
                      </span>
                    )}
                  </div>

                  {/* Bottom row: Compact dot indicators & mini label */}
                  {dayEvts.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
                        {dayEvts.slice(0, 4).map(e => (
                          <div 
                            key={e.id}
                            style={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: '50%', 
                              background: e.color || '#3B82F6' 
                            }} 
                          />
                        ))}
                      </div>
                      <div style={{ 
                        fontSize: 8.5, 
                        fontWeight: 700, 
                        color: 'var(--text-secondary)', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {dayEvts[0].equipe ? dayEvts[0].equipe : dayEvts[0].title.slice(0, 10)}
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: 12 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: FOCUSED DAY EVENT LIST */}
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', height: 505, boxSizing: 'border-box' }}>
          
          {/* Day View Header */}
          <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--primary-light)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalendarIcon size={12} />
                Événements du Jour
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '2px 0 0 0', fontFamily: 'var(--font-display)' }}>
                {selectedDate ? formatDateLongFR(selectedDate) : 'Sélectionnez un jour'}
              </h3>
            </div>

            {selectedDate && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setNewEvent(prev => ({ ...prev, date: selectedDate }));
                  setShowAddModal(true);
                }}
                style={{ fontSize: 11, padding: '4px 8px' }}
              >
                <Plus size={13} /> Ajouter
              </button>
            )}
          </div>

          {/* List of events strictly for selectedDate */}
          {!selectedDate ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <CalendarIcon size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontWeight: 600, fontSize: 13 }}>Cliquez sur une case du calendrier</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Sélectionnez une date pour voir les matchs programmés.
              </p>
            </div>
          ) : selectedDayEvents.length === 0 ? (
            <div className="empty-state" style={{ padding: '50px 16px' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>☕</div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Aucun événement ce jour-là</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, marginBottom: 14 }}>
                Pas de match ni de réunion le {formatDateLongFR(selectedDate)}.
              </p>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setNewEvent(prev => ({ ...prev, date: selectedDate }));
                  setShowAddModal(true);
                }}
              >
                <Plus size={13} /> Ajouter pour cette date
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4, maxHeight: 370 }}>
              
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{selectedDayEvents.length} événement(s)</span>
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
                      padding: 12, 
                      background: 'var(--bg-elevated)', 
                      borderColor: 'var(--border)',
                      borderLeft: `4px solid ${evt.color || '#3B82F6'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        
                        {/* Badges row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: evt.color ? evt.color + '22' : 'rgba(59,130,246,0.15)', color: evt.color || '#3B82F6', fontSize: 10, fontWeight: 800 }}>
                            {evt.typeLabel || evt.type}
                          </span>

                          {evt.category && (
                            <span className="badge badge-neutral" style={{ fontSize: 9.5 }}>
                              {evt.category}
                            </span>
                          )}

                          {isMatch && (
                            <span className={`badge ${isAway ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: 9.5, fontWeight: 700 }}>
                              {isAway ? '✈️ Extérieur' : '🏠 Domicile'}
                            </span>
                          )}

                          {evt.note === '*' && (
                            <span className="badge badge-danger" style={{ fontSize: 9.5 }}>⭐ Note *</span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text)' }}>
                          {evt.title}
                        </h4>

                        {/* Time & Location */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {evt.time && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontWeight: 600 }}>
                              <Clock size={12} color="var(--primary-light)" />
                              {evt.time}
                            </span>
                          )}

                          {evt.lieu && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={12} color="var(--accent)" />
                              {evt.lieu}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isMatch && onNavigateToVisuals && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => onNavigateToVisuals(evt)}
                            title="Créer un visuel réseaux sociaux"
                            style={{ fontSize: 10, padding: '3px 7px' }}
                          >
                            <Palette size={12} /> Visuel
                          </button>
                        )}

                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteEvent(evt.id)} 
                          title="Supprimer"
                          style={{ color: 'var(--danger)', width: 26, height: 26 }}
                        >
                          <X size={13} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Affichage : {filteredEvents.length} entrées</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDate(null)} style={{ fontSize: 11 }}>
              Tout réafficher
            </button>
          </div>

        </div>

      </div>

      {/* ADD EVENT MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={16} color="var(--primary-light)" />
                Ajouter un Événement BDD
              </h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={15} /></button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="input-group">
                <label className="input-label">Intitulé de l'événement / Match</label>
                <input 
                  className="input" 
                  value={newEvent.title} 
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                  placeholder="Ex: SENIORS M A à Gouvieux" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input className="input" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </div>

                <div className="input-group">
                  <label className="input-label">Heure</label>
                  <input className="input" type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Lieu</label>
                <input className="input" value={newEvent.lieu} onChange={e => setNewEvent({...newEvent, lieu: e.target.value})} placeholder="Gymnase BCSN, Dourges..." />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleAddEvent}>
                <Check size={15} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
