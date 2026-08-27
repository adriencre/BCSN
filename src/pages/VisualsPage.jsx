import React, { useState, useRef } from 'react';
import { 
  Download, Type, Palette, Image as ImageIcon, RefreshCw, 
  Sparkles, Trophy, Calendar, Users, Share2, Copy, Check, Sliders, Layers, 
  Swords, Megaphone, Plus, Trash2, Zap, LayoutGrid, Paintbrush, ArrowUpRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { getInitials } from '../hooks/useLocalStorage';

// Available templates
const TEMPLATES = [
  { id: 'result', name: 'Résultat de Match', icon: 'ph:trophy-bold', desc: 'Score final, victoires & détails' },
  { id: 'match_day', name: 'Jour de Match', icon: 'ph:swords-bold', desc: 'Affiche de rencontre, lieu & heure' },
  { id: 'player_mvp', name: 'MVP / Carte Joueur', icon: 'ph:star-bold', desc: 'Mise en avant joueur & photo réelle' },
  { id: 'weekend_program', name: 'Programme Week-End', icon: 'ph:calendar-blank-bold', desc: 'Planning N matchs avec découpage auto' },
  { id: 'announcement', name: 'Flash Info / Annonce', icon: 'ph:megaphone-bold', desc: 'Communiqué officiel du BCSN' },
];

// Formats
const FORMATS = [
  { id: 'story', label: 'Story (9:16)', icon: 'ph:device-mobile-camera-bold', ratio: '9 / 16', width: 360, height: 640 },
  { id: 'post', label: 'Post Carré (1:1)', icon: 'ph:square-bold', ratio: '1 / 1', width: 450, height: 450 },
  { id: 'banner', label: 'Bannière (16:9)', icon: 'ph:desktop-bold', ratio: '16 / 9', width: 500, height: 281 },
];

// Layout Styles
const LAYOUT_STYLES = [
  { id: 'streetwear', name: 'Streetwear Bold (Pavés Heavy)', icon: 'ph:layout-bold' },
  { id: 'cyber', name: 'Cyber Neon (Contours Fluo)', icon: 'ph:lightning-bold' },
  { id: 'college', name: 'Heritage College (Split Rétro)', icon: 'ph:student-bold' },
  { id: 'editorial', name: 'Editorial Magazine (Titre XL)', icon: 'ph:newspaper-bold' },
  { id: 'ticket', name: 'Ticket Pass Match (Vintage)', icon: 'ph:ticket-bold' },
];

// Fonts
const FONTS = [
  { id: 'Graduate', name: 'College Jersey (Graduate)', fontFamily: "'Graduate', serif" },
  { id: 'Alfa Slab One', name: 'Heavy Vintage (Alfa Slab)', fontFamily: "'Alfa Slab One', cursive" },
  { id: 'Bebas Neue', name: 'Streetwear Bold (Bebas Neue)', fontFamily: "'Bebas Neue', sans-serif" },
  { id: 'Outfit', name: 'Modern Sport (Outfit)', fontFamily: "'Outfit', sans-serif" },
];

// Builtin Textures
const BUILTIN_TEXTURES = [
  { id: 'wood', name: 'Parquet Bois Rétro', url: '/artifacts/bcsn_wood_court_texture_1787834010959.png' },
  { id: 'leather', name: 'Cuir Ballon de Basket', url: '/artifacts/bcsn_leather_ball_texture_1787834023930.png' },
  { id: 'arena', name: 'Arena Sports Neon', url: '/artifacts/bcsn_dark_sports_bg_1787833109383.png' },
  { id: 'victory', name: 'Or & Confettis Victoire', url: '/artifacts/bcsn_victory_gold_bg_1787833122029.png' },
];

// Color Palettes
const COLOR_PRESETS = [
  { id: 'green', name: 'Vert BCSN', accent: '#168E56', secondary: '#10B981' },
  { id: 'gold', name: 'Or Victoire', accent: '#F59E0B', secondary: '#D97706' },
  { id: 'crimson', name: 'Rouge Match', accent: '#EF4444', secondary: '#DC2626' },
  { id: 'cyber_blue', name: 'Bleu Electric', accent: '#3B82F6', secondary: '#2563EB' },
  { id: 'purple_street', name: 'Violet Neon', accent: '#8B5CF6', secondary: '#7C3AED' },
  { id: 'pink_hot', name: 'Rose Street', accent: '#EC4899', secondary: '#DB2777' },
];

export function VisualsPage({ teams = [], members = [], events = [], customAssets = [] }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[1]);
  const [selectedLayout, setSelectedLayout] = useState(LAYOUT_STYLES[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedBgUrl, setSelectedBgUrl] = useState(BUILTIN_TEXTURES[0].url);
  const [accentColor, setAccentColor] = useState('#168E56');
  const [homeColor, setHomeColor] = useState('#10B981'); // Distinct Home Color
  const [awayColor, setAwayColor] = useState('#F59E0B'); // Distinct Away Color
  const [grainOverlay, setGrainOverlay] = useState(true);
  const [photoFilter, setPhotoFilter] = useState('none');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [programPage, setProgramPage] = useState(0); // Pagination for multi-post program

  // Full customizable configuration
  const [config, setConfig] = useState({
    headerTitle: 'BCSN BASKET',
    headerSubtitle: 'EST. 1978 · SAÔNE & NIVERNAIS',
    footerLeft: '#BCSN #STREETWEAR',
    footerRight: 'BASKET CLUB SAÔNE NIVERNAIS',
    
    // Result template
    teamHome: 'BCSN',
    teamAway: 'US COSNE',
    score1: '78',
    score2: '64',
    isVictory: true,
    category: 'SÉNIORS GARÇONS 1',
    quarterDetails: 'Q1: 18-12 | Q2: 22-16 | Q3: 15-20 | Q4: 23-16',

    // Match day template
    date: new Date().toISOString().split('T')[0],
    time: '20:30',
    lieu: 'Gymnase Municipal de la Saône',
    competition: 'CHAMPIONNAT RÉGIONAL',

    // MVP template
    selectedMemberId: '',
    playerNumber: '10',
    playerPosition: 'MENEUR',
    stat1Label: 'POINTS',
    stat1Value: '24',
    stat2Label: 'REBONDS',
    stat2Value: '8',
    stat3Label: 'PASSES',
    stat3Value: '5',
    stat4Label: 'EVAL',
    stat4Value: '+28',

    // Weekend program template (Dynamic List of N Matches)
    programTitle: 'PROGRAMME DU WEEK-END',
    programSubtitle: 'SAMEDI 28 & DIMANCHE 29',
    weekendMatches: [
      { id: 'm1', category: 'U13 GARÇONS', home: 'BCSN', away: 'NEVERS BASKET', date: 'SAM. 14:00', lieu: 'DOMICILE', tag: 'DÉPARTEMENTAL' },
      { id: 'm2', category: 'U15 FÉMININES', home: 'BCSN', away: 'CHARITOISE', date: 'SAM. 16:30', lieu: 'DOMICILE', tag: 'RÉGIONAL' },
      { id: 'm3', category: 'SÉNIORS 1', home: 'US COSNE', away: 'BCSN', date: 'DIM. 15:30', lieu: 'EXTÉRIEUR', tag: 'CHAMPIONNAT' },
      { id: 'm4', category: 'U18 GARÇONS', home: 'BCSN', away: 'DECIZE', date: 'DIM. 13:00', lieu: 'DOMICILE', tag: 'DÉPARTEMENTAL' },
      { id: 'm5', category: 'SÉNIORS 2', home: 'VAUZELLES', away: 'BCSN', date: 'DIM. 17:00', lieu: 'EXTÉRIEUR', tag: 'CHAMPIONNAT' },
    ],

    // Announcement template
    customTitle: 'VICTOIRE DU BCSN !',
    customSubtitle: 'Une prestation XXL de nos séniors devant notre public déchaîné ! Merci à tous nos bénévoles et supporters !',
  });

  const canvasRef = useRef(null);
  const customBackgrounds = customAssets.filter(a => a.type === 'background');
  const selectedMember = members.find(m => m.id === config.selectedMemberId);

  // Match pagination logic (3 or 4 matches per post depending on format)
  const matchesPerPage = selectedFormat.id === 'banner' ? 3 : 4;
  const totalProgramPages = Math.ceil(config.weekendMatches.length / matchesPerPage) || 1;
  const safeProgramPage = Math.min(programPage, totalProgramPages - 1);
  const visibleProgramMatches = config.weekendMatches.slice(
    safeProgramPage * matchesPerPage, 
    (safeProgramPage + 1) * matchesPerPage
  );

  // Dynamic match add/remove/edit for Weekend Program
  const handleAddMatch = () => {
    const newM = {
      id: `m-${Date.now()}`,
      category: 'NOUVELLE ÉQUIPE',
      home: 'BCSN',
      away: 'ADVERSAIRE',
      date: 'SAM. 15:00',
      lieu: 'DOMICILE',
      tag: 'MATCH'
    };
    setConfig(prev => ({ ...prev, weekendMatches: [...prev.weekendMatches, newM] }));
  };

  const handleRemoveMatch = (id) => {
    setConfig(prev => ({ ...prev, weekendMatches: prev.weekendMatches.filter(m => m.id !== id) }));
  };

  const handleUpdateMatch = (id, field, val) => {
    setConfig(prev => ({
      ...prev,
      weekendMatches: prev.weekendMatches.map(m => m.id === id ? { ...m, [field]: val } : m)
    }));
  };

  // Import matches automatically from Calendar events
  const handleImportCalendarEvents = () => {
    if (!events || events.length === 0) {
      alert('Aucun événement enregistré dans le calendrier pour le moment.');
      return;
    }
    const imported = events.map((ev, i) => ({
      id: `m-imp-${i}`,
      category: ev.category || 'MATCH BCSN',
      home: 'BCSN',
      away: ev.title || 'ADVERSAIRE',
      date: ev.date ? `${new Date(ev.date).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()} ${ev.time || ''}` : 'CE WEEK-END',
      lieu: ev.lieu ? ev.lieu.toUpperCase() : 'DOMICILE',
      tag: ev.type ? ev.type.toUpperCase() : 'CHAMPIONNAT'
    }));
    setConfig(prev => ({ ...prev, weekendMatches: imported }));
    setProgramPage(0);
  };

  // Export PNG function
  const exportSingleCanvas = async (fileName) => {
    const node = canvasRef.current;
    if (!node) return;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(node, { backgroundColor: null, scale: 3, useCORS: true });
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownload = async () => {
    if (selectedTemplate.id === 'weekend_program' && totalProgramPages > 1) {
      const pName = `bcsn-programme-partie-${safeProgramPage + 1}-${Date.now()}.png`;
      await exportSingleCanvas(pName);
    } else {
      await exportSingleCanvas(`bcsn-post-${selectedTemplate.id}-${Date.now()}.png`);
    }
  };

  // Download all pages sequentially for multi-post program
  const handleDownloadAllPages = async () => {
    for (let p = 0; p < totalProgramPages; p++) {
      setProgramPage(p);
      // Wait for React DOM update
      await new Promise(r => setTimeout(r, 400));
      await exportSingleCanvas(`bcsn-programme-partie-${p + 1}-sur-${totalProgramPages}.png`);
    }
  };

  // Generate Clean Instagram Caption
  const generateCaption = () => {
    const hashtag = "#BCSN #BasketClubSaoneNivernais #Basketball #StreetwearBasket #FFBB";
    switch (selectedTemplate.id) {
      case 'result':
        return `${config.isVictory ? 'VICTOIRE !' : 'FIN DU MATCH'}\n\n` +
          `${config.category || 'BCSN'} vs ${config.teamAway}\n` +
          `Score Final : ${config.teamHome} ${config.score1} - ${config.score2} ${config.teamAway}\n` +
          `${config.quarterDetails ? `${config.quarterDetails}\n` : ''}\n` +
          `${config.customSubtitle}\n\n${hashtag}`;

      case 'match_day':
        return `JOUR DE MATCH !\n\n` +
          `${config.category} accueille ${config.teamAway}\n` +
          `Date : ${config.date ? new Date(config.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Ce week-end'}\n` +
          `Coup d'envoi à ${config.time}\n` +
          `Lieu : ${config.lieu}\n` +
          `Compétition : ${config.competition}\n\n` +
          `Venez pousser les vert et blanc !\n\n${hashtag}`;

      case 'player_mvp':
        return `MVP DU MATCH !\n\n` +
          `Excellente performance de ${selectedMember ? selectedMember.name : 'notre joueur'} !\n` +
          `Stats du match :\n` +
          `• ${config.stat1Value} ${config.stat1Label}\n` +
          `• ${config.stat2Value} ${config.stat2Label}\n` +
          `• ${config.stat3Value} ${config.stat3Label}\n` +
          `• ${config.stat4Value} ${config.stat4Label}\n\n` +
          `Félicitations au MVP !\n\n${hashtag}`;

      case 'weekend_program':
        return `${config.programTitle}\n` +
          `${config.programSubtitle}\n\n` +
          config.weekendMatches.map(m => `• ${m.category} : ${m.home} vs ${m.away} (${m.date} - ${m.lieu})`).join('\n') +
          `\n\nVenez nombreux encourager toutes les équipes du BCSN !\n\n${hashtag}`;

      default:
        return `${config.customTitle}\n\n${config.customSubtitle}\n\n${hashtag}`;
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
    const isCyber = selectedLayout.id === 'cyber';
    const isCollege = selectedLayout.id === 'college';
    const isTicket = selectedLayout.id === 'ticket';

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
      padding: isStory ? '40px 24px' : isBanner ? '18px 24px' : '24px',
      boxSizing: 'border-box',
    };

    return (
      <div style={visualStyle}>
        {/* Dark Vignette Layer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isCollege ? 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%)' :
                      isCyber ? 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.92) 100%)' :
                      'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Cyber Neon Borders if selected */}
        {isCyber && (
          <div style={{
            position: 'absolute', inset: 12, border: `2px solid ${accentColor}`,
            borderRadius: 12, pointerEvents: 'none', boxShadow: `0 0 15px ${accentColor}88`
          }} />
        )}

        {/* Vintage Halftone Grain Layer (Only if grainOverlay is true!) */}
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
          position: 'relative', zIndex: 2, borderBottom: `2px solid ${isCyber ? accentColor : 'rgba(255,255,255,0.25)'}`,
          paddingBottom: 8, gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: accentColor,
              border: '2px solid #FFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', flexShrink: 0
            }}>
              <Icon icon="ph:basketball-bold" width="20" height="20" color="#FFF" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: selectedFont.fontFamily, whiteSpace: 'nowrap' }}>
                {config.headerTitle || 'BCSN BASKET'}
              </div>
              <div style={{ fontSize: 8.5, opacity: 0.85, letterSpacing: 1, fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
                {config.headerSubtitle || 'EST. 1978 · SAÔNE & NIVERNAIS'}
              </div>
            </div>
          </div>
          
          {/* Top Right Category / Multi-post Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {selectedTemplate.id === 'weekend_program' && totalProgramPages > 1 && (
              <div style={{
                fontSize: 9, fontWeight: 900, padding: '4px 8px', borderRadius: 4,
                background: '#000', color: '#FFF', border: '1px solid #FFF',
                textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: '2px 2px 0px #000'
              }}>
                PARTIE {safeProgramPage + 1}/{totalProgramPages}
              </div>
            )}
            <div style={{
              fontSize: (config.category || '').length > 15 ? 8.5 : 10,
              fontWeight: 900, padding: '4px 10px', borderRadius: isTicket ? 0 : 4,
              background: accentColor, color: '#FFF', border: '1px solid #FFF',
              textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: '3px 3px 0px #000',
              whiteSpace: 'nowrap'
            }}>
              {config.category || 'SENIORS'}
            </div>
          </div>
        </div>

        {/* Center Main Content */}
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '10px 0' }}>
          
          {/* TEMPLATE 1: RESULTAT */}
          {selectedTemplate.id === 'result' && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: isStory ? 18 : 14, letterSpacing: 3, textTransform: 'uppercase',
                fontWeight: 900, background: config.isVictory ? accentColor : '#EF4444',
                color: '#FFF', padding: '6px 18px', borderRadius: isTicket ? 0 : 6, marginBottom: 14,
                border: '2px solid #000', boxShadow: '4px 4px 0px #000'
              }}>
                <Icon icon={config.isVictory ? "ph:trophy-bold" : "ph:x-circle-bold"} width="18" height="18" />
                {config.isVictory ? 'VICTOIRE' : 'DÉFAITE'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isBanner ? 18 : 10, width: '100%' }}>
                {/* Home */}
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 10, border: `1px solid ${accentColor}` }}>
                  <div style={{ fontSize: isStory ? 20 : isBanner ? 16 : 18, fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>
                    {config.teamHome}
                  </div>
                  <div style={{
                    fontSize: isStory ? 70 : isBanner ? 48 : 62, fontWeight: 900,
                    lineHeight: 0.9, color: config.isVictory ? accentColor : '#FFF',
                    textShadow: '3px 3px 0px #000'
                  }}>
                    {config.score1}
                  </div>
                </div>

                <div style={{ fontSize: 22, opacity: 0.6, fontWeight: 900 }}>VS</div>

                {/* Away */}
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: isStory ? 20 : isBanner ? 16 : 18, fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>
                    {config.teamAway}
                  </div>
                  <div style={{
                    fontSize: isStory ? 70 : isBanner ? 48 : 62, fontWeight: 900,
                    lineHeight: 0.9, textShadow: '3px 3px 0px #000'
                  }}>
                    {config.score2}
                  </div>
                </div>
              </div>

              {config.quarterDetails && (
                <div style={{ fontSize: 10, opacity: 0.85, marginTop: 10, fontFamily: "'Inter', sans-serif", letterSpacing: 0.5 }}>
                  {config.quarterDetails}
                </div>
              )}
            </div>
          )}

          {/* TEMPLATE 2: MATCH DAY */}
          {selectedTemplate.id === 'match_day' && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: isStory ? 16 : 12, letterSpacing: 3, textTransform: 'uppercase', color: accentColor, marginBottom: 8, fontWeight: 900 }}>
                <Icon icon="ph:swords-bold" width="16" height="16" />
                {config.competition || 'JOUR DE MATCH'}
              </div>

              <div style={{
                fontSize: isStory ? 36 : isBanner ? 24 : 30, fontWeight: 900,
                textTransform: 'uppercase', lineHeight: 1.1, textShadow: '4px 4px 0px #000'
              }}>
                {config.teamHome} <span style={{ color: accentColor }}>VS</span> {config.teamAway}
              </div>

              <div style={{
                marginTop: 14, background: 'rgba(0,0,0,0.7)', padding: '10px 18px', borderRadius: isTicket ? 0 : 8,
                border: `2px solid ${accentColor}`, boxShadow: '4px 4px 0px #000', display: 'inline-block'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
                  <Icon icon="ph:calendar-blank-bold" width="15" height="15" color={accentColor} />
                  {config.date ? new Date(config.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Ce week-end'}
                  {config.time ? ` à ${config.time}` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10.5, opacity: 0.9, marginTop: 4, fontFamily: "'Inter', sans-serif" }}>
                  <Icon icon="ph:map-pin-bold" width="13" height="13" color={accentColor} />
                  {config.lieu}
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE 3: PLAYER MVP */}
          {selectedTemplate.id === 'player_mvp' && (
            <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: accentColor, fontWeight: 900, marginBottom: 8 }}>
                <Icon icon="ph:star-bold" width="15" height="15" />
                MVP DU MATCH
              </div>

              {/* Player Photo */}
              <div style={{
                width: isStory ? 120 : 90, height: isStory ? 120 : 90, borderRadius: isTicket ? 0 : 14,
                border: `3px solid ${accentColor}`, overflow: 'hidden', boxShadow: '5px 5px 0px #000',
                background: '#161921', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, filter: photoFilter === 'duotone' ? 'grayscale(100%) contrast(120%)' : 'none'
              }}>
                {selectedMember && selectedMember.photo ? (
                  <img src={selectedMember.photo} alt={selectedMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: 26, fontWeight: 900, color: accentColor }}>
                    {selectedMember ? getInitials(selectedMember.name) : 'BCSN'}
                  </div>
                )}
              </div>

              <div style={{ fontSize: isStory ? 24 : 18, fontWeight: 900, textTransform: 'uppercase', textShadow: '2px 2px 0px #000' }}>
                {selectedMember ? selectedMember.name : 'Nom du Joueur'}
                <span style={{ fontSize: 14, color: accentColor, marginLeft: 6 }}>#{config.playerNumber}</span>
              </div>
              <div style={{ fontSize: 10, opacity: 0.8, fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>{config.playerPosition}</div>

              {/* 4 Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 10, width: '100%', maxWidth: 360 }}>
                <div style={{ background: '#000', padding: '4px 6px', borderRadius: 4, border: '1px solid #FFF', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: accentColor }}>{config.stat1Value}</div>
                  <div style={{ fontSize: 8, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>{config.stat1Label}</div>
                </div>
                <div style={{ background: '#000', padding: '4px 6px', borderRadius: 4, border: '1px solid #FFF', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: accentColor }}>{config.stat2Value}</div>
                  <div style={{ fontSize: 8, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>{config.stat2Label}</div>
                </div>
                <div style={{ background: '#000', padding: '4px 6px', borderRadius: 4, border: '1px solid #FFF', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: accentColor }}>{config.stat3Value}</div>
                  <div style={{ fontSize: 8, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>{config.stat3Label}</div>
                </div>
                <div style={{ background: '#000', padding: '4px 6px', borderRadius: 4, border: '1px solid #FFF', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: accentColor }}>{config.stat4Value}</div>
                  <div style={{ fontSize: 8, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>{config.stat4Label}</div>
                </div>
              </div>
            </div>
          )}

          {/* TEMPLATE 4: DYNAMIC WEEKEND PROGRAM (WITH HOME/AWAY DISTINCT COLORS) */}
          {selectedTemplate.id === 'weekend_program' && (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: isStory ? 18 : 13, letterSpacing: 2, textTransform: 'uppercase', color: accentColor, marginBottom: 2, fontWeight: 900 }}>
                {config.programTitle}
              </div>
              <div style={{ fontSize: 9.5, opacity: 0.85, fontFamily: "'Inter', sans-serif", marginBottom: 8, letterSpacing: 1 }}>
                {config.programSubtitle}
              </div>

              {/* Dynamic Matches List for Current Page */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                {visibleProgramMatches.map((m) => {
                  const isHome = (m.lieu || '').toUpperCase().includes('DOM');
                  const matchColor = isHome ? homeColor : awayColor;
                  return (
                    <div key={m.id} style={{
                      background: 'rgba(0,0,0,0.72)', padding: '7px 12px', borderRadius: isTicket ? 0 : 6,
                      borderLeft: `5px solid ${matchColor}`, border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11
                    }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 900, fontSize: 10.5, color: matchColor, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{m.category}</span>
                          <span style={{
                            fontSize: 7.5, padding: '1px 5px', borderRadius: 3, background: matchColor, color: '#FFF', fontWeight: 800
                          }}>
                            {isHome ? 'DOMICILE' : 'EXTÉRIEUR'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 12, marginTop: 1 }}>
                          {m.home} <span style={{ opacity: 0.6 }}>vs</span> {m.away}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{m.date}</div>
                        <div style={{ fontSize: 8.5, opacity: 0.8, fontFamily: "'Inter', sans-serif" }}>{m.lieu}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEMPLATE 5: ANNOUNCEMENT */}
          {selectedTemplate.id === 'announcement' && (
            <div style={{ textAlign: 'center', padding: '0 12px' }}>
              <div style={{ fontSize: isStory ? 28 : 22, fontWeight: 900, textTransform: 'uppercase', color: accentColor, marginBottom: 8, textShadow: '3px 3px 0px #000' }}>
                {config.customTitle || 'COMMUNIQUÉ DU CLUB'}
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.95, lineHeight: 1.5, maxWidth: 380, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
                {config.customSubtitle}
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Hashtag */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', zIndex: 2, borderTop: `2px solid ${isCyber ? accentColor : 'rgba(255,255,255,0.25)'}`,
          paddingTop: 6, fontSize: 9.5, fontFamily: "'Inter', sans-serif", opacity: 0.9
        }}>
          <div>{config.footerLeft || '#BCSN #STREETWEAR'}</div>
          <div>{config.footerRight || 'BASKET CLUB SAÔNE NIVERNAIS'}</div>
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
          Choisir un Template Visuel
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
        {/* Left Side: Full Customization Panel */}
        <div className="card">
          <h3 className="card-title mb-16" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon icon="ph:sliders-horizontal-bold" width="20" height="20" color="var(--primary-light)" />
            Personnalisation Totale
          </h3>

          {/* Grain Toggle Checkbox */}
          <div className="input-group mb-16" style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', cursor: 'pointer', margin: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon icon="ph:sparkle-bold" width="16" height="16" color="var(--primary-light)" />
                Effet Grain Sérigraphie (Papier Rétro Usé)
              </span>
              <input 
                type="checkbox" 
                checked={grainOverlay} 
                onChange={e => setGrainOverlay(e.target.checked)} 
                style={{ width: 20, height: 20, accentColor: '#168E56', cursor: 'pointer' }} 
              />
            </label>
          </div>

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

          {/* Layout Variant Selector */}
          <div className="input-group mb-16">
            <label className="input-label">Disposition / Style de Layout</label>
            <select className="input select" value={selectedLayout.id} onChange={e => setSelectedLayout(LAYOUT_STYLES.find(l => l.id === e.target.value))}>
              {LAYOUT_STYLES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {/* Color Accent Picker */}
          <div className="input-group mb-16">
            <label className="input-label">Couleur d'Accent Principale</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.accent)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: c.accent,
                    border: accentColor === c.accent ? '3px solid #FFF' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                  }}
                  title={c.name}
                />
              ))}
              <input 
                type="color" 
                value={accentColor} 
                onChange={e => setAccentColor(e.target.value)} 
                style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer' }} 
                title="Couleur Personnalisée (HEX)"
              />
            </div>
          </div>

          {/* Distinct Home & Away Match Colors */}
          <div className="input-group mb-16">
            <label className="input-label">Couleurs Distinctes Matchs (Domicile vs Extérieur)</label>
            <div className="grid-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <input type="color" value={homeColor} onChange={e => setHomeColor(e.target.value)} style={{ width: 26, height: 26, border: 'none', cursor: 'pointer' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: homeColor }}>Domicile</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <input type="color" value={awayColor} onChange={e => setAwayColor(e.target.value)} style={{ width: 26, height: 26, border: 'none', cursor: 'pointer' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: awayColor }}>Extérieur</span>
              </div>
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

          {/* CUSTOMIZABLE HEADERS & FOOTERS TEXTS */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-light)' }}>
              <Icon icon="ph:text-t-bold" width="16" height="16" />
              Textes d'Entête & Pied de Visuel
            </h4>
            
            <div className="grid-2 mb-12">
              <div className="input-group">
                <label className="input-label">Titre Haut Gauche</label>
                <input className="input" value={config.headerTitle} onChange={e => setConfig({...config, headerTitle: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Sous-Titre Haut Gauche</label>
                <input className="input" value={config.headerSubtitle} onChange={e => setConfig({...config, headerSubtitle: e.target.value})} />
              </div>
            </div>

            <div className="grid-2 mb-12">
              <div className="input-group">
                <label className="input-label">Tag Bas Gauche</label>
                <input className="input" value={config.footerLeft} onChange={e => setConfig({...config, footerLeft: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Texte Bas Droite</label>
                <input className="input" value={config.footerRight} onChange={e => setConfig({...config, footerRight: e.target.value})} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Équipe / Catégorie (Badge Haut Droite)</label>
              <input className="input" value={config.category} onChange={e => setConfig({...config, category: e.target.value})} placeholder="Ex: SÉNIORS GARÇONS 1" />
            </div>
          </div>

          {/* SPECIFIC FIELDS BY TEMPLATE */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            {selectedTemplate.id === 'result' && (
              <>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--primary-light)' }}>Édition Score & Résultat</h4>
                <div className="grid-2 mb-12">
                  <div className="input-group">
                    <label className="input-label">Club Domicile</label>
                    <input className="input" value={config.teamHome} onChange={e => setConfig({...config, teamHome: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Adversaire</label>
                    <input className="input" value={config.teamAway} onChange={e => setConfig({...config, teamAway: e.target.value})} />
                  </div>
                </div>

                <div className="grid-2 mb-12">
                  <div className="input-group">
                    <label className="input-label">Score Domicile</label>
                    <input className="input" type="number" value={config.score1} onChange={e => setConfig({...config, score1: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Score Extérieur</label>
                    <input className="input" type="number" value={config.score2} onChange={e => setConfig({...config, score2: e.target.value})} />
                  </div>
                </div>

                <div className="input-group mb-12">
                  <label className="input-label">Détails des Quarts-Temps (optionnel)</label>
                  <input className="input" value={config.quarterDetails} onChange={e => setConfig({...config, quarterDetails: e.target.value})} placeholder="Ex: Q1: 18-12 | Q2: 22-16..." />
                </div>

                <div className="input-group">
                  <label className="input-label">Statut Résultat</label>
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
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--primary-light)' }}>Édition Jour de Match</h4>
                <div className="input-group mb-12">
                  <label className="input-label">Compétition / Titre Choc</label>
                  <input className="input" value={config.competition} onChange={e => setConfig({...config, competition: e.target.value})} placeholder="Ex: CHAMPIONNAT RÉGIONAL" />
                </div>
                <div className="grid-2 mb-12">
                  <div className="input-group">
                    <label className="input-label">Équipe Domicile</label>
                    <input className="input" value={config.teamHome} onChange={e => setConfig({...config, teamHome: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Équipe Extérieure</label>
                    <input className="input" value={config.teamAway} onChange={e => setConfig({...config, teamAway: e.target.value})} />
                  </div>
                </div>
                <div className="grid-2 mb-12">
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
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--primary-light)' }}>Édition MVP / Joueur</h4>
                <div className="input-group mb-12">
                  <label className="input-label">Sélectionner le Joueur BDD (Photo automatique)</label>
                  <select className="input select" value={config.selectedMemberId} onChange={e => setConfig({...config, selectedMemberId: e.target.value})}>
                    <option value="">-- Choisir dans la Médiathèque BDD --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.team || m.role || 'Membre'})</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2 mb-12">
                  <div className="input-group">
                    <label className="input-label">Numéro de maillot</label>
                    <input className="input" value={config.playerNumber} onChange={e => setConfig({...config, playerNumber: e.target.value})} placeholder="Ex: 10" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Poste de jeu</label>
                    <input className="input" value={config.playerPosition} onChange={e => setConfig({...config, playerPosition: e.target.value})} placeholder="Ex: MENEUR" />
                  </div>
                </div>

                {/* 4 Custom Stats Edit */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  <div className="input-group">
                    <label className="input-label">Stat 1 (Label & Val)</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input className="input" style={{ width: '60%' }} value={config.stat1Label} onChange={e => setConfig({...config, stat1Label: e.target.value})} />
                      <input className="input" style={{ width: '40%' }} value={config.stat1Value} onChange={e => setConfig({...config, stat1Value: e.target.value})} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Stat 2 (Label & Val)</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input className="input" style={{ width: '60%' }} value={config.stat2Label} onChange={e => setConfig({...config, stat2Label: e.target.value})} />
                      <input className="input" style={{ width: '40%' }} value={config.stat2Value} onChange={e => setConfig({...config, stat2Value: e.target.value})} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Stat 3 (Label & Val)</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input className="input" style={{ width: '60%' }} value={config.stat3Label} onChange={e => setConfig({...config, stat3Label: e.target.value})} />
                      <input className="input" style={{ width: '40%' }} value={config.stat3Value} onChange={e => setConfig({...config, stat3Value: e.target.value})} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Stat 4 (Label & Val)</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input className="input" style={{ width: '60%' }} value={config.stat4Label} onChange={e => setConfig({...config, stat4Label: e.target.value})} />
                      <input className="input" style={{ width: '40%' }} value={config.stat4Value} onChange={e => setConfig({...config, stat4Value: e.target.value})} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* DYNAMIC WEEKEND PROGRAM MATCHES EDITOR */}
            {selectedTemplate.id === 'weekend_program' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', margin: 0 }}>Programme du Week-End (Liste N Matchs)</h4>
                  <button className="btn btn-secondary btn-sm" onClick={handleImportCalendarEvents} title="Importer les prochains matchs du calendrier BDD">
                    <Zap size={13} style={{ color: 'var(--warning)' }} /> Importer du Calendrier
                  </button>
                </div>

                <div className="grid-2 mb-12">
                  <div className="input-group">
                    <label className="input-label">Titre du Programme</label>
                    <input className="input" value={config.programTitle} onChange={e => setConfig({...config, programTitle: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Sous-Titre Date</label>
                    <input className="input" value={config.programSubtitle} onChange={e => setConfig({...config, programSubtitle: e.target.value})} />
                  </div>
                </div>

                {/* Match Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                  {config.weekendMatches.map((m, index) => (
                    <div key={m.id} style={{ background: 'var(--bg-card)', padding: 10, borderRadius: 8, border: '1px solid var(--border)', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-light)' }}>Match #{index + 1}</span>
                        {config.weekendMatches.length > 1 && (
                          <button onClick={() => handleRemoveMatch(m.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid-2 mb-8">
                        <input className="input" placeholder="Équipe / Catégorie (ex: U13 Garçons)" value={m.category} onChange={e => handleUpdateMatch(m.id, 'category', e.target.value)} />
                        <input className="input" placeholder="Adversaire (ex: Nevers Basket)" value={m.away} onChange={e => handleUpdateMatch(m.id, 'away', e.target.value)} />
                      </div>
                      <div className="grid-2">
                        <input className="input" placeholder="Date & Heure (ex: Samedi 14h00)" value={m.date} onChange={e => handleUpdateMatch(m.id, 'date', e.target.value)} />
                        <select className="input select" value={m.lieu} onChange={e => handleUpdateMatch(m.id, 'lieu', e.target.value)}>
                          <option value="DOMICILE">DOMICILE (Couleur Vert)</option>
                          <option value="EXTÉRIEUR">EXTÉRIEUR (Couleur Or)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-secondary btn-sm" onClick={handleAddMatch} style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={14} /> Ajouter un match au programme
                </button>
              </>
            )}

            {selectedTemplate.id === 'announcement' && (
              <>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--primary-light)' }}>Édition Flash Info / Communiqué</h4>
                <div className="input-group mb-12">
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

        {/* Right Side: Visual Preview Canvas & Multi-post Pagination */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Icon icon="ph:eye-bold" width="20" height="20" color="var(--primary-light)" />
              Aperçu Rétro Streetwear HD
            </h3>

            <div style={{ display: 'flex', gap: 8 }}>
              {selectedTemplate.id === 'weekend_program' && totalProgramPages > 1 && (
                <button className="btn btn-secondary" onClick={handleDownloadAllPages} style={{ fontSize: 12 }}>
                  <Download size={14} /> Exporter les {totalProgramPages} Parties
                </button>
              )}
              <button className="btn btn-primary" onClick={handleDownload}>
                <Download size={16} /> Exporter PNG
              </button>
            </div>
          </div>

          {/* Multi-post Navigation bar if totalProgramPages > 1 */}
          {selectedTemplate.id === 'weekend_program' && totalProgramPages > 1 && (
            <div className="mb-16" style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)',
              padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)'
            }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setProgramPage(prev => Math.max(0, prev - 1))}
                disabled={safeProgramPage === 0}
                style={{ padding: 4 }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-light)' }}>
                Partie {safeProgramPage + 1} sur {totalProgramPages} ({visibleProgramMatches.length} matchs)
              </span>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setProgramPage(prev => Math.min(totalProgramPages - 1, prev + 1))}
                disabled={safeProgramPage === totalProgramPages - 1}
                style={{ padding: 4 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

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
