import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin } from 'lucide-react';
import { EVENT_TYPES } from '../data/teamsData';
import { generateId } from '../hooks/useLocalStorage';

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

export function CalendarPage({ events, onUpdateEvents }) {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'match', date: '', time: '', lieu: '' });

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

  const getEventsForDay = (day, month, year) => {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const handleAddEvent = () => {
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
    };
    onUpdateEvents(prev => [...prev, event]);
    setNewEvent({ title: '', type: 'match', date: '', time: '', lieu: '' });
    setShowAdd(false);
  };

  const handleDeleteEvent = (id) => {
    onUpdateEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleDayClick = (dayInfo) => {
    const dateStr = `${dayInfo.year}-${String(dayInfo.month + 1).padStart(2,'0')}-${String(dayInfo.day).padStart(2,'0')}`;
    setSelectedDate(dateStr);
    setNewEvent(prev => ({ ...prev, date: dateStr }));
  };

  // Upcoming events sorted
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Ajouter un événement
        </button>
      </div>

      {showAdd && (
        <div className="card mb-16" style={{ borderColor: 'var(--primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="card-title">Nouvel événement</h3>
            <button className="btn-icon" onClick={() => setShowAdd(false)}><X size={16} /></button>
          </div>
          <div className="grid-2 mb-16">
            <div className="input-group">
              <label className="input-label">Titre</label>
              <input className="input" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Ex: Match U15M vs Nantes BC" />
            </div>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="input select" value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                {EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2 mb-16">
            <div className="input-group">
              <label className="input-label">Date</label>
              <input className="input" type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Heure</label>
              <input className="input" type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
            </div>
          </div>
          <div className="input-group mb-16">
            <label className="input-label">Lieu (optionnel)</label>
            <input className="input" value={newEvent.lieu} onChange={e => setNewEvent({...newEvent, lieu: e.target.value})} placeholder="Salle omnisports, ..." />
          </div>
          <button className="btn btn-primary" onClick={handleAddEvent}>Enregistrer</button>
        </div>
      )}

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
          <h3 className="card-title mb-16">📋 Tous les événements</h3>
          {upcomingEvents.length === 0 ? (
            <div className="empty-state">
              <p>Aucun événement</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Clique sur "Ajouter" pour créer ton premier événement</p>
            </div>
          ) : (
            <div className="event-list" style={{ maxHeight: 500, overflowY: 'auto' }}>
              {upcomingEvents.map(evt => (
                <div className="event-item" key={evt.id}>
                  <div className="event-color-bar" style={{ background: evt.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{evt.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(evt.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      {evt.time ? ` · ${evt.time}` : ''}
                    </div>
                    {evt.lieu && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><MapPin size={10} style={{ display: 'inline' }} /> {evt.lieu}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-neutral">{evt.typeLabel}</span>
                    <button className="btn-icon" onClick={() => handleDeleteEvent(evt.id)} title="Supprimer" style={{ color: 'var(--danger)' }}><X size={14} /></button>
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
