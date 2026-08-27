import React, { useState, useRef } from 'react';
import { 
  Download, Type, Palette, Image as ImageIcon, RefreshCw, 
  Sparkles, Trophy, Calendar, Users, Share2, Copy, Check, Sliders, Layers, Swords, Megaphone
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { getInitials } from '../hooks/useLocalStorage';

const TEMPLATES = [
  { id: 'result', name: 'Résultat de Match', icon: 'ph:trophy-bold', desc: 'Score final, victoires & quarts-temps' },
  { id: 'match_day', name: 'Jour de Match', icon: 'ph:swords-bold', desc: 'Affiche de rencontre, lieu & heure' },
  { id: 'player_mvp', name: 'MVP / Carte Joueur', icon: 'ph:star-bold', desc: 'Mise en avant joueur & photo réelle' },
  { id: 'weekend_program', name: 'Programme Week-End', icon: 'ph:calendar-blank-bold', desc: 'Récapitulatif des matchs du club' },
  { id: 'announcement', name: 'Flash Info / Annonce', icon: 'ph:megaphone-bold', desc: 'Communiqué officiel du BCSN' },
];

const FORMATS = [
  { id: 'story', label: 'Story (9:16)', icon: 'ph:device-mobile-camera-bold', ratio: '9 / 16', width: 360, height: 640 },
  { id: 'post', label: 'Post Carré (1:1)', icon: 'ph:square-bold', ratio: '1 / 1', width: 450, height: 450 },
  { id: 'banner', label: 'Bannière (16:9)', icon: 'ph:desktop-bold', ratio: '16 / 9', width: 500, height: 281 },
];

const FONTS = [
  { id: 'Graduate', name: 'College Jersey (Graduate)', fontFamily: "'Graduate', serif" },
  { id: 'Alfa Slab One', name: 'Heavy Vintage (Alfa Slab)', fontFamily: "'Alfa Slab One', cursive" },
  { id: 'Bebas Neue', name: 'Streetwear Bold (Bebas Neue)', fontFamily: "'Bebas Neue', sans-serif" },
  { id: 'Outfit', name: 'Modern Sport (Outfit)', fontFamily: "'Outfit', sans-serif" },
];

const BUILTIN_TEXTURES = [
  { id: 'wood', name: 'Parquet Bois Rétro', url: '/artifacts/bcsn_wood_court_texture_1787834010959.png' },
  { id: 'leather', name: 'Cuir Ballon de Basket', url: '/artifacts/bcsn_leather_ball_texture_1787834023930.png' },
  { id: 'arena', name: 'Arena Sports Neon', url: '/artifacts/bcsn_dark_sports_bg_1787833109383.png' },
  { id: 'victory', name: 'Or & Confettis Victoire', url: '/artifacts/bcsn_victory_gold_bg_1787833122029.png' },
];

export function VisualsPage({ teams = [], members = [], events = [], customAssets = [] }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[1]); // 1:1 default
  const [selectedFont, setSelectedFont] = useState(FONTS[0]); // Graduate College font
  const [selectedBgUrl, setSelectedBgUrl] = useState(BUILTIN_TEXTURES[0].url);
  const [grainOverlay, setGrainOverlay] = useState(true);
  const [photoFilter, setPhotoFilter] = useState('none');
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
    customSubtitle: 'Une prestation XXL de nos séniors devant notre public !',
  });

  const canvasRef = useRef(null);

  const customBackgrounds = customAssets.filter(a => a.type === 'background');
  const customLogos = customAssets.filter(a => a.type === 'logo');

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

  // Generate Instagram Caption ready to copy
  const generateCaption = () => {
    const hashtag = "#BCSN #BasketClubSaoneNivernais #Basketball #StreetwearBasket #CollegeBasket #FFBB";
    switch (selectedTemplate.id) {
      case 'result':
        return `${config.isVictory ? 'VICTOIRE !' : 'FIN DU MATCH'}\n\n` +
          `${config.category || 'BCSN'} vs ${config.teamAway}\n` +
          `Score Final : ${config.teamHome} ${config.score1} - ${config.score2} ${config.teamAway}\n\n` +
          `${config.customSubtitle || 'Merci à tous les supporters venus nous pousser !'}\n\n${hashtag}`;

      case 'match_day':
        return `JOUR DE MATCH !\n\n` +
          `${config.category} accueille ${config.teamAway}\n` +
          `${config.date ? new Date(config.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Ce week-end'}\n` +
          `Coup d'envoi à ${config.time}\n` +
          `Lieu : ${config.lieu}\n\n` +
          `Venez pousser les vert et blanc !\n\n${hashtag}`;

      case 'player_mvp':
        return `MVP DU MATCH !\n\n` +
          `Énorme performance de ${selectedMember ? selectedMember.name : 'notre joueur'} !\n` +
          `Stats du match :\n` +
          `• ${config.playerPoints} PTS\n` +
          `• ${config.playerRebounds} REB\n` +
          `• ${config.playerAssists} AST\n\n` +
          `Félicitations au MVP !\n\n${hashtag}`;

      default:
        return `${config.customTitle}\n\n${config.customSubtitle}\n\n${hashtag}`;
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generateCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Render Visual Canvas Output with SVG icons instead of system emojis
  const renderVisualContent = () => {
    const isStory = selectedFormat.id === 'story';
    const isBanner = selectedFormat.id === 'banner';

    const visualStyle = {
      width: '100%',
      height: '100%',
      backgroundImage: `url(${selectedBgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#FFFFFF',
      fontFamily: selectedFont.fontFamily,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: isStory ? '44px 28px' : isBanner ? '20px 28px' : '28px',
      boxSizing: 'border-box',
    };

    return (
      <div style={visualStyle}>
        {/* Dark Vignette Layer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Vintage Halftone Grain Layer */}
        {grainOverlay && (
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.18,
            backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px',
            pointerEvents: 'none', mixBlendMode: 'overlay'
          }} />
        )}

        {/* Header Branding */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 2, borderBottom: '2px solid rgba(255,255,255,0.25)',
          paddingBottom: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#168E56',
              border: '2px solid #FFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}>
              <Icon icon="ph:basketball-bold" width="22" height="22" color="#FFF" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', fontFamily: selectedFont.fontFamily }}>
                BCSN BASKET
              </div>
              <div style={{ fontSize: 9, opacity: 0.85, letterSpacing: 1.5, fontFamily: "'Inter', sans-serif" }}>EST. 1978 · SAÔNE & NIVERNAIS</div>
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 900, padding: '4px 12px', borderRadius: 4,
            background: '#168E56', color: '#FFF', border: '1px solid #FFF',
            textTransform: 'uppercase', letterSpacing: 1, boxShadow: '3px 3px 0px #000'
          }}>
            {config.category || 'SENIORS'}
          </div>
        </div>

        {/* Center Content */}
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '14px 0' }}>
          
          {/* TEMPLATE 1: RESULTAT */}
          {selectedTemplate.id === 'result' && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: isStory ? 20 : 16, letterSpacing: 3, textTransform: 'uppercase',
                fontWeight: 900, background: config.isVictory ? '#F59E0B' : '#EF4444',
                color: '#000', padding: '6px 20px', borderRadius: 6, marginBottom: 16,
                border: '2px solid #000', boxShadow: '4px 4px 0px #000'
              }}>
                <Icon icon={config.isVictory ? "ph:trophy-bold" : "ph:x-circle-bold"} width="20" height="20" />
                {config.isVictory ? 'VICTOIRE' : 'DÉFAITE'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isBanner ? 20 : 12, width: '100%' }}>
                {/* Home */}
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ fontSize: isStory ? 22 : isBanner ? 18 : 20, fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>
                    {config.teamHome}
                  </div>
                  <div style={{
                    fontSize: isStory ? 76 : isBanner ? 54 : 68, fontWeight: 900,
                    lineHeight: 0.9, color: config.isVictory ? '#10B981' : '#FFF',
                    textShadow: '3px 3px 0px #000'
                  }}>
                    {config.score1}
                  </div>
                </div>

                <div style={{ fontSize: 24, opacity: 0.5, fontWeight: 900 }}>VS</div>

                {/* Away */}
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ fontSize: isStory ? 22 : isBanner ? 18 : 20, fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>
                    {config.teamAway}
                  </div>
                  <div style={{
                    fontSize: isStory ? 76 : isBanner ? 54 : 68, fontWeight: 900,
                    lineHeight: 0.9, textShadow: '3px 3px 0px #000'
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: isStory ? 18 : 13, letterSpacing: 4, textTransform: 'uppercase', color: '#F59E0B', marginBottom: 10, fontWeight: 900 }}>
                <Icon icon="ph:swords-bold" width="18" height="18" />
                GAME DAY / JOUR DE MATCH
              </div>

              <div style={{
                fontSize: isStory ? 38 : isBanner ? 26 : 32, fontWeight: 900,
                textTransform: 'uppercase', lineHeight: 1.1, textShadow: '4px 4px 0px #000'
              }}>
                {config.teamHome} <span style={{ color: '#168E56' }}>VS</span> {config.teamAway}
              </div>

              <div style={{
                marginTop: 18, background: 'rgba(0,0,0,0.65)', padding: '12px 20px', borderRadius: 8,
                border: '2px solid #FFF', boxShadow: '4px 4px 0px #000', display: 'inline-block'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: 6, fontSize: 13, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                  <Icon icon="ph:calendar-blank-bold" width="16" height="16" color="#F59E0B" />
                  {config.date ? new Date(config.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Ce week-end'}
                  {config.time ? ` à ${config.time}` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: 6, fontSize: 11, opacity: 0.85, marginTop: 4, fontFamily: "'Inter', sans-serif" }}>
                  <Icon icon="ph:map-pin-bold" width="14" height="14" color="#10B981" />
                  {config.lieu}
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE 3: PLAYER MVP WITH REAL PHOTO */}
          {selectedTemplate.id === 'player_mvp' && (
            <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: '#F59E0B', fontWeight: 900, marginBottom: 10 }}>
                <Icon icon="ph:star-bold" width="16" height="16" />
                MVP DU MATCH
              </div>

              {/* Player Real Photo Card */}
              <div style={{
                width: isStory ? 130 : 100, height: isStory ? 130 : 100, borderRadius: 16,
                border: '3px solid #FFF', overflow: 'hidden', boxShadow: '6px 6px 0px #000',
                background: '#161921', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12, filter: photoFilter === 'duotone' ? 'grayscale(100%) contrast(120%)' : 'none'
              }}>
                {selectedMember && selectedMember.photo ? (
                  <img src={selectedMember.photo} alt={selectedMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#168E56' }}>
                    {selectedMember ? getInitials(selectedMember.name) : 'BCSN'}
                  </div>
                )}
              </div>

              <div style={{ fontSize: isStory ? 26 : 20, fontWeight: 900, textTransform: 'uppercase', textShadow: '2px 2px 0px #000' }}>
                {selectedMember ? selectedMember.name : 'Nom du Joueur'}
              </div>

              {/* Stats Streetwear Badges */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <div style={{ background: '#000', padding: '6px 12px', borderRadius: 6, border: '1px solid #FFF', boxShadow: '3px 3px 0px #168E56' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B' }}>{config.playerPoints}</div>
                  <div style={{ fontSize: 9, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>POINTS</div>
                </div>
                <div style={{ background: '#000', padding: '6px 12px', borderRadius: 6, border: '1px solid #FFF', boxShadow: '3px 3px 0px #168E56' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B' }}>{config.playerRebounds}</div>
                  <div style={{ fontSize: 9, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>REBONDS</div>
                </div>
                <div style={{ background: '#000', padding: '6px 12px', borderRadius: 6, border: '1px solid #FFF', boxShadow: '3px 3px 0px #168E56' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B' }}>{config.playerAssists}</div>
                  <div style={{ fontSize: 9, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>PASSES</div>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE 4: WEEKEND PROGRAM */}
          {selectedTemplate.id === 'weekend_program' && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#F59E0B', marginBottom: 12, fontWeight: 900 }}>
                <Icon icon="ph:calendar-blank-bold" width="16" height="16" />
                PROGRAMME DU WEEK-END
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360, margin: '0 auto' }}>
                {teams.slice(0, 3).map((t) => (
                  <div key={t.id} style={{
                    background: 'rgba(0,0,0,0.65)', padding: '8px 14px', borderRadius: 6,
                    border: '1px solid #FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12
                  }}>
                    <span style={{ fontWeight: 800 }}>{t.name}</span>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>VS ADV</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEMPLATE 5: ANNOUNCEMENT */}
          {selectedTemplate.id === 'announcement' && (
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
              <div style={{ fontSize: isStory ? 32 : 24, fontWeight: 900, textTransform: 'uppercase', color: '#F59E0B', marginBottom: 10, textShadow: '3px 3px 0px #000' }}>
                {config.customTitle || 'COMMUNIQUÉ DU CLUB'}
              </div>
              <div style={{ fontSize: 12, opacity: 0.95, lineHeight: 1.5, maxWidth: 380, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
                {config.customSubtitle}
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Hashtag */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 2, borderTop: '2px solid rgba(255,255,255,0.25)',
          paddingTop: 8, fontSize: 10, fontFamily: "'Inter', sans-serif", opacity: 0.9
        }}>
          <div>#BCSN #STREETWEAR</div>
          <div>BASKET CLUB SAÔNE NIVERNAIS</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Template Chooser Bar */}
      <div className="card mb-16">
        <h3 className="card-title mb-16" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon icon="ph:palette-bold" width="20" height="20" color="var(--primary-light)" />
          Choisir un Template Studio
        </h3>
        <div className="template-grid">
          {TEMPLATES.map(t => {
            const isSelected = selectedTemplate.id === t.id;
            return (
              <div 
                key={t.id} 
                className={`template-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(t)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Icon icon={t.icon} width="20" height="20" color={isSelected ? 'var(--primary-light)' : 'var(--text-muted)'} />
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
          <h3 className="card-title mb-16" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon icon="ph:sliders-horizontal-bold" width="20" height="20" color="var(--primary-light)" />
            Style Streetwear & Rétro
          </h3>

          {/* Formats Selector */}
          <div className="input-group mb-16">
            <label className="input-label">Format d'export</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  className={`btn btn-sm ${selectedFormat.id === f.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedFormat(f)}
                  style={{ flex: 1, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Icon icon={f.icon} width="16" height="16" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fonts Selector */}
          <div className="input-group mb-16">
            <label className="input-label">Typographie Rétro / Streetwear</label>
            <select className="input select" value={selectedFont.id} onChange={e => setSelectedFont(FONTS.find(f => f.id === e.target.value))}>
              {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          {/* Background Textures Selector */}
          <div className="input-group mb-16">
            <label className="input-label">Photo de Fond / Texture (Médiathèque)</label>
            <select className="input select" value={selectedBgUrl} onChange={e => setSelectedBgUrl(e.target.value)}>
              <optgroup label="Textures Système Authentiques">
                {BUILTIN_TEXTURES.map(t => <option key={t.id} value={t.url}>{t.name}</option>)}
              </optgroup>
              {customBackgrounds.length > 0 && (
                <optgroup label="Fonds Importés (Médiathèque)">
                  {customBackgrounds.map(a => <option key={a.id} value={a.url}>{a.name}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          {/* Grain & Filter Toggles */}
          <div className="input-group mb-16">
            <label className="input-label">Effets d'Usure & Filtre Photo</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={grainOverlay} onChange={e => setGrainOverlay(e.target.checked)} />
                Effet Grain Sérigraphie
              </label>
              <select className="input select" value={photoFilter} onChange={e => setPhotoFilter(e.target.value)} style={{ flex: 1, fontSize: 12 }}>
                <option value="none">Couleur Naturelle</option>
                <option value="duotone">Noir & Blanc Élastique</option>
              </select>
            </div>
          </div>

          {/* Fields by Template */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div className="input-group">
              <label className="input-label">Équipe BCSN</label>
              <select className="input select" value={config.category} onChange={e => setConfig({...config, category: e.target.value})}>
                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                <option value="Toutes les équipes">Toutes les équipes</option>
              </select>
            </div>

            {selectedTemplate.id === 'result' && (
              <>
                <div className="grid-2">
                  <div className="input-group">
                    <label className="input-label">Club Domicile</label>
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
                    <label className="input-label">Score Ext.</label>
                    <input className="input" type="number" value={config.score2} onChange={e => setConfig({...config, score2: e.target.value})} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Résultat</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className={`btn btn-sm ${config.isVictory ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setConfig({...config, isVictory: true})}>
                      <Icon icon="ph:trophy-bold" width="14" height="14" /> Victoire
                    </button>
                    <button className={`btn btn-sm ${!config.isVictory ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setConfig({...config, isVictory: false})}>
                      <Icon icon="ph:x-circle-bold" width="14" height="14" /> Défaite
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
                  <label className="input-label">Sélectionner le Joueur / Coach (Photos Formulaire)</label>
                  <select className="input select" value={config.selectedMemberId} onChange={e => setConfig({...config, selectedMemberId: e.target.value})}>
                    <option value="">-- Choisir dans la Médiathèque BDD --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.team || m.role || 'Membre'}) {m.photo ? '📸' : ''}</option>
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

          {/* Automatic Caption Generator */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="input-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon icon="ph:instagram-logo-bold" width="16" height="16" color="#E1306C" />
                Légende Instagram / Facebook
              </label>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyCaption}>
                {copiedCaption ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                {copiedCaption ? 'Copié !' : 'Copier le texte'}
              </button>
            </div>
            <textarea
              className="input textarea"
              value={generateCaption()}
              readOnly
              rows={4}
              style={{ fontSize: 12, fontFamily: 'monospace', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        {/* Right Side: Visual Preview Canvas */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon icon="ph:eye-bold" width="20" height="20" color="var(--primary-light)" />
              Aperçu Rétro Streetwear
            </h3>
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
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            border: '2px solid #2A2D3A'
          }} ref={canvasRef}>
            {renderVisualContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
