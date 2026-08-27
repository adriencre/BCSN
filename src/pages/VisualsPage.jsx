import React, { useState, useRef } from 'react';
import { Download, Type, Palette, Image, RefreshCw } from 'lucide-react';
import { VISUAL_TEMPLATES } from '../data/teamsData';

export function VisualsPage({ teams }) {
  const [selectedTemplate, setSelectedTemplate] = useState(VISUAL_TEMPLATES[0]);
  const [config, setConfig] = useState({
    teamHome: 'BCSN',
    teamAway: 'Adversaire',
    date: '',
    time: '',
    lieu: 'Salle omnisports',
    score1: '',
    score2: '',
    playerName: '',
    title: 'BCSN',
    subtitle: '',
  });
  const canvasRef = useRef(null);

  const handleDownload = async () => {
    const node = canvasRef.current;
    if (!node) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = `bcsn-${selectedTemplate.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const renderPreview = () => {
    const t = selectedTemplate;
    const commonStyle = {
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40,
      background: t.gradient, color: 'white', fontFamily: 'var(--font-display)',
      position: 'relative', overflow: 'hidden',
    };

    const bgPattern = (
      <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    );

    switch (t.id) {
      case 'match_day':
        return (
          <div style={commonStyle}>
            {bgPattern}
            <div style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.8, marginBottom: 16, position: 'relative' }}>JOUR DE MATCH</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 42, fontWeight: 800, fontFamily: 'var(--font-accent)' }}>{config.teamHome || 'BCSN'}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, opacity: 0.5, fontFamily: 'var(--font-accent)' }}>VS</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 42, fontWeight: 800, fontFamily: 'var(--font-accent)' }}>{config.teamAway || 'ADVERSAIRE'}</div>
              </div>
            </div>
            <div style={{ marginTop: 24, fontSize: 16, opacity: 0.9, position: 'relative' }}>
              {config.date && new Date(config.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              {config.time && ` · ${config.time}`}
            </div>
            <div style={{ fontSize: 14, opacity: 0.7, marginTop: 6, position: 'relative' }}>{config.lieu}</div>
          </div>
        );
      case 'result':
        return (
          <div style={commonStyle}>
            {bgPattern}
            <div style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.8, marginBottom: 16, position: 'relative' }}>RÉSULTAT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{config.teamHome || 'BCSN'}</div>
                <div style={{ fontSize: 64, fontWeight: 900, fontFamily: 'var(--font-accent)', lineHeight: 1 }}>{config.score1 || '0'}</div>
              </div>
              <div style={{ fontSize: 24, opacity: 0.4 }}>-</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{config.teamAway || 'ADV'}</div>
                <div style={{ fontSize: 64, fontWeight: 900, fontFamily: 'var(--font-accent)', lineHeight: 1 }}>{config.score2 || '0'}</div>
              </div>
            </div>
          </div>
        );
      case 'player_spotlight':
        return (
          <div style={commonStyle}>
            {bgPattern}
            <div style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.8, marginBottom: 12, position: 'relative' }}>⭐ JOUEUR DU MATCH</div>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, marginBottom: 16, position: 'relative' }}>
              {config.playerName ? config.playerName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?'}
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-accent)', position: 'relative' }}>{config.playerName || 'Nom du joueur'}</div>
            <div style={{ fontSize: 16, opacity: 0.8, marginTop: 8, position: 'relative' }}>{config.subtitle || 'BCSN'}</div>
          </div>
        );
      default:
        return (
          <div style={commonStyle}>
            {bgPattern}
            <div style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.8, marginBottom: 16, position: 'relative' }}>{t.name.toUpperCase()}</div>
            <div style={{ fontSize: 42, fontWeight: 800, fontFamily: 'var(--font-accent)', textAlign: 'center', position: 'relative' }}>{config.title || 'BCSN'}</div>
            <div style={{ fontSize: 18, opacity: 0.8, marginTop: 12, textAlign: 'center', position: 'relative', maxWidth: '80%' }}>{config.subtitle || 'Sous-titre ici'}</div>
          </div>
        );
    }
  };

  const renderFields = () => {
    const t = selectedTemplate;
    switch (t.id) {
      case 'match_day':
        return (
          <>
            <div className="input-group"><label className="input-label">Équipe domicile</label><input className="input" value={config.teamHome} onChange={e => setConfig({...config, teamHome: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Équipe extérieure</label><input className="input" value={config.teamAway} onChange={e => setConfig({...config, teamAway: e.target.value})} /></div>
            <div className="grid-2">
              <div className="input-group"><label className="input-label">Date</label><input className="input" type="date" value={config.date} onChange={e => setConfig({...config, date: e.target.value})} /></div>
              <div className="input-group"><label className="input-label">Heure</label><input className="input" type="time" value={config.time} onChange={e => setConfig({...config, time: e.target.value})} /></div>
            </div>
            <div className="input-group"><label className="input-label">Lieu</label><input className="input" value={config.lieu} onChange={e => setConfig({...config, lieu: e.target.value})} /></div>
          </>
        );
      case 'result':
        return (
          <>
            <div className="grid-2">
              <div className="input-group"><label className="input-label">Équipe domicile</label><input className="input" value={config.teamHome} onChange={e => setConfig({...config, teamHome: e.target.value})} /></div>
              <div className="input-group"><label className="input-label">Équipe ext.</label><input className="input" value={config.teamAway} onChange={e => setConfig({...config, teamAway: e.target.value})} /></div>
            </div>
            <div className="grid-2">
              <div className="input-group"><label className="input-label">Score domicile</label><input className="input" type="number" value={config.score1} onChange={e => setConfig({...config, score1: e.target.value})} /></div>
              <div className="input-group"><label className="input-label">Score ext.</label><input className="input" type="number" value={config.score2} onChange={e => setConfig({...config, score2: e.target.value})} /></div>
            </div>
          </>
        );
      case 'player_spotlight':
        return (
          <>
            <div className="input-group"><label className="input-label">Nom du joueur</label><input className="input" value={config.playerName} onChange={e => setConfig({...config, playerName: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Sous-titre</label><input className="input" value={config.subtitle} onChange={e => setConfig({...config, subtitle: e.target.value})} placeholder="Ex: 24 pts, 8 rbds" /></div>
          </>
        );
      default:
        return (
          <>
            <div className="input-group"><label className="input-label">Titre</label><input className="input" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} /></div>
            <div className="input-group"><label className="input-label">Sous-titre</label><textarea className="input textarea" value={config.subtitle} onChange={e => setConfig({...config, subtitle: e.target.value})} /></div>
          </>
        );
    }
  };

  return (
    <div>
      <div className="card mb-16">
        <h3 className="card-title mb-16">📐 Choisir un template</h3>
        <div className="template-grid">
          {VISUAL_TEMPLATES.map(t => (
            <div key={t.id} className={`template-card ${selectedTemplate.id === t.id ? 'selected' : ''}`} onClick={() => setSelectedTemplate(t)}>
              <div style={{ width: '100%', height: 60, borderRadius: 8, marginBottom: 8, background: t.gradient }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title mb-16">✏️ Personnaliser</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {renderFields()}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="card-title">👁️ Aperçu</h3>
            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
              <Download size={14} /> Exporter PNG
            </button>
          </div>
          <div ref={canvasRef} style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
