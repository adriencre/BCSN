import React, { useState, useRef } from 'react';
import { 
  Download, Type, Palette, Image as ImageIcon, RefreshCw, 
  Sparkles, Trophy, Calendar, Users, Share2, Copy, Check, Sliders, Layers, 
  Swords, Megaphone, Plus, Trash2, Zap, LayoutGrid, Paintbrush, ArrowUpRight, ChevronLeft, ChevronRight,
  AlignLeft, AlignCenter, AlignRight, ImageOff, Shield, MapPin, Home
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { getInitials } from '../hooks/useLocalStorage';

// Available templates
const TEMPLATES = [
  { id: 'weekend_program', name: 'Programme Week-End (Officiel)', icon: 'ph:calendar-blank-bold', desc: 'Affiche officielle 2 colonnes Samedi/Dimanche' },
  { id: 'result', name: 'Résultat de Match', icon: 'ph:trophy-bold', desc: 'Score final, victoires & détails' },
  { id: 'match_day', name: 'Jour de Match', icon: 'ph:swords-bold', desc: 'Affiche de rencontre, lieu & heure' },
  { id: 'player_mvp', name: 'MVP / Carte Joueur', icon: 'ph:star-bold', desc: 'Mise en avant joueur & photo réelle' },
  { id: 'announcement', name: 'Flash Info / Annonce', icon: 'ph:megaphone-bold', desc: 'Communiqué officiel du BCSN' },
];

// Formats
const FORMATS = [
  { id: 'portrait', label: 'Affiche (4:5)', icon: 'ph:newspaper-bold', ratio: '4 / 5', width: 480, height: 600 },
  { id: 'story', label: 'Story (9:16)', icon: 'ph:device-mobile-camera-bold', ratio: '9 / 16', width: 380, height: 675 },
  { id: 'post', label: 'Post Carré (1:1)', icon: 'ph:square-bold', ratio: '1 / 1', width: 480, height: 480 },
  { id: 'banner', label: 'Bannière (16:9)', icon: 'ph:desktop-bold', ratio: '16 / 9', width: 520, height: 292 },
];

// Structural Layout Variants for other templates
const LAYOUT_STYLES = [
  { id: 'official_schedule', name: 'Affiche Officielle BCSN (Double Colonne)', desc: 'Design officiel clean blanc/vert/rouge avec filigranes & 2 colonnes' },
  { id: 'streetwear', name: 'Streetwear Centré (Pavés Heavy)', desc: 'Disposition centrée classique avec pavés contrastés' },
  { id: 'split_left_text', name: 'Split 50/50 : Texte à Gauche / Visual à Droite', desc: 'Texte & infos à gauche, visuel/score à droite' },
  { id: 'split_right_text', name: 'Split 50/50 : Visual à Gauche / Texte à Droite', desc: 'Visuel/score à gauche, informations à droite' },
  { id: 'no_image_clean', name: 'Minimalist Clean (Sans Photo)', desc: 'Design typographique épuré 100% texte sans image' },
  { id: 'cyber', name: 'Cyber Neon (Contours & Cadres Fluo)', desc: 'Cadres futuristes et bordures lumineuses' },
  { id: 'editorial', name: 'Editorial Magazine (Titre Géant Filigrane)', desc: 'Style magazine avec texte filigrane géant en fond' },
  { id: 'banner_top', name: 'Split Horizontal (Haut Visuel / Bas Infos)', desc: 'Visuel sur le tiers supérieur, pavé d\'infos en bas' },
  { id: 'ticket', name: 'Ticket Match Vintage (Pass Gymnase)', desc: 'Style billet de match perforé avec code-barres' },
];

// Fonts
const FONTS = [
  { id: 'Bebas Neue', name: 'Bebas Neue (Athletic Pro)', fontFamily: "'Bebas Neue', sans-serif" },
  { id: 'Outfit', name: 'Modern Sport (Outfit)', fontFamily: "'Outfit', sans-serif" },
  { id: 'Graduate', name: 'College Jersey (Graduate)', fontFamily: "'Graduate', serif" },
  { id: 'Alfa Slab One', name: 'Heavy Vintage (Alfa Slab)', fontFamily: "'Alfa Slab One', cursive" },
];

// Color Palettes
const COLOR_PRESETS = [
  { id: 'green_bcsn', name: 'Vert Officiel BCSN', accent: '#0B4D3B', secondary: '#10B981' },
  { id: 'crimson', name: 'Rouge Écarlate', accent: '#D62828', secondary: '#DC2626' },
  { id: 'gold', name: 'Or Victoire', accent: '#F59E0B', secondary: '#D97706' },
  { id: 'cyber_blue', name: 'Bleu Electric', accent: '#3B82F6', secondary: '#2563EB' },
  { id: 'purple_street', name: 'Violet Neon', accent: '#8B5CF6', secondary: '#7C3AED' },
];

// Builtin Textures
const BUILTIN_TEXTURES = [
  { id: 'clean_light', name: 'Blanc Cassé Sport Poster', url: '' },
  { id: 'wood', name: 'Parquet Bois Rétro', url: '/artifacts/bcsn_wood_court_texture_1787834010959.png' },
  { id: 'leather', name: 'Cuir Ballon de Basket', url: '/artifacts/bcsn_leather_ball_texture_1787834023930.png' },
  { id: 'arena', name: 'Arena Sports Neon', url: '/artifacts/bcsn_dark_sports_bg_1787833109383.png' },
];

// Official BCSN Vector Logo Component
const BcsnOfficialLogo = ({ size = 68, customLogoUrl = '' }) => {
  if (customLogoUrl) {
    return (
      <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={customLogoUrl} alt="Logo Club" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', userSelect: 'none' }}>
      {/* Top Curved / Condensed text */}
      <div style={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: 11,
        letterSpacing: 2,
        color: '#0B4D3B',
        textTransform: 'uppercase',
        lineHeight: 1,
        marginBottom: -1
      }}>
        BASKET.CLUB
      </div>

      {/* Main Club Name & Dunker Mascot Silhouette */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32,
          fontWeight: 900,
          fontStyle: 'italic',
          letterSpacing: 1,
          color: '#FFFFFF',
          WebkitTextStroke: '2px #0B4D3B',
          textShadow: '0 0 1px #0B4D3B',
          lineHeight: 0.9,
          padding: '0 4px',
          zIndex: 2
        }}>
          ST NICOLAS
        </div>

        {/* Leaping Red Basketball Player Mascot SVG */}
        <div style={{ position: 'absolute', right: -16, top: -14, zIndex: 3, pointerEvents: 'none' }}>
          <svg width="34" height="42" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Red Basketball Ball */}
            <circle cx="28" cy="14" r="9" fill="#D62828" />
            {/* Leaping Player Body */}
            <path d="M28 25 C32 23, 38 26, 40 32 C43 40, 41 50, 45 58 C47 62, 54 64, 57 70 C60 76, 58 88, 64 96 C67 100, 72 108, 68 114 C65 118, 59 116, 57 110 C53 100, 52 88, 48 80 C44 72, 38 68, 35 60 C32 52, 30 42, 28 34 Z" fill="#D62828" />
            {/* Right Arm Reaching for Dunk */}
            <path d="M37 32 L30 18 L26 19 L32 35 Z" fill="#D62828" />
            {/* Left Arm / Back */}
            <path d="M42 42 L52 46 L50 51 L40 47 Z" fill="#D62828" />
            {/* Trailing Left Leg */}
            <path d="M48 80 L38 98 L32 94 L42 78 Z" fill="#D62828" />
          </svg>
        </div>
      </div>

      {/* Underline decorative bar */}
      <div style={{ display: 'flex', width: '100%', height: 3, marginTop: 1 }}>
        <div style={{ flex: 4, background: '#0B4D3B', borderRadius: 2 }} />
        <div style={{ flex: 1, background: '#D62828', marginLeft: 2, borderRadius: 2 }} />
      </div>
    </div>
  );
};

