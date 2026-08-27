import React, { useState, useRef } from 'react';
import { 
  Download, Type, Palette, Image as ImageIcon, RefreshCw, 
  Sparkles, Trophy, Calendar, Users, Share2, Copy, Check
} from 'lucide-react';
import { getInitials } from '../hooks/useLocalStorage';

// Background images generated
const BG_IMAGES = {
  arena: '/artifacts/bcsn_dark_sports_bg_1787833109383.png', // Will copy or reference generated texture
  victory: '/artifacts/bcsn_victory_gold_bg_1787833122029.png',
};

const TEMPLATES = [
  { id: 'result', name: '🏆 Résultat de Match', icon: Trophy, category: 'match', desc: 'Score final, victoires & quarts-temps' },
  { id: 'match_day', name: '⚔️ Jour de Match', icon: Calendar, category: 'match', desc: 'Affiche de rencontre, lieu & heure' },
  { id: 'player_mvp', name: '⭐ MVP / Joueur du Match', icon: Sparkles, category: 'joueur', desc: 'Mise en avant d\'un joueur & stats' },
  { id: 'weekend_program', name: '📅 Programme Week-End', icon: Users, category: 'club', desc: 'Récapitulatif des matchs du club' },
  { id: 'announcement', name: '📢 Flash Info / Annonce', icon: Share2, category: 'club', desc: 'Communique officiel du BCSN' },
];

const FORMATS = [
  { id: 'story', label: '📱 Story (9:16)', ratio: '9 / 16', width: 360, height: 640 },
  { id: 'post', label: '🖼️ Post Carré (1:1)', ratio: '1 / 1', width: 450, height: 450 },
  { id: 'banner', label: '💻 Bannière (16:9)', ratio: '16 / 9', width: 500, height: 281 },
];

const THEMES = [
  { id: 'bcsn_green', name: 'Vert BCSN Neon', bg: 'linear-gradient(135deg, #092015 0%, #168E56 50%, #06150E 100%)', text: '#FFFFFF', accent: '#10B981' },
  { id: 'victory_gold', name: 'Or Victoire', bg: 'linear-gradient(135deg, #1A1508 0%, #B45309 50%, #78350F 100%)', text: '#FFFFFF', accent: '#F59E0B' },
  { id: 'dark_carbon', name: 'Carbone Premium', bg: 'linear-gradient(135deg, #0F1117 0%, #1E222D 100%)', text: '#FFFFFF', accent: '#3B82F6' },
  { id: 'match_red', name: 'Choc Rouge', bg: 'linear-gradient(135deg, #18080A 0%, #991B1B 50%, #450A0A 100%)', text: '#FFFFFF', accent: '#EF4444' },
];

export function VisualsPage({ teams = [], members = [], events = [] }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[1]); // 1:1 default
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const [config, setConfig] = useState({
    teamHome: 'BCSN',
    teamAway: 'US Cosne',
    score1: '78',
    score2: '64',
    isVictory: true,
    category: 'Séniors Garçons 1',
    date: new Date().toISOString().split('T')[0],
    time: '20:30',
    lieu: 'Gymnase Municipal de la Saône',
    selectedMemberId: '',
    playerPoints: '24',
    playerRebounds: '8',
    playerAssists: '5',
    customTitle: 'VICTOIRE DU BCSN !',
    customSubtitle: 'Une prestation XXL de nos séniors devant notre public ! 🏀🔥',
  });

  const canvasRef = useRef(null);

  const handleDownload = async () => {
    const node = canvasRef.current;
    if (!node) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(node, { backgroundColor: null, scale: 3, useCORS: true });
      const link = document.createElement('a');
      link.download = `bcsn-post-${selectedTemplate.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export PNG failed:', err);
    }
  };

  const selectedMember = members.find(m => m.id === config.selectedMemberId);

  // Generate Instagram / Facebook Caption ready to copy
  const generateCaption = () => {
    const hashtag = "#BCSN #BasketClubSaoneNivernais #Basketball #MatchDay #Nivernais #FFBB";
    switch (selectedTemplate.id) {
      case 'result':
        return `${config.isVictory ? '🎉 VICTOIRE !' : '🔴 FIN DU MATCH'}\n\n` +
          `🏀 ${config.category || 'BCSN'} vs ${config.teamAway}\n` +
          `📊 Score Final : ${config.teamHome} ${config.score1} - ${config.score2} ${config.teamAway}\n\n` +
          `${config.customSubtitle || 'Merci à tous les supporters venus nous encourager ! 💚'}\n\n${hashtag}`;

      case 'match_day':
        return `⚔️ JOUR DE MATCH !\n\n` +
          `🏀 ${config.category} accueil ${config.teamAway}\n` +
          `🗓️ ${config.date ? new Date(config.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Ce week-end'}\n` +
          `⏰ Coup d'envoi à ${config.time}\n` +
          `📍 ${config.lieu}\n\n` +
          `Venez pousser les vert et blanc ! 💪💚\n\n${hashtag}`;

      case 'player_mvp':
        return `⭐ JOUEUR DU MATCH !\n\n` +
          `👏 Énorme performance de ${selectedMember ? selectedMember.name : 'notre joueur'} !\n` +
          `📈 Stats du match :\n` +
          `• ${config.playerPoints} Points\n` +
          `• ${config.playerRebounds} Rebonds\n` +
          `• ${config.playerAssists} Passes Decisives\n\n` +
          `Félicitations au MVP ! 🔥🏀\n\n${hashtag}`;

      default:
        return `📢 ${config.customTitle}\n\n${config.customSubtitle}\n\n#BCSN #BasketClub`;
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generateCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Render Visual Canvas Output
  const renderVisualContent = () => {
    const isStory = selectedFormat.id === 'story';
    const isBanner = selectedFormat.id === 'banner';

    const visualStyle = {
      width: '100%',
      height: '100%',
      background: selectedTheme.bg,
      color: selectedTheme.text,
      fontFamily: 'var(--font-display)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: isStory ? '48px 32px' : isBanner ? '24px 32px' : '32px',
      boxSizing: 'border-[#2A2D3A]',
    };

    return (
      <div style={visualStyle}>
        {/* Subtle grid pattern background */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12,
          backgroundImage: 'radial-gradient(circle at 50% 50%, #FFF 1px, transparent 1px)',
          backgroundSize: '32px 32px', pointerEvents: 'none'
        }} />

        {/* Club Branding Top Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 2, borderBottom: '1px solid rgba(255,255,255,0.15)',
          paddingBottom: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#168E56',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900
            }}>
              🏀
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-accent)' }}>
                BCSN BASKET
              </div>
              <div style={{ fontSize: 10, opacity: 0.75, letterSpacing: 1 }}>SAÔNE & NIVERNAIS</div>
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', textTransform: 'uppercase'
          }}>
            {config.category || 'SENIORS'}
          </div>
        </div>

        {/* Center Main Content by Template */}
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
          
          {/* TEMPLATE 1: RESULTAT */}
          {selectedTemplate.id === 'result' && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                display: 'inline-block', fontSize: isStory ? 16 : 13, letterSpacing: 4, textTransform: 'uppercase',
                fontWeight: 900, background: config.isVictory ? selectedTheme.accent : '#EF4444',
                color: '#000', padding: '6px 16px', borderRadius: 20, marginBottom: 20, boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}>
                {config.isVictory ? '🏆 VICTOIRE' : '🔴 DÉFAITE'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isBanner ? 24 : 16, width: '100%' }}>
                {/* Home Team */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: isStory ? 24 : isBanner ? 20 : 22, fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>
                    {config.teamHome}
                  </div>
                  <div style={{
                    fontSize: isStory ? 72 : isBanner ? 54 : 64, fontWeight: 900,
                    fontFamily: 'var(--font-accent)', lineHeight: 0.9, color: config.isVictory ? selectedTheme.accent : '#FFF'
                  }}>
                    {config.score1}
                  </div>
                </div>

                <div style={{ fontSize: 24, opacity: 0.4, fontWeight: 900, fontFamily: 'var(--font-accent)' }}>VS</div>

                {/* Away Team */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: isStory ? 24 : isBanner ? 20 : 22, fontWeight: 800, textTransform: 'uppercase', opacity: 0.9 }}>
                    {config.teamAway}
                  </div>
                  <div style={{
                    fontSize: isStory ? 72 : isBanner ? 54 : 64, fontWeight: 900,
                    fontFamily: 'var(--font-accent)', lineHeight: 0.9
                  }}>
                    {config.score2}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE 2: MATCH DAY */}
          {selectedTemplate.id === 'match_day' && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: isStory ? 18 : 14, letterSpacing: 5, textTransform: 'uppercase', opacity: 0.8, marginBottom: 12, fontWeight: 800 }}>
                ⚔️ JOUR DE MATCH
              </div>

              <div style={{ fontSize: isStory ? 36 : isBanner ? 28 : 32, fontWeight: 900, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', lineHeight: 1.1 }}>
                {config.teamHome} <span style={{ color: selectedTheme.accent }}>VS</span> {config.teamAway}
              </div>

              <div style={{
                marginTop: 20, background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block'
              }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  🗓️ {config.date ? new Date(config.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Prochainement'}
                  {config.time ? ` à ${config.time}` : ''}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                  📍 {config.lieu}
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE 3: PLAYER MVP */}
          {selectedTemplate.id === 'player_mvp' && (
            <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: selectedTheme.accent, fontWeight: 900, marginBottom: 12 }}>
                ⭐ JOUEUR DU MATCH
              </div>

              {/* Player Image / Avatar */}
              <div style={{
                width: isStory ? 120 : 90, height: isStory ? 120 : 90, borderRadius: '50%',
                border: `4px solid ${selectedTheme.accent}`, overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', background: '#161921',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14
              }}>
                {selectedMember && selectedMember.photo ? (
                  <img src={selectedMember.photo} alt={selectedMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: 32, fontWeight: 900, color: selectedTheme.accent }}>
                    {selectedMember ? getInitials(selectedMember.name) : 'BCSN'}
                  </div>
                )}
              </div>

              <div style={{ fontSize: isStory ? 28 : 22, fontWeight: 900, fontFamily: 'var(--font-accent)', textTransform: 'uppercase' }}>
                {selectedMember ? selectedMember.name : 'Nom du Joueur'}
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: selectedTheme.accent }}>{config.playerPoints}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>POINTS</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: selectedTheme.accent }}>{config.playerRebounds}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>REBONDS</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: selectedTheme.accent }}>{config.playerAssists}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>PASSES</div>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE 4: WEEKEND PROGRAM */}
          {selectedTemplate.id === 'weekend_program' && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.8, marginBottom: 14, fontWeight: 800 }}>
                📅 PROGRAMME DU WEEK-END
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360, margin: '0 auto' }}>
                {teams.slice(0, 3).map((t, idx) => (
                  <div key={t.id} style={{
                    background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12
                  }}>
                    <span style={{ fontWeight: 700 }}>{t.name}</span>
                    <span style={{ opacity: 0.8 }}>vs Adversaire</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEMPLATE 5: ANNOUNCEMENT */}
          {selectedTemplate.id === 'announcement' && (
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
              <div style={{ fontSize: isStory ? 32 : 24, fontWeight: 900, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', color: selectedTheme.accent, marginBottom: 10 }}>
                {config.customTitle || 'COMMUNIQUÉ DU CLUB'}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5, maxWidth: 380, margin: '0 auto' }}>
                {config.customSubtitle}
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Hashtag */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.15)',
          paddingTop: 10, fontSize: 10, opacity: 0.8
        }}>
          <div>#BCSN #BASKET</div>
          <div>BASKET CLUB SAÔNE NIVERNAIS</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Template Chooser Bar */}
      <div className="card mb-16">
        <h3 className="card-title mb-16">🎨 Choisir le type de visuel</h3>
        <div className="template-grid">
          {TEMPLATES.map(t => {
            const Icon = t.icon;
            const isSelected = selectedTemplate.id === t.id;
            return (
              <div 
                key={t.id} 
                className={`template-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(t)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Icon size={18} style={{ color: isSelected ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid-2">
        {/* Left Side: Customize Config */}
        <div className="card">
          <h3 className="card-title mb-16">✏️ Personnaliser le contenu</h3>

          {/* Formats Selector */}
          <div className="input-group mb-16">
            <label className="input-label">Format d'export</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  className={`btn btn-sm ${selectedFormat.id === f.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedFormat(f)}
                  style={{ flex: 1, fontSize: 12 }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="input-group mb-16">
            <label className="input-label">Thème Graphique</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {THEMES.map(th => (
                <button
                  key={th.id}
                  onClick={() => setSelectedTheme(th)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, background: th.bg, color: th.text,
                    border: selectedTheme.id === th.id ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.1)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  {th.name}
                </button>
              ))}
            </div>
          </div>

          {/* Fields by Template */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Catégorie / Équipe</label>
              <select className="input select" value={config.category} onChange={e => setConfig({...config, category: e.target.value})}>
                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                <option value="Toutes les équipes">Toutes les équipes</option>
              </select>
            </div>

            {selectedTemplate.id === 'result' && (
              <>
                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Équipe BCSN</label>
                    <input className="input" value={config.teamHome} onChange={e => setConfig({...config, teamHome: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Adversaire</label>
                    <input className="input" value={config.teamAway} onChange={e => setConfig({...config, teamAway: e.target.value})} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Score BCSN</label>
                    <input className="input" type="number" value={config.score1} onChange={e => setConfig({...config, score1: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Score Adversaire</label>
                    <input className="input" type="number" value={config.score2} onChange={e => setConfig({...config, score2: e.target.value})} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Résultat</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className={`btn btn-sm ${config.isVictory ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setConfig({...config, isVictory: true})}>
                      🏆 Victoire
                    </button>
                    <button className={`btn btn-sm ${!config.isVictory ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setConfig({...config, isVictory: false})}>
                      🔴 Défaite
                    </button>
                  </div>
                </div>
              </>
            )}

            {selectedTemplate.id === 'match_day' && (
              <>
                <div className="input-group">
                  <label className="input-label">Adversaire</label>
                  <input className="input" value={config.teamAway} onChange={e => setConfig({...config, teamAway: e.target.value})} />
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Date du match</label>
                    <input className="input" type="date" value={config.date} onChange={e => setConfig({...config, date: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Heure coup d'envoi</label>
                    <input className="input" type="time" value={config.time} onChange={e => setConfig({...config, time: e.target.value})} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Lieu du match</label>
                  <input className="input" value={config.lieu} onChange={e => setConfig({...config, lieu: e.target.value})} />
                </div>
              </>
            )}

            {selectedTemplate.id === 'player_mvp' && (
              <>
                <div className="input-group">
                  <label className="input-label">Sélectionner le Joueur</label>
                  <select className="input select" value={config.selectedMemberId} onChange={e => setConfig({...config, selectedMemberId: e.target.value})}>
                    <option value="">-- Choisir parmi la base de données --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.team || 'Joueur'})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <div className="input-group">
                    <label className="input-label">Points</label>
                    <input className="input" value={config.playerPoints} onChange={e => setConfig({...config, playerPoints: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Rebonds</label>
                    <input className="input" value={config.playerRebounds} onChange={e => setConfig({...config, playerRebounds: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Passes</label>
                    <input className="input" value={config.playerAssists} onChange={e => setConfig({...config, playerAssists: e.target.value})} />
                  </div>
                </div>
              </>
            )}

            {selectedTemplate.id === 'announcement' && (
              <>
                <div className="input-group">
                  <label className="input-label">Titre de l'annonce</label>
                  <input className="input" value={config.customTitle} onChange={e => setConfig({...config, customTitle: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Message / Description</label>
                  <textarea className="input textarea" value={config.customSubtitle} onChange={e => setConfig({...config, customSubtitle: e.target.value})} rows={4} />
                </div>
              </>
            )}
          </div>

          {/* Automatic Instagram Caption Generator */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="input-label" style={{ margin: 0 }}>📲 Légende Réseaux Sociaux (Instagram / FB)</label>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyCaption}>
                {copiedCaption ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                {copiedCaption ? 'Copié !' : 'Copier le texte'}
              </button>
            </div>
            <textarea
              className="input textarea"
              value={generateCaption()}
              readOnly
              rows={5}
              style={{ fontSize: 12, fontFamily: 'monospace', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        {/* Right Side: Visual Preview Canvas */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="card-title">👁️ Aperçu HD Studio</h3>
            <button className="btn btn-primary" onClick={handleDownload}>
              <Download size={16} /> Exporter PNG
            </button>
          </div>

          <div style={{
            width: selectedFormat.width,
            maxWidth: '100%',
            aspectRatio: selectedFormat.ratio,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid #2A2D3A'
          }} ref={canvasRef}>
            {renderVisualContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