export function VisualsPage({ teams = [], members = [], events = [], customAssets = [] }) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[0]); // Default to Affiche (4:5)
  const [selectedLayout, setSelectedLayout] = useState(LAYOUT_STYLES[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedBgUrl, setSelectedBgUrl] = useState(BUILTIN_TEXTURES[0].url);
  const [accentColor, setAccentColor] = useState('#0B4D3B');
  const [homeColor, setHomeColor] = useState('#0B4D3B');
  const [awayColor, setAwayColor] = useState('#D62828');
  const [grainOverlay, setGrainOverlay] = useState(false);
  const [showPhoto, setShowPhoto] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState('');
  const [textAlign, setTextAlign] = useState('center');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState('saturday'); // 'saturday' | 'sunday'

  // Full customizable configuration
  const [config, setConfig] = useState({
    headerTitle: 'BCSN BASKET',
    headerSubtitle: 'EST. 1978 · SAÔNE & NIVERNAIS',
    footerLeft: '#BCSN #BASKETBALL',
    footerRight: 'BASKET CLUB ST NICOLAS',

    // Official Weekend Program Template Fields
    programTitleMain: 'PROGRAMME',
    programTitleSub: 'DU WEEK-END',
    clubSocialName: 'BC SAINT NICOLAS',
    clubInstagram: '@bcsn.officiel',
    venueHome: 'au Complexe Sportif',
    venueAway: 'déplacement',

    // Exact matches from the reference model
    saturdayMatches: [
      { id: 'sat-1', category: 'U11 F', time: '10h30', opponent: 'vs ARRAS', isHome: true },
      { id: 'sat-2', category: 'U13 M', time: '14h00', opponent: 'à DOUAI', isHome: false },
      { id: 'sat-3', category: 'U15 M', time: '15h30', opponent: 'vs LENS', isHome: true },
      { id: 'sat-4', category: 'U17 F', time: '17h00', opponent: 'à LIEVIN', isHome: false },
      { id: 'sat-5', category: 'SENIORS B', time: '18h30', opponent: 'vs BÉTHUNE', isHome: true },
      { id: 'sat-6', category: 'SENIORS A', time: '20h30', opponent: 'à ARRAS', isHome: false },
    ],

    sundayMatches: [
      { id: 'sun-1', category: 'U9', time: '09h30', opponent: 'PLATEAU', isHome: true },
      { id: 'sun-2', category: 'U11 M', time: '11h00', opponent: 'PLATEAU', isHome: false },
      { id: 'sun-3', category: 'U13 F', time: '12h30', opponent: 'vs DOUAI', isHome: true },
      { id: 'sun-4', category: 'U15 F', time: '14h00', opponent: 'à HÉNIN', isHome: false },
      { id: 'sun-5', category: 'U18 M', time: '16h00', opponent: 'vs LIEVIN', isHome: true },
      { id: 'sun-6', category: 'LOISIRS', time: '17h30', opponent: 'MATCH AMICAL', isHome: false },
    ],
    
    // Result template
    teamHome: 'BCSN',
    teamAway: 'US COSNE',
    score1: '78',
    score2: '64',
    isVictory: true,
    category: 'SÉNIORS A',
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

    // Announcement template
    customTitle: 'VICTOIRE DU BCSN !',
    customSubtitle: 'Une prestation XXL de nos séniors devant notre public déchaîné ! Merci à tous nos bénévoles et supporters !',
  });

  const canvasRef = useRef(null);
  const customBackgrounds = customAssets.filter(a => a.type === 'background');
  const customLogos = customAssets.filter(a => a.type === 'logo');
  const selectedMember = members.find(m => m.id === config.selectedMemberId);

  // Match management functions for Saturday
  const handleAddSaturdayMatch = () => {
    const newM = {
      id: `sat-${Date.now()}`,
      category: 'NOUVELLE ÉQUIPE',
      time: '15h00',
      opponent: 'vs ADVERSAIRE',
      isHome: true
    };
    setConfig(prev => ({ ...prev, saturdayMatches: [...prev.saturdayMatches, newM] }));
  };

  const handleRemoveSaturdayMatch = (id) => {
    setConfig(prev => ({ ...prev, saturdayMatches: prev.saturdayMatches.filter(m => m.id !== id) }));
  };

  const handleUpdateSaturdayMatch = (id, field, val) => {
    setConfig(prev => ({
      ...prev,
      saturdayMatches: prev.saturdayMatches.map(m => m.id === id ? { ...m, [field]: val } : m)
    }));
  };

  // Match management functions for Sunday
  const handleAddSundayMatch = () => {
    const newM = {
      id: `sun-${Date.now()}`,
      category: 'NOUVELLE ÉQUIPE',
      time: '14h30',
      opponent: 'vs ADVERSAIRE',
      isHome: true
    };
    setConfig(prev => ({ ...prev, sundayMatches: [...prev.sundayMatches, newM] }));
  };

  const handleRemoveSundayMatch = (id) => {
    setConfig(prev => ({ ...prev, sundayMatches: prev.sundayMatches.filter(m => m.id !== id) }));
  };

  const handleUpdateSundayMatch = (id, field, val) => {
    setConfig(prev => ({
      ...prev,
      sundayMatches: prev.sundayMatches.map(m => m.id === id ? { ...m, [field]: val } : m)
    }));
  };

  // Import from Calendar Events with smart Saturday / Sunday grouping
  const handleImportCalendarEvents = () => {
    if (!events || events.length === 0) {
      alert('Aucun événement enregistré dans le calendrier pour le moment.');
      return;
    }

    const matches = events.filter(e => e.type === 'match' || e.typeLabel === 'Match' || e.typeLabel === 'Match Amical' || e.adversaire);
    if (matches.length === 0) {
      alert('Aucun match trouvé dans le calendrier.');
      return;
    }

    const newSat = [];
    const newSun = [];

    matches.forEach((m, idx) => {
      const dateObj = m.date ? new Date(m.date) : null;
      const dayOfWeek = dateObj ? dateObj.getDay() : null; // 6 = Saturday, 0 = Sunday
      const isHome = m.lieu ? m.lieu.toLowerCase().includes('domicile') || m.isAway === false : true;
      const formattedTime = m.time ? (m.time.includes('h') ? m.time : m.time.replace(':', 'h')) : '15h00';
      const oppName = m.adversaire || m.title || 'ADVERSAIRE';
      const oppString = isHome ? `vs ${oppName}` : `à ${oppName}`;
      const cat = m.equipe || m.category || 'BCSN';

      const matchItem = {
        id: `imp-${idx}-${Date.now()}`,
        category: cat.toUpperCase(),
        time: formattedTime,
        opponent: oppString,
        isHome: isHome
      };

      if (dayOfWeek === 0) {
        newSun.push(matchItem);
      } else {
        newSat.push(matchItem);
      }
    });

    if (newSat.length > 0 || newSun.length > 0) {
      setConfig(prev => ({
        ...prev,
        saturdayMatches: newSat.length > 0 ? newSat : prev.saturdayMatches,
        sundayMatches: newSun.length > 0 ? newSun : prev.sundayMatches,
      }));
      alert(`Importation réussie : ${newSat.length} matchs le samedi, ${newSun.length} matchs le dimanche.`);
    } else {
      alert('Aucun match du week-end détecté.');
    }
  };

  const exportSingleCanvas = async (fileName) => {
    const node = canvasRef.current;
    if (!node) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(node, { 
        backgroundColor: null, 
        scale: 3.5, 
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Erreur lors de l export PNG:', err);
      alert("Une erreur s'est produite lors de l'exportation du visuel.");
    }
  };

  const handleDownload = async () => {
    const dateStr = new Date().toISOString().split('T')[0];
    await exportSingleCanvas(`bcsn-programme-weekend-${dateStr}.png`);
  };

  const generateCaption = () => {
    const hashtag = "#BCSN #BasketClubStNicolas #ProgrammeDuWeekEnd #Basketball #FFBB #TeamBCSN";
    if (selectedTemplate.id === 'weekend_program') {
      const satText = config.saturdayMatches.map(m => `🏀 ${m.category} | ${m.time} | ${m.opponent} (${m.isHome ? 'DOMICILE' : 'EXTÉRIEUR'})`).join('\n');
      const sunText = config.sundayMatches.map(m => `🏀 ${m.category} | ${m.time} | ${m.opponent} (${m.isHome ? 'DOMICILE' : 'EXTÉRIEUR'})`).join('\n');

      return `🔥 ${config.programTitleMain} ${config.programTitleSub} 🔥\n\n` +
        `📅 SAMEDI :\n${satText}\n\n` +
        `📅 DIMANCHE :\n${sunText}\n\n` +
        `📍 Venez nombreux pousser et encourager nos équipes au gymnase ! Vert et Blanc jusqu'au bout ! 💚🤍\n\n${hashtag}`;
    }

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

      default:
        return `${config.customTitle}\n\n${config.customSubtitle}\n\n${hashtag}`;
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generateCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // -------------------------------------------------------------
  // RENDERING ENGINE FOR THE EXACT OFFICIAL WEEKEND SCHEDULE POSTER
  // -------------------------------------------------------------
  const renderOfficialWeekendProgram = () => {
    const isPortrait = selectedFormat.id === 'portrait';
    const isStory = selectedFormat.id === 'story';
    const isPost = selectedFormat.id === 'post';

    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F7F6',
        backgroundImage: 'linear-gradient(180deg, #FAFBFB 0%, #EFF2F0 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isStory ? '34px 18px 18px 18px' : isPost ? '16px 14px' : '22px 18px 16px 18px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: '#1E293B'
      }}>
        {/* LAYER 1A: Top-Left Subtle Giant Basketball Watermark */}
        <div style={{
          position: 'absolute',
          top: -30,
          left: -40,
          width: 220,
          height: 220,
          opacity: 0.08,
          pointerEvents: 'none',
          zIndex: 1
        }}>
          <svg viewBox="0 0 100 100" fill="none" stroke="#0B4D3B" strokeWidth="2.5">
            <circle cx="50" cy="50" r="48" />
            <line x1="2" y1="50" x2="98" y2="50" />
            <line x1="50" y1="2" x2="50" y2="98" />
            <path d="M16 16 C34 32, 34 68, 16 84" />
            <path d="M84 16 C66 32, 66 68, 84 84" />
          </svg>
        </div>

        {/* LAYER 1B: Top-Right Angled Paintbrush Strokes (Green & Crimson) */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 90, pointerEvents: 'none', zIndex: 1 }}>
          {/* Green Brush */}
          <div style={{
            position: 'absolute',
            top: -15,
            right: -20,
            width: 130,
            height: 42,
            background: 'linear-gradient(90deg, #0B4D3B 0%, #168E56 100%)',
            transform: 'rotate(-12deg)',
            clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
            opacity: 0.85
          }} />
          {/* Red Brush */}
          <div style={{
            position: 'absolute',
            top: 22,
            right: -10,
            width: 80,
            height: 12,
            background: '#D62828',
            transform: 'rotate(-14deg)',
            clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
            opacity: 0.85
          }} />
        </div>

        {/* LAYER 1C: Bottom-Right Basketball Court Tactical Lines Watermark */}
        <div style={{
          position: 'absolute',
          bottom: -15,
          right: -20,
          width: 220,
          height: 160,
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.28
        }}>
          <svg viewBox="0 0 160 120" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
            <rect x="5" y="5" width="150" height="110" />
            <path d="M40 5 L40 55 L120 55 L120 5 Z" />
            <circle cx="80" cy="55" r="22" strokeDasharray="4 4" />
            <path d="M10 5 C10 80, 150 80, 150 5" />
            <circle cx="80" cy="5" r="10" />
          </svg>
        </div>

        {/* LAYER 1D: Bottom Wide Dark Green Grunge Brush Banner */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 38,
          background: 'linear-gradient(90deg, #07382B 0%, #0B4D3B 50%, #07382B 100%)',
          clipPath: 'polygon(0% 28%, 18% 18%, 45% 32%, 75% 15%, 100% 30%, 100% 100%, 0% 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* ========================================================= */}
        {/* LAYER 2: HEADER BRANDING (LOGO + MAIN TITLE) */}
        {/* ========================================================= */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 6 }}>
          {/* BCSN Official Vector Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <BcsnOfficialLogo size={isStory ? 60 : 54} customLogoUrl={selectedLogoUrl} />
          </div>

          {/* Main Title: PROGRAMME (Green) DU WEEK-END (Red) */}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: isStory ? 38 : isPost ? 30 : 36,
            lineHeight: 0.95,
            letterSpacing: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            <span style={{ color: homeColor }}>{config.programTitleMain || 'PROGRAMME'}</span>
            <span style={{ color: awayColor }}>{config.programTitleSub || 'DU WEEK-END'}</span>
          </div>

          {/* LAYER 3: Social Ribbon Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#0B4D3B',
            color: '#FFFFFF',
            borderRadius: 6,
            padding: '3px 14px',
            marginTop: 4,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5,
            boxShadow: '0 2px 6px rgba(11,77,59,0.25)',
            clipPath: 'polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:basketball-bold" width="13" height="13" color="#FFFFFF" />
              <span>{config.clubSocialName || 'BC SAINT NICOLAS'}</span>
            </div>
            <span style={{ opacity: 0.5 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:instagram-logo-bold" width="13" height="13" color="#FFFFFF" />
              <span>{config.clubInstagram || '@bcsn.officiel'}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LAYER 4 & 5: TWO DYNAMIC COLUMNS (SAMEDI & DIMANCHE) */}
        {/* ========================================================= */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          flex: 1,
          margin: '6px 0 10px 0',
          alignItems: 'start'
        }}>
          {/* LEFT COLUMN: SAMEDI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {/* Header Samedi */}
            <div style={{
              background: '#0B4D3B',
              color: '#FFFFFF',
              borderRadius: 10,
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              clipPath: 'polygon(0% 0%, 96% 0%, 100% 100%, 4% 100%)'
            }}>
              <Icon icon="ph:calendar-blank-bold" width="15" height="15" color="#FFFFFF" />
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontStyle: 'italic',
                fontSize: 16,
                letterSpacing: 1.5,
                fontWeight: 900,
                lineHeight: 1
              }}>
                SAMEDI
              </span>
            </div>

            {/* List of Saturday Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {config.saturdayMatches.map((m) => {
                const matchColor = m.isHome ? homeColor : awayColor;
                return (
                  <div key={m.id} style={{
                    background: '#FFFFFF',
                    borderRadius: 9,
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 4,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    minHeight: 32
                  }}>
                    {/* Left: Ball Icon + Category + Separator + Time + Opponent */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', flex: 1 }}>
                      {/* Basketball Icon Badge */}
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: matchColor,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 1px 3px ${matchColor}66`
                      }}>
                        <Icon icon="ph:basketball-bold" width="14" height="14" color="#FFFFFF" />
                      </div>

                      {/* Category */}
                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 14,
                        fontWeight: 900,
                        color: matchColor,
                        letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                        lineHeight: 1
                      }}>
                        {m.category}
                      </div>

                      <span style={{ color: '#CBD5E1', fontSize: 10 }}>|</span>

                      {/* Time */}
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#1E293B',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {m.time}
                      </div>

                      {/* Opponent */}
                      <div style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {m.opponent}
                      </div>
                    </div>

                    {/* Right: Pill Tag (Domicile or Extérieur) */}
                    <div style={{
                      background: matchColor,
                      color: '#FFFFFF',
                      borderRadius: 4,
                      padding: '2px 5px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      minWidth: 38
                    }}>
                      <Icon 
                        icon={m.isHome ? "ph:house-line-bold" : "ph:map-pin-bold"} 
                        width="8" 
                        height="8" 
                        color="#FFFFFF" 
                      />
                      <span style={{ fontSize: 6.5, fontWeight: 900, letterSpacing: 0.3, lineHeight: 1, textTransform: 'uppercase' }}>
                        {m.isHome ? 'DOMICILE' : 'EXTÉRIEUR'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: DIMANCHE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {/* Header Dimanche */}
            <div style={{
              background: '#0B4D3B',
              color: '#FFFFFF',
              borderRadius: 10,
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              clipPath: 'polygon(0% 0%, 96% 0%, 100% 100%, 4% 100%)'
            }}>
              <Icon icon="ph:calendar-blank-bold" width="15" height="15" color="#FFFFFF" />
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontStyle: 'italic',
                fontSize: 16,
                letterSpacing: 1.5,
                fontWeight: 900,
                lineHeight: 1
              }}>
                DIMANCHE
              </span>
            </div>

            {/* List of Sunday Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {config.sundayMatches.map((m) => {
                const matchColor = m.isHome ? homeColor : awayColor;
                return (
                  <div key={m.id} style={{
                    background: '#FFFFFF',
                    borderRadius: 9,
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 4,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    minHeight: 32
                  }}>
                    {/* Left: Ball Icon + Category + Separator + Time + Opponent */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', flex: 1 }}>
                      {/* Basketball Icon Badge */}
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: matchColor,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 1px 3px ${matchColor}66`
                      }}>
                        <Icon icon="ph:basketball-bold" width="14" height="14" color="#FFFFFF" />
                      </div>

                      {/* Category */}
                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 14,
                        fontWeight: 900,
                        color: matchColor,
                        letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                        lineHeight: 1
                      }}>
                        {m.category}
                      </div>

                      <span style={{ color: '#CBD5E1', fontSize: 10 }}>|</span>

                      {/* Time */}
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#1E293B',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {m.time}
                      </div>

                      {/* Opponent */}
                      <div style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#334155',
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {m.opponent}
                      </div>
                    </div>

                    {/* Right: Pill Tag (Domicile or Extérieur) */}
                    <div style={{
                      background: matchColor,
                      color: '#FFFFFF',
                      borderRadius: 4,
                      padding: '2px 5px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      minWidth: 38
                    }}>
                      <Icon 
                        icon={m.isHome ? "ph:house-line-bold" : "ph:map-pin-bold"} 
                        width="8" 
                        height="8" 
                        color="#FFFFFF" 
                      />
                      <span style={{ fontSize: 6.5, fontWeight: 900, letterSpacing: 0.3, lineHeight: 1, textTransform: 'uppercase' }}>
                        {m.isHome ? 'DOMICILE' : 'EXTÉRIEUR'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LAYER 6: BOTTOM VENUE LEGEND BAR */}
        {/* ========================================================= */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 8,
            padding: '4px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 9,
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            {/* Home Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: '#0B4D3B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon icon="ph:house-line-bold" width="10" height="10" color="#FFFFFF" />
              </div>
              <span style={{ color: '#0B4D3B', fontWeight: 900, textTransform: 'uppercase', fontSize: 8.5 }}>DOMICILE :</span>
              <span style={{ color: '#475569', fontWeight: 600 }}>{config.venueHome || 'au Complexe Sportif'}</span>
            </div>

            <span style={{ color: '#CBD5E1' }}>|</span>

            {/* Away Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: '#D62828',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon icon="ph:map-pin-bold" width="10" height="10" color="#FFFFFF" />
              </div>
              <span style={{ color: '#D62828', fontWeight: 900, textTransform: 'uppercase', fontSize: 8.5 }}>EXTÉRIEUR :</span>
              <span style={{ color: '#475569', fontWeight: 600 }}>{config.venueAway || 'déplacement'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // RENDERING ENGINE FOR OTHER GRAPHIC TEMPLATES (RESULT, MVP, ETC.)
  // -------------------------------------------------------------
  const renderOtherTemplates = () => {
    const isStory = selectedFormat.id === 'story';
    const isBanner = selectedFormat.id === 'banner';
    const isCyber = selectedLayout.id === 'cyber';
    const isCollege = selectedLayout.id === 'college';
    const isTicket = selectedLayout.id === 'ticket';
    const isEditorial = selectedLayout.id === 'editorial';
    const isBannerTop = selectedLayout.id === 'banner_top';
    const isSplitLeft = selectedLayout.id === 'split_left_text';
    const isSplitRight = selectedLayout.id === 'split_right_text';
    const isNoImage = selectedLayout.id === 'no_image_clean' || !showPhoto;

    const visualStyle = {
      width: '100%',
      height: '100%',
      backgroundImage: isNoImage ? 'none' : `url(${selectedBgUrl})`,
      backgroundColor: isNoImage ? '#0B0D12' : '#000000',
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

    const contentFlexDirection = isBannerTop ? 'column' : (isSplitLeft || isSplitRight ? 'row' : 'column');
    const contentTextAlign = isSplitLeft ? 'left' : (isSplitRight ? 'right' : textAlign);

    return (
      <div style={visualStyle}>
        {/* Editorial Giant Watermark */}
        {isEditorial && (
          <div style={{
            position: 'absolute', top: '25%', left: '-10%', right: '-10%',
            fontSize: isStory ? 100 : 70, fontWeight: 900, color: 'rgba(255,255,255,0.06)',
            textTransform: 'uppercase', letterSpacing: 4, whiteSpace: 'nowrap',
            pointerEvents: 'none', zIndex: 1, textAlign: 'center'
          }}>
            BCSN 1978
          </div>
        )}

        {/* Dark Vignette Layer */}
        {!isNoImage && (
          <div style={{
            position: 'absolute', inset: 0,
            background: isCollege ? 'linear-gradient(180deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.92) 100%)' :
                        isCyber ? 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.94) 100%)' :
                        'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
            pointerEvents: 'none'
          }} />
        )}

        {/* Vintage Grain Layer */}
        {grainOverlay && !isNoImage && (
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
            {showLogo && (
              <div style={{
                width: 38, height: 38, borderRadius: 8, background: selectedLogoUrl ? 'transparent' : accentColor,
                border: selectedLogoUrl ? 'none' : '2px solid #FFF', display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', flexShrink: 0, overflow: 'hidden'
              }}>
                {selectedLogoUrl ? (
                  <img src={selectedLogoUrl} alt="Logo BCSN" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Icon icon="ph:basketball-bold" width="22" height="22" color="#FFF" />
                )}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: selectedFont.fontFamily, whiteSpace: 'nowrap' }}>
                {config.headerTitle || 'BCSN BASKET'}
              </div>
              <div style={{ fontSize: 8.5, opacity: 0.85, letterSpacing: 1, fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
                {config.headerSubtitle || 'EST. 1978 · SAÔNE & NIVERNAIS'}
              </div>
            </div>
          </div>
          
          <div style={{
            fontSize: (config.category || '').length > 15 ? 8.5 : 10,
            fontWeight: 900, padding: '4px 10px', borderRadius: isTicket ? 0 : 4,
            background: accentColor, color: '#FFF', border: '1px solid #FFF',
            textTransform: 'uppercase', letterSpacing: 0.5, boxShadow: '3px 3px 0px #000',
            whiteSpace: 'nowrap'
          }}>
            {config.category || 'SENIORS A'}
          </div>
        </div>

        {/* Center Content Wrapper */}
        <div style={{
          position: 'relative', zIndex: 2, flex: 1, display: 'flex',
          flexDirection: contentFlexDirection,
          justifyContent: 'center', alignItems: 'center', margin: '10px 0', gap: 16,
          textAlign: contentTextAlign
        }}>
          {/* RESULT TEMPLATE */}
          {selectedTemplate.id === 'result' && (
            <div style={{
              width: '100%', display: 'flex',
              flexDirection: isSplitLeft ? 'row' : isSplitRight ? 'row-reverse' : 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: contentTextAlign
            }}>
              <div style={{ flex: 1, textAlign: contentTextAlign }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: isStory ? 18 : 14, letterSpacing: 3, textTransform: 'uppercase',
                  fontWeight: 900, background: config.isVictory ? accentColor : '#EF4444',
                  color: '#FFF', padding: '6px 18px', borderRadius: isTicket ? 0 : 6, marginBottom: 12,
                  border: '2px solid #000', boxShadow: '4px 4px 0px #000'
                }}>
                  <Icon icon={config.isVictory ? "ph:trophy-bold" : "ph:x-circle-bold"} width="18" height="18" />
                  {config.isVictory ? 'VICTOIRE' : 'DÉFAITE'}
                </div>

                <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.9 }}>
                  {config.category || 'BCSN'}
                </div>
                {config.quarterDetails && (
                  <div style={{ fontSize: 10, opacity: 0.85, marginTop: 4, fontFamily: "'Inter', sans-serif" }}>
                    {config.quarterDetails}
                  </div>
                )}
              </div>

              {/* Score Board */}
              <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%' }}>
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 10, border: `2px solid ${accentColor}` }}>
                  <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>{config.teamHome}</div>
                  <div style={{ fontSize: isStory ? 60 : 48, fontWeight: 900, lineHeight: 0.9, color: config.isVictory ? accentColor : '#FFF' }}>{config.score1}</div>
                </div>
                <div style={{ fontSize: 18, opacity: 0.6, fontWeight: 900 }}>VS</div>
                <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', opacity: 0.9 }}>{config.teamAway}</div>
                  <div style={{ fontSize: isStory ? 60 : 48, fontWeight: 900, lineHeight: 0.9 }}>{config.score2}</div>
                </div>
              </div>
            </div>
          )}

          {/* MATCH DAY TEMPLATE */}
          {selectedTemplate.id === 'match_day' && (
            <div style={{
              width: '100%', display: 'flex',
              flexDirection: isSplitLeft ? 'row' : isSplitRight ? 'row-reverse' : 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: contentTextAlign
            }}>
              <div style={{ flex: 1, textAlign: contentTextAlign }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: accentColor, marginBottom: 6, fontWeight: 900 }}>
                  <Icon icon="ph:swords-bold" width="16" height="16" />
                  {config.competition || 'JOUR DE MATCH'}
                </div>
                <div style={{ fontSize: isStory ? 32 : 26, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
                  {config.teamHome} <span style={{ color: accentColor }}>VS</span> {config.teamAway}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.75)', padding: '12px 20px', borderRadius: isTicket ? 0 : 8,
                border: `2px solid ${accentColor}`, boxShadow: '4px 4px 0px #000', flex: 1, textAlign: 'center'
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

          {/* MVP TEMPLATE */}
          {selectedTemplate.id === 'player_mvp' && (
            <div style={{
              width: '100%', display: 'flex',
              flexDirection: isSplitLeft ? 'row' : isSplitRight ? 'row-reverse' : 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16
            }}>
              {!isNoImage && (
                <div style={{
                  width: isStory ? 130 : 100, height: isStory ? 130 : 100, borderRadius: isTicket ? 0 : 14,
                  border: `3px solid ${accentColor}`, overflow: 'hidden', boxShadow: '5px 5px 0px #000',
                  background: '#161921', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selectedMember && selectedMember.photo ? (
                    <img src={selectedMember.photo} alt={selectedMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: 28, fontWeight: 900, color: accentColor }}>
                      {selectedMember ? getInitials(selectedMember.name) : 'BCSN'}
                    </div>
                  )}
                </div>
              )}

              <div style={{ textAlign: contentTextAlign, flex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: accentColor, fontWeight: 900, marginBottom: 4 }}>
                  <Icon icon="ph:star-bold" width="15" height="15" />
                  MVP DU MATCH
                </div>

                <div style={{ fontSize: isStory ? 24 : 18, fontWeight: 900, textTransform: 'uppercase', textShadow: '2px 2px 0px #000' }}>
                  {selectedMember ? selectedMember.name : 'Nom du Joueur'}
                  <span style={{ fontSize: 14, color: accentColor, marginLeft: 6 }}>#{config.playerNumber}</span>
                </div>
                <div style={{ fontSize: 10, opacity: 0.8, fontFamily: "'Inter', sans-serif", letterSpacing: 1, marginBottom: 8 }}>{config.playerPosition}</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%', maxWidth: 360 }}>
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
            </div>
          )}

          {/* ANNOUNCEMENT TEMPLATE */}
          {selectedTemplate.id === 'announcement' && (
            <div style={{ textAlign: contentTextAlign, padding: '0 12px' }}>
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
          <div>{config.footerRight || 'BASKET CLUB ST NICOLAS'}</div>
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
            Personnalisation & Matchs
          </h3>

          {/* Formats Selector */}
          <div className="input-group mb-16">
            <label className="input-label">Format d'exportation (Réseaux Sociaux)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  className={`btn btn-sm ${selectedFormat.id === f.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedFormat(f)}
                  style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Icon icon={f.icon} width="16" height="16" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Selection */}
          <div className="input-group mb-16">
            <label className="input-label">Couleurs Officielles (Domicile Vert / Extérieur Rouge)</label>
            <div className="grid-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <input type="color" value={homeColor} onChange={e => { setHomeColor(e.target.value); setAccentColor(e.target.value); }} style={{ width: 28, height: 28, border: 'none', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: homeColor }}>DOMICILE</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Vert Officiel BCSN</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                <input type="color" value={awayColor} onChange={e => setAwayColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: awayColor }}>EXTÉRIEUR</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rouge Match</div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Club Configuration */}
          <div className="input-group mb-16" style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color="var(--primary-light)" />
                Logo Officiel BCSN (Basketteur Rouge Vectoriel)
              </span>
            </div>
            {customLogos.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <label className="input-label" style={{ fontSize: 11 }}>Remplacer par un fichier de la Médiathèque</label>
                <select className="input select" value={selectedLogoUrl} onChange={e => setSelectedLogoUrl(e.target.value)}>
                  <option value="">-- Logo Vectoriel Officiel BCSN (Recommandé) --</option>
                  {customLogos.map(l => (
                    <option key={l.id} value={l.url}>{l.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION DÉDIÉE : PROGRAMME DU WEEK-END (2 COLONNES) */}
          {/* ========================================================= */}
          {selectedTemplate.id === 'weekend_program' && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-light)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon icon="ph:calendar-bold" width="18" height="18" />
                  Gestion des Matchs (2 Colonnes)
                </h4>
                <button className="btn btn-secondary btn-sm" onClick={handleImportCalendarEvents} title="Importer les prochains matchs du calendrier BDD">
                  <Zap size={13} style={{ color: 'var(--warning)' }} /> Importer du Calendrier
                </button>
              </div>

              {/* Titres & Réseaux Sociaux */}
              <div className="grid-2 mb-12">
                <div className="input-group">
                  <label className="input-label">Titre Principal (Vert)</label>
                  <input className="input" value={config.programTitleMain} onChange={e => setConfig({...config, programTitleMain: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Sous-Titre (Rouge)</label>
                  <input className="input" value={config.programTitleSub} onChange={e => setConfig({...config, programTitleSub: e.target.value})} />
                </div>
              </div>

              <div className="grid-2 mb-12">
                <div className="input-group">
                  <label className="input-label">Nom Club (Bandeau)</label>
                  <input className="input" value={config.clubSocialName} onChange={e => setConfig({...config, clubSocialName: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Instagram (Bandeau)</label>
                  <input className="input" value={config.clubInstagram} onChange={e => setConfig({...config, clubInstagram: e.target.value})} />
                </div>
              </div>

              {/* Légende du bas */}
              <div className="grid-2 mb-16">
                <div className="input-group">
                  <label className="input-label">Légende Domicile (Salle)</label>
                  <input className="input" value={config.venueHome} onChange={e => setConfig({...config, venueHome: e.target.value})} placeholder="au Complexe Sportif" />
                </div>
                <div className="input-group">
                  <label className="input-label">Légende Extérieur</label>
                  <input className="input" value={config.venueAway} onChange={e => setConfig({...config, venueAway: e.target.value})} placeholder="déplacement" />
                </div>
              </div>

              {/* Day Tabs Switcher: SAMEDI / DIMANCHE */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <button
                  className={`btn btn-sm ${activeDayTab === 'saturday' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveDayTab('saturday')}
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  <Icon icon="ph:calendar-blank-bold" width="14" height="14" />
                  Samedi ({config.saturdayMatches.length} matchs)
                </button>
                <button
                  className={`btn btn-sm ${activeDayTab === 'sunday' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveDayTab('sunday')}
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  <Icon icon="ph:calendar-blank-bold" width="14" height="14" />
                  Dimanche ({config.sundayMatches.length} matchs)
                </button>
              </div>

              {/* TAB 1: SAMEDI MATCHES */}
              {activeDayTab === 'saturday' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {config.saturdayMatches.map((m, index) => (
                    <div key={m.id} style={{
                      background: 'var(--bg-card)',
                      padding: '8px 10px',
                      borderRadius: 8,
                      borderLeft: `4px solid ${m.isHome ? homeColor : awayColor}`,
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: m.isHome ? homeColor : awayColor }}>
                            SAMEDI #{index + 1}
                          </span>
                          <span style={{
                            fontSize: 8.5,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: m.isHome ? homeColor : awayColor,
                            color: '#FFF',
                            fontWeight: 800
                          }}>
                            {m.isHome ? 'DOMICILE' : 'EXTÉRIEUR'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              fontSize: 10,
                              padding: '2px 8px',
                              background: m.isHome ? 'rgba(11,77,59,0.15)' : 'rgba(214,40,40,0.15)',
                              color: m.isHome ? homeColor : awayColor,
                              border: `1px solid ${m.isHome ? homeColor : awayColor}`
                            }}
                            onClick={() => handleUpdateSaturdayMatch(m.id, 'isHome', !m.isHome)}
                          >
                            Inverser Dom/Ext
                          </button>
                          {config.saturdayMatches.length > 1 && (
                            <button onClick={() => handleRemoveSaturdayMatch(m.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid-2">
                        <input
                          className="input"
                          style={{ fontSize: 12, padding: '4px 8px' }}
                          placeholder="Catégorie (ex: U11 F)"
                          value={m.category}
                          onChange={e => handleUpdateSaturdayMatch(m.id, 'category', e.target.value)}
                        />
                        <input
                          className="input"
                          style={{ fontSize: 12, padding: '4px 8px' }}
                          placeholder="Heure (ex: 10h30)"
                          value={m.time}
                          onChange={e => handleUpdateSaturdayMatch(m.id, 'time', e.target.value)}
                        />
                      </div>
                      <input
                        className="input"
                        style={{ fontSize: 12, padding: '4px 8px' }}
                        placeholder="Adversaire / Info (ex: vs ARRAS ou à DOUAI)"
                        value={m.opponent}
                        onChange={e => handleUpdateSaturdayMatch(m.id, 'opponent', e.target.value)}
                      />
                    </div>
                  ))}

                  <button className="btn btn-secondary btn-sm" onClick={handleAddSaturdayMatch} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                    <Plus size={14} /> Ajouter un match le Samedi
                  </button>
                </div>
              )}

              {/* TAB 2: DIMANCHE MATCHES */}
              {activeDayTab === 'sunday' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {config.sundayMatches.map((m, index) => (
                    <div key={m.id} style={{
                      background: 'var(--bg-card)',
                      padding: '8px 10px',
                      borderRadius: 8,
                      borderLeft: `4px solid ${m.isHome ? homeColor : awayColor}`,
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: m.isHome ? homeColor : awayColor }}>
                            DIMANCHE #{index + 1}
                          </span>
                          <span style={{
                            fontSize: 8.5,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: m.isHome ? homeColor : awayColor,
                            color: '#FFF',
                            fontWeight: 800
                          }}>
                            {m.isHome ? 'DOMICILE' : 'EXTÉRIEUR'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              fontSize: 10,
                              padding: '2px 8px',
                              background: m.isHome ? 'rgba(11,77,59,0.15)' : 'rgba(214,40,40,0.15)',
                              color: m.isHome ? homeColor : awayColor,
                              border: `1px solid ${m.isHome ? homeColor : awayColor}`
                            }}
                            onClick={() => handleUpdateSundayMatch(m.id, 'isHome', !m.isHome)}
                          >
                            Inverser Dom/Ext
                          </button>
                          {config.sundayMatches.length > 1 && (
                            <button onClick={() => handleRemoveSundayMatch(m.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2 }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid-2">
                        <input
                          className="input"
                          style={{ fontSize: 12, padding: '4px 8px' }}
                          placeholder="Catégorie (ex: U9)"
                          value={m.category}
                          onChange={e => handleUpdateSundayMatch(m.id, 'category', e.target.value)}
                        />
                        <input
                          className="input"
                          style={{ fontSize: 12, padding: '4px 8px' }}
                          placeholder="Heure (ex: 09h30)"
                          value={m.time}
                          onChange={e => handleUpdateSundayMatch(m.id, 'time', e.target.value)}
                        />
                      </div>
                      <input
                        className="input"
                        style={{ fontSize: 12, padding: '4px 8px' }}
                        placeholder="Adversaire / Info (ex: PLATEAU ou vs DOUAI)"
                        value={m.opponent}
                        onChange={e => handleUpdateSundayMatch(m.id, 'opponent', e.target.value)}
                      />
                    </div>
                  ))}

                  <button className="btn btn-secondary btn-sm" onClick={handleAddSundayMatch} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                    <Plus size={14} /> Ajouter un match le Dimanche
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OTHER TEMPLATES CONTROLS */}
          {selectedTemplate.id !== 'weekend_program' && (
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
          )}

          {/* Automatic Caption Generator */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="input-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon icon="ph:instagram-logo-bold" width="16" height="16" color="#E1306C" />
                Légende Réseaux Sociaux (Instagram & Facebook)
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
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Icon icon="ph:eye-bold" width="20" height="20" color="var(--primary-light)" />
              Aperçu HD ({selectedFormat.label})
            </h3>

            <button className="btn btn-primary" onClick={handleDownload} style={{ boxShadow: '0 4px 12px rgba(11,77,59,0.35)' }}>
              <Download size={16} /> Exporter PNG Haute Définition
            </button>
          </div>

          <div style={{
            width: selectedFormat.width,
            maxWidth: '100%',
            aspectRatio: selectedFormat.ratio,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            border: '2px solid #2A2D3A'
          }} ref={canvasRef}>
            {selectedTemplate.id === 'weekend_program' 
              ? renderOfficialWeekendProgram() 
              : renderOtherTemplates()
            }
          </div>
        </div>
      </div>
    </div>
  );
}

