import React, { useState, useRef } from 'react';
import { 
  Download, Copy, Check, Plus, Trash2, Zap, Shield, 
  Sparkles, Calendar, Trophy, Swords, Star, Megaphone,
  MapPin, Home, RefreshCw, Share2, Layers, Sliders, ChevronRight
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { getInitials } from '../hooks/useLocalStorage';

// -------------------------------------------------------------
// 1. TEMPLATES DISPONIBLES (STUDIO PRO)
// -------------------------------------------------------------
const TEMPLATES = [
  { 
    id: 'weekend_program', 
    name: 'Programme Week-End', 
    badge: 'Officiel',
    icon: 'ph:calendar-blank-bold', 
    desc: 'Affiche 2 colonnes (Samedi / Dimanche)',
    color: '#0B4D3B'
  },
  { 
    id: 'match_day', 
    name: 'Jour de Match', 
    badge: 'Game Day',
    icon: 'ph:swords-bold', 
    desc: 'Affiche de rencontre & duel choc',
    color: '#D62828'
  },
  { 
    id: 'result', 
    name: 'Résultat & Score', 
    badge: 'Scoreboard',
    icon: 'ph:trophy-bold', 
    desc: 'Score final, victoires & quarts-temps',
    color: '#F59E0B'
  },
  { 
    id: 'player_mvp', 
    name: 'MVP / Carte Joueur', 
    badge: 'NBA 2K',
    icon: 'ph:star-bold', 
    desc: 'Mise en avant joueur & 4 stats clés',
    color: '#8B5CF6'
  },
  { 
    id: 'announcement', 
    name: 'Flash Info / Annonce', 
    badge: 'Officiel',
    icon: 'ph:megaphone-bold', 
    desc: 'Communiqué officiel & événements',
    color: '#0284C7'
  },
];

// -------------------------------------------------------------
// 2. FORMATS DE RÉSEAUX SOCIAUX
// -------------------------------------------------------------
const FORMATS = [
  { id: 'portrait', label: 'Affiche Feed (4:5)', sub: 'Instagram / FB Feed (1080x1350)', icon: 'ph:newspaper-bold', ratio: '4 / 5', width: 480, height: 600 },
  { id: 'story', label: 'Story (9:16)', sub: 'Insta / TikTok Story (1080x1920)', icon: 'ph:device-mobile-camera-bold', ratio: '9 / 16', width: 380, height: 675 },
  { id: 'post', label: 'Post Carré (1:1)', sub: 'Post Classique (1080x1080)', icon: 'ph:square-bold', ratio: '1 / 1', width: 480, height: 480 },
];

// -------------------------------------------------------------
// 3. THÈMES & AMBIANCES VISUELLES
// -------------------------------------------------------------
const THEMES = [
  { id: 'clean_official', name: 'BCSN Clean Officiel', desc: 'Fond blanc cassé épuré, vert sapin & rouge écarlate' },
  { id: 'dark_arena', name: 'Midnight Stadium', desc: 'Fond noir arène, reflets spotlights & halos néon' },
  { id: 'street_court', name: 'Streetwear Parquet', desc: 'Ambiance parquet bois, lettrages jersey vintage' },
];

import bcsnLogoImg from '../assets/bcsn.png';
import fondImg from '../assets/fond.png';

// -------------------------------------------------------------
// LOGO OFFICIEL BCSN (HAUTE DÉFINITION)
// -------------------------------------------------------------
const BcsnOfficialLogo = ({ isDark = false, size = 66, customLogoUrl = '' }) => {
  const logoSrc = customLogoUrl || bcsnLogoImg;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      <img
        src={logoSrc}
        alt="Logo Basket Club St Nicolas"
        style={{
          height: size,
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
          backgroundColor: isDark ? 'rgba(255,255,255,0.95)' : 'transparent',
          padding: isDark ? '4px 10px' : '0',
          borderRadius: isDark ? '8px' : '0',
          filter: isDark ? 'drop-shadow(0 0 10px rgba(16,185,129,0.35))' : 'none'
        }}
      />
    </div>
  );
};

export function VisualsPage({ teams = [], members = [], events = [], customAssets = [] }) {
  // Active State
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS[0]); // Affiche 4:5
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [activeDayTab, setActiveDayTab] = useState('saturday'); // 'saturday' | 'sunday'
  const [currentProgramPage, setCurrentProgramPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState('');

  // Primary colors
  const [homeColor, setHomeColor] = useState('#0B4D3B');
  const [awayColor, setAwayColor] = useState('#D62828');

  // Master Studio Configuration
  const [config, setConfig] = useState({
    // Program template
    programTitleMain: 'PROGRAMME',
    programTitleSub: 'DU WEEK-END',
    clubSocialName: 'BC SAINT NICOLAS',
    clubInstagram: '@bcsn.officiel',
    venueHome: 'au Complexe Bonne Humeur',
    venueAway: 'déplacement',
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

    // Match Day template
    matchCategory: 'SÉNIORS A (M)',
    matchHomeTeam: 'BC SAINT NICOLAS',
    matchAwayTeam: 'ARRAS BASKET CLUB',
    matchDate: new Date().toISOString().split('T')[0],
    matchTime: '20:30',
    matchVenue: 'Complexe Bonne Humeur',
    matchCompetition: 'CHAMPIONNAT RÉGIONALE 2',

    // Result template
    resultCategory: 'SÉNIORS A (M)',
    resultHomeTeam: 'BCSN',
    resultAwayTeam: 'ARRAS',
    scoreHome: '78',
    scoreAway: '64',
    isVictory: true,
    resultDetails: 'Q1: 18-12 | Q2: 22-16 | Q3: 15-20 | Q4: 23-16',

    // MVP template
    selectedMemberId: '',
    playerNumber: '10',
    playerPosition: 'MENEUR / ARRIÈRE',
    stat1Label: 'POINTS',
    stat1Value: '28',
    stat2Label: 'REBONDS',
    stat2Value: '7',
    stat3Label: 'PASSES',
    stat3Value: '9',
    stat4Label: 'EVAL',
    stat4Value: '+32',

    // Announcement template
    announcementTag: 'OFFICIEL BCSN',
    announcementTitle: 'GRANDE SOIRÉE DU CLUB',
    announcementBody: 'Rejoignez-nous ce samedi à partir de 18h00 pour soutenir nos équipes seniors, avec buvette festive et tombola !',
    announcementFooter: '#BCSN #BASKETBALL #FAMILY',
  });

  // Multi-page automatic calculation (max 10 matches per day column per poster)
  const maxMatchesPerPage = 10;
  const totalSatPages = Math.ceil((config?.saturdayMatches?.length || 0) / maxMatchesPerPage) || 1;
  const totalSunPages = Math.ceil((config?.sundayMatches?.length || 0) / maxMatchesPerPage) || 1;
  const totalProgramPages = Math.max(totalSatPages, totalSunPages);

  const canvasRef = useRef(null);
  const selectedMember = members.find(m => m.id === config.selectedMemberId);
  const customLogos = customAssets.filter(a => a.type === 'logo');

  // -------------------------------------------------------------
  // MATCH MANAGEMENT LOGIC
  // -------------------------------------------------------------
  const handleAddSaturdayMatch = () => {
    const newM = { id: `sat-${Date.now()}`, category: 'NOUVELLE ÉQUIPE', time: '15h00', opponent: 'vs ADVERSAIRE', isHome: true };
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

  const handleAddSundayMatch = () => {
    const newM = { id: `sun-${Date.now()}`, category: 'NOUVELLE ÉQUIPE', time: '14h30', opponent: 'vs ADVERSAIRE', isHome: true };
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

  // Import calendar matches in 1 click
  const handleImportCalendar = () => {
    if (!events || events.length === 0) {
      alert('Aucun événement enregistré dans le calendrier.');
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
      const dayOfWeek = dateObj ? dateObj.getDay() : null;
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

    setConfig(prev => ({
      ...prev,
      saturdayMatches: newSat.length > 0 ? newSat : prev.saturdayMatches,
      sundayMatches: newSun.length > 0 ? newSun : prev.sundayMatches,
    }));
    setCurrentProgramPage(1);
    alert(`Importation réussie : ${newSat.length} matchs le samedi, ${newSun.length} matchs le dimanche !`);
  };

  // Export active visual
  const handleDownload = async (pageToExport = currentProgramPage) => {
    const node = canvasRef.current;
    if (!node) return;
    setIsExporting(true);
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
      const pageSuffix = totalProgramPages > 1 && selectedTemplate.id === 'weekend_program' ? `-page${pageToExport}` : '';
      link.download = `bcsn-${selectedTemplate.id}${pageSuffix}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Erreur export PNG:', err);
      alert("Erreur lors de l'exportation du visuel.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export all pages sequentially (Carrousel Multi-Images)
  const handleDownloadAllPages = async () => {
    if (totalProgramPages <= 1 || selectedTemplate.id !== 'weekend_program') {
      handleDownload(1);
      return;
    }
    setIsExporting(true);
    const initialPage = currentProgramPage;
    try {
      const { default: html2canvas } = await import('html2canvas');
      for (let p = 1; p <= totalProgramPages; p++) {
        setCurrentProgramPage(p);
        await new Promise(r => setTimeout(r, 260));
        const node = canvasRef.current;
        if (node) {
          const canvas = await html2canvas(node, { 
            backgroundColor: null, 
            scale: 3.5, 
            useCORS: true,
            logging: false,
            allowTaint: true
          });
          const link = document.createElement('a');
          link.download = `bcsn-programme-partie${p}-sur-${totalProgramPages}-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      }
    } catch (err) {
      console.error('Erreur export multi-pages:', err);
      alert("Erreur lors de l'exportation de toutes les pages.");
    } finally {
      setCurrentProgramPage(initialPage);
      setIsExporting(false);
    }
  };

  // Caption generator
  const generateCaption = () => {
    const hashtag = "#BCSN #BasketClubStNicolas #Basketball #TeamBCSN #FFBB #VertEtBlanc";
    switch (selectedTemplate.id) {
      case 'weekend_program':
        return `🔥 PROGRAMME DU WEEK-END 🔥\n\n` +
          `📅 SAMEDI :\n` +
          config.saturdayMatches.map(m => `🏀 ${m.category} | ${m.time} | ${m.opponent} (${m.isHome ? 'DOMICILE' : 'EXTÉRIEUR'})`).join('\n') +
          `\n\n📅 DIMANCHE :\n` +
          config.sundayMatches.map(m => `🏀 ${m.category} | ${m.time} | ${m.opponent} (${m.isHome ? 'DOMICILE' : 'EXTÉRIEUR'})`).join('\n') +
          (totalProgramPages > 1 ? `\n\n👉 Faites glisser le carrousel pour voir toutes les affiches (Parties 1 à ${totalProgramPages}) ! 📲` : '') +
          `\n\n📍 Venez nombreux enflammer le gymnase et encourager nos équipes ! 💚🤍\n\n${hashtag}`;

      case 'match_day':
        return `⚡ JOUR DE MATCH / GAME DAY ⚡\n\n` +
          `🏆 ${config.matchCompetition}\n` +
          `🏀 ${config.matchCategory} : ${config.matchHomeTeam} vs ${config.matchAwayTeam}\n` +
          `📅 ${config.matchDate ? new Date(config.matchDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Ce week-end'} à ${config.matchTime}\n` +
          `📍 Lieu : ${config.matchVenue}\n\n` +
          `Tous derrière le BCSN ! Venez faire du bruit ! 💚🤍\n\n${hashtag}`;

      case 'result':
        return `${config.isVictory ? '🔥 VICTOIRE DU BCSN ! 🔥' : 'FIN DU MATCH'}\n\n` +
          `${config.resultCategory}\n` +
          `Score Final : ${config.resultHomeTeam} ${config.scoreHome} - ${config.scoreAway} ${config.resultAwayTeam}\n` +
          `${config.resultDetails ? `${config.resultDetails}\n` : ''}\n` +
          `Bravo à l'équipe pour cette prestation !\n\n${hashtag}`;

      case 'player_mvp':
        return `⭐ MVP DU MATCH ⭐\n\n` +
          `Félicitations à ${selectedMember ? selectedMember.name : 'notre joueur'} #${config.playerNumber} pour cette grosse performance !\n` +
          `📊 Statistiques du match :\n` +
          `• ${config.stat1Value} ${config.stat1Label}\n` +
          `• ${config.stat2Value} ${config.stat2Label}\n` +
          `• ${config.stat3Value} ${config.stat3Label}\n` +
          `• ${config.stat4Value} ${config.stat4Label}\n\n` +
          `Let's go BCSN ! 💚🤍\n\n${hashtag}`;

      default:
        return `📢 ${config.announcementTitle}\n\n${config.announcementBody}\n\n${hashtag}`;
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generateCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // -------------------------------------------------------------
  // GRAPHIC RENDERING ENGINES (PRO LEVEL)
  // -------------------------------------------------------------
  
  // 1. PROGRAMME DU WEEK-END
  const renderWeekendProgramGraphic = () => {
    const isDark = selectedTheme.id === 'dark_arena';
    const isStory = selectedFormat.id === 'story';
    const isPost = selectedFormat.id === 'post';

    const safePage = Math.min(Math.max(currentProgramPage, 1), totalProgramPages);
    const paginatedSatMatches = config.saturdayMatches.slice((safePage - 1) * maxMatchesPerPage, safePage * maxMatchesPerPage);
    const paginatedSunMatches = config.sundayMatches.slice((safePage - 1) * maxMatchesPerPage, safePage * maxMatchesPerPage);
    const maxCount = Math.max(paginatedSatMatches.length, paginatedSunMatches.length);
    const isDense = maxCount > 6;
    const isUltraDense = maxCount > 8;

    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: isDark ? '#0A0D12' : '#FFFFFF',
        backgroundImage: isDark 
          ? 'radial-gradient(circle at 50% 20%, #111A24 0%, #07090C 100%)' 
          : `url(${fondImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isStory ? (isDense ? '24px 16px 14px 16px' : '32px 18px 18px 18px') : isPost ? '14px 12px' : (isDense ? '14px 16px 10px 16px' : '20px 18px 16px 18px'),
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: isDark ? '#FFFFFF' : '#1E293B'
      }}>
        {/* HEADER BRANDING : 100% DROIT & CENTRÉ */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: isDense ? 3 : 6 }}>
          {/* Logo officiel du club */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isDense ? 2 : 4 }}>
            <BcsnOfficialLogo isDark={isDark} size={isUltraDense ? 48 : isDense ? 54 : (isStory ? 68 : isPost ? 54 : 62)} customLogoUrl={customLogoUrl} />
          </div>

          {/* Titre Principal + Badge Multi-Page */}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: isStory ? (isDense ? 32 : 38) : isPost ? 26 : (isDense ? 28 : 34),
            lineHeight: 1,
            letterSpacing: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <span style={{ color: isDark ? '#10B981' : homeColor }}>{config.programTitleMain}</span>
            <span style={{ color: awayColor }}>{config.programTitleSub}</span>
            {totalProgramPages > 1 && (
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontStyle: 'normal',
                fontSize: 9.5,
                fontWeight: 900,
                background: '#D62828',
                color: '#FFFFFF',
                padding: '1px 6px',
                borderRadius: 4,
                letterSpacing: 0.5,
                marginLeft: 4,
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}>
                PARTIE {safePage}/{totalProgramPages}
              </span>
            )}
          </div>

          {/* Social Ribbon : Rectiligne & Élégant */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: isDense ? 8 : 10,
            background: isDark ? 'rgba(16,185,129,0.18)' : '#0B4D3B',
            color: '#FFFFFF',
            border: isDark ? '1px solid rgba(16,185,129,0.4)' : 'none',
            borderRadius: 5,
            padding: isDense ? '2px 10px' : '3px 14px',
            marginTop: isDense ? 2 : 4,
            fontSize: isDense ? 8.5 : 9.5,
            fontWeight: 800,
            letterSpacing: 0.5,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:basketball-bold" width={isDense ? "11" : "13"} height={isDense ? "11" : "13"} color="#FFFFFF" />
              <span>{config.clubSocialName}</span>
            </div>
            <span style={{ opacity: 0.5 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:instagram-logo-bold" width={isDense ? "11" : "13"} height={isDense ? "11" : "13"} color="#FFFFFF" />
              <span>{config.clubInstagram}</span>
            </div>
          </div>
        </div>

        {/* 2 COLONNES (SAMEDI & DIMANCHE) : PARFAITEMENT ALIGNÉES */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: isDense ? 8 : 10,
          flex: 1,
          margin: isDense ? '2px 0 4px 0' : '4px 0 8px 0',
          alignItems: 'start',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* SAMEDI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isUltraDense ? 2 : isDense ? 3 : 5, minWidth: 0 }}>
            {/* Header Samedi */}
            <div style={{
              background: isDark ? '#10B981' : '#0B4D3B',
              color: isDark ? '#000000' : '#FFFFFF',
              borderRadius: 5,
              padding: isDense ? '3px 8px' : '4px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Icon icon="ph:calendar-blank-bold" width={isDense ? "12" : "14"} height={isDense ? "12" : "14"} />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontStyle: 'italic', fontSize: isDense ? 14 : 16, letterSpacing: 1.5, fontWeight: 900, lineHeight: 1 }}>
                SAMEDI
              </span>
            </div>

            {/* List of Saturday Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isUltraDense ? 2 : isDense ? 2.5 : 4 }}>
              {paginatedSatMatches.map((m) => {
                const matchColor = m.isHome ? (isDark ? '#10B981' : homeColor) : awayColor;
                return (
                  <div key={m.id} style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                    borderRadius: 6,
                    padding: isUltraDense ? '1.5px 4px' : isDense ? '2.5px 5px' : '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                    minHeight: isUltraDense ? 23 : isDense ? 25 : 30,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3.5, overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <div style={{ width: isUltraDense ? 16 : isDense ? 18 : 20, height: isUltraDense ? 16 : isDense ? 18 : 20, borderRadius: '50%', background: matchColor, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon icon="ph:basketball-bold" width={isUltraDense ? "10" : isDense ? "11" : "12"} height={isUltraDense ? "10" : isDense ? "11" : "12"} color="#FFFFFF" />
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isUltraDense ? 12 : isDense ? 12.5 : 13.5, fontWeight: 900, color: matchColor, letterSpacing: 0.3, whiteSpace: 'nowrap', lineHeight: 1, flexShrink: 0 }}>
                        {m.category}
                      </div>
                      <span style={{ color: isDark ? '#4B5563' : '#CBD5E1', fontSize: 8 }}>|</span>
                      <div style={{ fontSize: isUltraDense ? 7.5 : isDense ? 8 : 8.5, fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>
                        {m.time}
                      </div>
                      <div style={{ fontSize: isUltraDense ? 7.5 : isDense ? 8 : 8.5, fontWeight: 600, color: isDark ? '#94A3B8' : '#334155', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }}>
                        {m.opponent}
                      </div>
                    </div>

                    {/* Right Dom/Ext Pill */}
                    <div style={{
                      background: matchColor,
                      color: '#FFFFFF',
                      borderRadius: 3,
                      padding: isUltraDense ? '1px 4px' : '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      flexShrink: 0
                    }}>
                      <Icon icon={m.isHome ? "ph:house-line-bold" : "ph:map-pin-bold"} width="7" height="7" color="#FFFFFF" />
                      <span style={{ fontSize: isUltraDense ? 6 : 6.5, fontWeight: 900, letterSpacing: 0.2, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {m.isHome ? 'DOM' : 'EXT'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {paginatedSatMatches.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: 10, opacity: 0.5, padding: 6, fontStyle: 'italic' }}>
                  Aucun match le samedi
                </div>
              )}
            </div>
          </div>

          {/* DIMANCHE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isUltraDense ? 2 : isDense ? 3 : 5, minWidth: 0 }}>
            {/* Header Dimanche */}
            <div style={{
              background: isDark ? '#10B981' : '#0B4D3B',
              color: isDark ? '#000000' : '#FFFFFF',
              borderRadius: 5,
              padding: isDense ? '3px 8px' : '4px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Icon icon="ph:calendar-blank-bold" width={isDense ? "12" : "14"} height={isDense ? "12" : "14"} />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontStyle: 'italic', fontSize: isDense ? 14 : 16, letterSpacing: 1.5, fontWeight: 900, lineHeight: 1 }}>
                DIMANCHE
              </span>
            </div>

            {/* List of Sunday Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isUltraDense ? 2 : isDense ? 2.5 : 4 }}>
              {paginatedSunMatches.map((m) => {
                const matchColor = m.isHome ? (isDark ? '#10B981' : homeColor) : awayColor;
                return (
                  <div key={m.id} style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                    borderRadius: 6,
                    padding: isUltraDense ? '1.5px 4px' : isDense ? '2.5px 5px' : '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                    minHeight: isUltraDense ? 23 : isDense ? 25 : 30,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3.5, overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <div style={{ width: isUltraDense ? 16 : isDense ? 18 : 20, height: isUltraDense ? 16 : isDense ? 18 : 20, borderRadius: '50%', background: matchColor, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon icon="ph:basketball-bold" width={isUltraDense ? "10" : isDense ? "11" : "12"} height={isUltraDense ? "10" : isDense ? "11" : "12"} color="#FFFFFF" />
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isUltraDense ? 12 : isDense ? 12.5 : 13.5, fontWeight: 900, color: matchColor, letterSpacing: 0.3, whiteSpace: 'nowrap', lineHeight: 1, flexShrink: 0 }}>
                        {m.category}
                      </div>
                      <span style={{ color: isDark ? '#4B5563' : '#CBD5E1', fontSize: 8 }}>|</span>
                      <div style={{ fontSize: isUltraDense ? 7.5 : isDense ? 8 : 8.5, fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>
                        {m.time}
                      </div>
                      <div style={{ fontSize: isUltraDense ? 7.5 : isDense ? 8 : 8.5, fontWeight: 600, color: isDark ? '#94A3B8' : '#334155', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }}>
                        {m.opponent}
                      </div>
                    </div>

                    {/* Right Dom/Ext Pill */}
                    <div style={{
                      background: matchColor,
                      color: '#FFFFFF',
                      borderRadius: 3,
                      padding: isUltraDense ? '1px 4px' : '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      flexShrink: 0
                    }}>
                      <Icon icon={m.isHome ? "ph:house-line-bold" : "ph:map-pin-bold"} width="7" height="7" color="#FFFFFF" />
                      <span style={{ fontSize: isUltraDense ? 6 : 6.5, fontWeight: 900, letterSpacing: 0.2, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {m.isHome ? 'DOM' : 'EXT'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {paginatedSunMatches.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: 10, opacity: 0.5, padding: 6, fontStyle: 'italic' }}>
                  Aucun match le dimanche
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Légende Salles : Rectiligne & Centré */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.6)' : '#FFFFFF',
            borderRadius: 5,
            padding: isDense ? '3px 10px' : '4px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: isDense ? 8 : 12,
            fontSize: isDense ? 8 : 9,
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: isDark ? '#10B981' : '#0B4D3B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:house-line-bold" width="8" height="8" color={isDark ? '#000' : '#FFF'} />
              </div>
              <span style={{ color: isDark ? '#10B981' : '#0B4D3B', fontWeight: 900, textTransform: 'uppercase', fontSize: isDense ? 7.5 : 8.5 }}>DOMICILE :</span>
              <span style={{ color: isDark ? '#CBD5E1' : '#475569', fontWeight: 600 }}>{config.venueHome}</span>
            </div>
            <span style={{ color: isDark ? '#4B5563' : '#CBD5E1' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#D62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:map-pin-bold" width="8" height="8" color="#FFFFFF" />
              </div>
              <span style={{ color: '#D62828', fontWeight: 900, textTransform: 'uppercase', fontSize: isDense ? 7.5 : 8.5 }}>EXTÉRIEUR :</span>
              <span style={{ color: isDark ? '#CBD5E1' : '#475569', fontWeight: 600 }}>{config.venueAway}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. JOUR DE MATCH (GAME DAY)
  const renderMatchDayGraphic = () => {
    const isStory = selectedFormat.id === 'story';
    return (
      <div style={{
        width: '100%', height: '100%',
        backgroundColor: '#07090E',
        backgroundImage: 'radial-gradient(circle at 50% 30%, #0E1A16 0%, #05070A 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: isStory ? '40px 24px' : '26px 20px',
        color: '#FFFFFF', fontFamily: "'Outfit', sans-serif"
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BcsnOfficialLogo isDark size={46} customLogoUrl={customLogoUrl} />
          <div style={{ background: '#10B981', color: '#000000', fontWeight: 900, fontSize: 10, padding: '4px 10px', borderRadius: 4, letterSpacing: 1 }}>
            {config.matchCompetition}
          </div>
        </div>

        {/* Center Clash Area */}
        <div style={{ textAlign: 'center', margin: '14px 0' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isStory ? 54 : 44, fontStyle: 'italic', letterSpacing: 3, lineHeight: 0.9, color: '#10B981', textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
            JOUR DE MATCH
          </div>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8, marginTop: 4 }}>
            {config.matchCategory}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '20px 0' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 12, border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981' }}>{config.matchHomeTeam}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>DOMICILE</div>
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, fontStyle: 'italic', color: '#D62828' }}>VS</div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900 }}>{config.matchAwayTeam}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>EXTÉRIEUR</div>
            </div>
          </div>

          {/* Info Card */}
          <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: '10px 16px', display: 'inline-flex', flexDirection: 'column', gap: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800 }}>
              <Icon icon="ph:calendar-bold" width="16" height="16" color="#10B981" />
              <span>{config.matchDate ? new Date(config.matchDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Ce week-end'} à {config.matchTime}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.8 }}>
              <Icon icon="ph:map-pin-bold" width="14" height="14" color="#D62828" />
              <span>{config.matchVenue}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
          <span>#BCSN #GAMEDAY</span>
          <span>BASKET CLUB ST NICOLAS</span>
        </div>
      </div>
    );
  };

  // 3. RÉSULTAT & SCORE
  const renderResultGraphic = () => {
    return (
      <div style={{
        width: '100%', height: '100%',
        backgroundColor: '#070A0F',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #10241B 0%, #06090D 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '24px 20px', color: '#FFFFFF', fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BcsnOfficialLogo isDark size={46} customLogoUrl={customLogoUrl} />
          <div style={{
            background: config.isVictory ? '#10B981' : '#EF4444',
            color: '#000', fontWeight: 900, fontSize: 11, padding: '4px 12px', borderRadius: 4, letterSpacing: 1
          }}>
            {config.isVictory ? 'VICTOIRE' : 'FIN DE MATCH'}
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: 'auto 0' }}>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>
            {config.resultCategory}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)', padding: '12px 10px', borderRadius: 12, border: `2px solid ${config.isVictory ? '#10B981' : 'rgba(255,255,255,0.1)'}` }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{config.resultHomeTeam}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, fontWeight: 900, color: config.isVictory ? '#10B981' : '#FFF', lineHeight: 1 }}>
                {config.scoreHome}
              </div>
            </div>

            <div style={{ fontSize: 18, fontWeight: 900, opacity: 0.4 }}>-</div>

            <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)', padding: '12px 10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{config.resultAwayTeam}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
                {config.scoreAway}
              </div>
            </div>
          </div>

          {config.resultDetails && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '6px 12px', display: 'inline-block', marginTop: 14, fontSize: 10, opacity: 0.85 }}>
              {config.resultDetails}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
          <span>#BCSN #VICTOIRE</span>
          <span>BASKET CLUB ST NICOLAS</span>
        </div>
      </div>
    );
  };

  // 4. MVP / CARTE JOUEUR
  const renderMvpGraphic = () => {
    return (
      <div style={{
        width: '100%', height: '100%',
        backgroundColor: '#07090E',
        backgroundImage: 'radial-gradient(circle at 50% 30%, #1A132F 0%, #06070B 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '24px 20px', color: '#FFFFFF', fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BcsnOfficialLogo isDark size={46} customLogoUrl={customLogoUrl} />
          <div style={{ background: '#8B5CF6', color: '#FFF', fontWeight: 900, fontSize: 10, padding: '4px 10px', borderRadius: 4, letterSpacing: 1 }}>
            MVP DU MATCH
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: 'auto 0' }}>
          <div style={{
            width: 100, height: 100, borderRadius: 16, background: '#131826',
            border: '2px solid #8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 20px rgba(139,92,246,0.3)'
          }}>
            {selectedMember && selectedMember.photo ? (
              <img src={selectedMember.photo} alt={selectedMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ fontSize: 28, fontWeight: 900, color: '#8B5CF6' }}>
                {selectedMember ? getInitials(selectedMember.name) : 'BCSN'}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 900, textTransform: 'uppercase' }}>
              {selectedMember ? selectedMember.name : 'Nom du Joueur'}
              <span style={{ color: '#8B5CF6', marginLeft: 6 }}>#{config.playerNumber}</span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 10 }}>{config.playerPosition}</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#8B5CF6' }}>{config.stat1Value}</div>
                <div style={{ fontSize: 7, opacity: 0.7 }}>{config.stat1Label}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#8B5CF6' }}>{config.stat2Value}</div>
                <div style={{ fontSize: 7, opacity: 0.7 }}>{config.stat2Label}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#8B5CF6' }}>{config.stat3Value}</div>
                <div style={{ fontSize: 7, opacity: 0.7 }}>{config.stat3Label}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#8B5CF6' }}>{config.stat4Value}</div>
                <div style={{ fontSize: 7, opacity: 0.7 }}>{config.stat4Label}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
          <span>#BCSN #MVP #PERFORMANCE</span>
          <span>BASKET CLUB ST NICOLAS</span>
        </div>
      </div>
    );
  };

  // 5. FLASH INFO / ANNONCE
  const renderAnnouncementGraphic = () => {
    return (
      <div style={{
        width: '100%', height: '100%',
        backgroundColor: '#070C12',
        backgroundImage: 'radial-gradient(circle at 50% 30%, #0E2438 0%, #05080E 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '26px 20px', color: '#FFFFFF', fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BcsnOfficialLogo isDark size={46} customLogoUrl={customLogoUrl} />
          <div style={{ background: '#0284C7', color: '#FFF', fontWeight: 900, fontSize: 10, padding: '4px 10px', borderRadius: 4, letterSpacing: 1 }}>
            {config.announcementTag}
          </div>
        </div>

        <div style={{ textAlign: 'center', margin: 'auto 0', padding: '0 10px' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, fontStyle: 'italic', letterSpacing: 1.5, color: '#0284C7', marginBottom: 10 }}>
            {config.announcementTitle}
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, opacity: 0.9, maxWidth: 360, margin: '0 auto' }}>
            {config.announcementBody}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
          <span>{config.announcementFooter}</span>
          <span>BASKET CLUB ST NICOLAS</span>
        </div>
      </div>
    );
  };

  // Master Graphic Renderer
  const renderActiveVisual = () => {
    switch (selectedTemplate.id) {
      case 'weekend_program': return renderWeekendProgramGraphic();
      case 'match_day': return renderMatchDayGraphic();
      case 'result': return renderResultGraphic();
      case 'player_mvp': return renderMvpGraphic();
      case 'announcement': return renderAnnouncementGraphic();
      default: return renderWeekendProgramGraphic();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ========================================================= */}
      {/* TOP HEADER : STUDIO PRO & TEMPLATE SELECTOR */}
      {/* ========================================================= */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0B4D3B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon icon="ph:paint-brush-broad-bold" width="18" height="18" color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                BCSN Studio Pro
                <span style={{ fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>v2.0</span>
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Créez et exportez des visuels sportifs haute fidélité en 3 étapes simples</p>
            </div>
          </div>
        </div>

        {/* Template Buttons Carousel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {TEMPLATES.map((t) => {
            const isSelected = selectedTemplate.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                style={{
                  background: isSelected ? 'rgba(16,185,129,0.12)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid #10B981' : '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: isSelected ? t.color : 'rgba(255,255,255,0.06)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon icon={t.icon} width="18" height="18" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? '#FFFFFF' : 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN STUDIO WORKSPACE : LEFT TOOLS / RIGHT HD LIVE CANVAS */}
      {/* ========================================================= */}
      <div className="grid-2" style={{ alignItems: 'start', gap: 16 }}>
        
        {/* LEFT PANEL : STUDIO WORKBENCH */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* ÉTAPE 1 : FORMAT DU VISUEL */}
          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, marginBottom: 8 }}>
              <Icon icon="ph:aspect-ratio-bold" width="16" height="16" color="var(--primary-light)" />
              1. Format du Visuel (Réseaux Sociaux)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {FORMATS.map(f => {
                const isSelected = selectedFormat.id === f.id;
                return (
                  <button
                    key={f.id}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedFormat(f)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', gap: 2 }}
                  >
                    <Icon icon={f.icon} width="16" height="16" />
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ÉTAPE 2 : AMBIANCE GRAPHIQUE */}
          {selectedTemplate.id === 'weekend_program' && (
            <div>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, marginBottom: 8 }}>
                <Icon icon="ph:palette-bold" width="16" height="16" color="var(--primary-light)" />
                2. Style Graphique & Ambiance
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {THEMES.slice(0, 2).map(th => {
                  const isSelected = selectedTheme.id === th.id;
                  return (
                    <button
                      key={th.id}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSelectedTheme(th)}
                      style={{ fontSize: 11, fontWeight: 700, padding: 8 }}
                    >
                      {th.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : ÉDITION DU CONTENU (ADAPTATIF PAR TEMPLATE) */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, marginBottom: 10 }}>
              <Icon icon="ph:pencil-simple-bold" width="16" height="16" color="var(--primary-light)" />
              3. Données & Contenu du Visuel
            </label>

            {/* TEMPLATE 1 : PROGRAMME WEEK-END */}
            {selectedTemplate.id === 'weekend_program' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* 1-Click Import Button */}
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleImportCalendar} 
                  style={{ width: '100%', justifyContent: 'center', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700 }}
                >
                  <Zap size={14} /> Importer automatiquement les matchs du Calendrier
                </button>

                {/* Day Switcher */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className={`btn btn-sm ${activeDayTab === 'saturday' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveDayTab('saturday')}
                    style={{ flex: 1, fontWeight: 700 }}
                  >
                    Samedi ({config.saturdayMatches.length})
                  </button>
                  <button
                    className={`btn btn-sm ${activeDayTab === 'sunday' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveDayTab('sunday')}
                    style={{ flex: 1, fontWeight: 700 }}
                  >
                    Dimanche ({config.sundayMatches.length})
                  </button>
                </div>

                {/* Samedi Matches */}
                {activeDayTab === 'saturday' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {config.saturdayMatches.map((m, idx) => (
                      <div key={m.id} style={{ background: 'var(--bg-card)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input className="input" style={{ width: 80, fontSize: 11, padding: 4 }} value={m.category} onChange={e => handleUpdateSaturdayMatch(m.id, 'category', e.target.value)} placeholder="Catégorie" />
                        <input className="input" style={{ width: 65, fontSize: 11, padding: 4 }} value={m.time} onChange={e => handleUpdateSaturdayMatch(m.id, 'time', e.target.value)} placeholder="Heure" />
                        <input className="input" style={{ flex: 1, fontSize: 11, padding: 4 }} value={m.opponent} onChange={e => handleUpdateSaturdayMatch(m.id, 'opponent', e.target.value)} placeholder="Adversaire" />
                        <button
                          className="btn btn-sm"
                          style={{
                            fontSize: 9, padding: '3px 6px',
                            background: m.isHome ? 'rgba(11,77,59,0.2)' : 'rgba(214,40,40,0.2)',
                            color: m.isHome ? '#10B981' : '#D62828',
                            border: `1px solid ${m.isHome ? '#10B981' : '#D62828'}`
                          }}
                          onClick={() => handleUpdateSaturdayMatch(m.id, 'isHome', !m.isHome)}
                        >
                          {m.isHome ? 'DOM' : 'EXT'}
                        </button>
                        {config.saturdayMatches.length > 1 && (
                          <button onClick={() => handleRemoveSaturdayMatch(m.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2 }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" onClick={handleAddSaturdayMatch} style={{ justifyContent: 'center' }}>
                      <Plus size={13} /> Ajouter un match Samedi
                    </button>
                  </div>
                )}

                {/* Dimanche Matches */}
                {activeDayTab === 'sunday' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {config.sundayMatches.map((m, idx) => (
                      <div key={m.id} style={{ background: 'var(--bg-card)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input className="input" style={{ width: 80, fontSize: 11, padding: 4 }} value={m.category} onChange={e => handleUpdateSundayMatch(m.id, 'category', e.target.value)} placeholder="Catégorie" />
                        <input className="input" style={{ width: 65, fontSize: 11, padding: 4 }} value={m.time} onChange={e => handleUpdateSundayMatch(m.id, 'time', e.target.value)} placeholder="Heure" />
                        <input className="input" style={{ flex: 1, fontSize: 11, padding: 4 }} value={m.opponent} onChange={e => handleUpdateSundayMatch(m.id, 'opponent', e.target.value)} placeholder="Adversaire" />
                        <button
                          className="btn btn-sm"
                          style={{
                            fontSize: 9, padding: '3px 6px',
                            background: m.isHome ? 'rgba(11,77,59,0.2)' : 'rgba(214,40,40,0.2)',
                            color: m.isHome ? '#10B981' : '#D62828',
                            border: `1px solid ${m.isHome ? '#10B981' : '#D62828'}`
                          }}
                          onClick={() => handleUpdateSundayMatch(m.id, 'isHome', !m.isHome)}
                        >
                          {m.isHome ? 'DOM' : 'EXT'}
                        </button>
                        {config.sundayMatches.length > 1 && (
                          <button onClick={() => handleRemoveSundayMatch(m.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2 }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" onClick={handleAddSundayMatch} style={{ justifyContent: 'center' }}>
                      <Plus size={13} /> Ajouter un match Dimanche
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATE 2 : MATCH DAY */}
            {selectedTemplate.id === 'match_day' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="grid-2">
                  <input className="input" value={config.matchCategory} onChange={e => setConfig({...config, matchCategory: e.target.value})} placeholder="Catégorie (ex: SÉNIORS A)" />
                  <input className="input" value={config.matchCompetition} onChange={e => setConfig({...config, matchCompetition: e.target.value})} placeholder="Compétition" />
                </div>
                <div className="grid-2">
                  <input className="input" value={config.matchHomeTeam} onChange={e => setConfig({...config, matchHomeTeam: e.target.value})} placeholder="Équipe Domicile" />
                  <input className="input" value={config.matchAwayTeam} onChange={e => setConfig({...config, matchAwayTeam: e.target.value})} placeholder="Équipe Extérieure" />
                </div>
                <div className="grid-2">
                  <input className="input" type="date" value={config.matchDate} onChange={e => setConfig({...config, matchDate: e.target.value})} />
                  <input className="input" value={config.matchTime} onChange={e => setConfig({...config, matchTime: e.target.value})} placeholder="Heure (ex: 20:30)" />
                </div>
                <input className="input" value={config.matchVenue} onChange={e => setConfig({...config, matchVenue: e.target.value})} placeholder="Lieu / Gymnase" />
              </div>
            )}

            {/* TEMPLATE 3 : RESULT */}
            {selectedTemplate.id === 'result' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="grid-2">
                  <input className="input" value={config.resultCategory} onChange={e => setConfig({...config, resultCategory: e.target.value})} placeholder="Catégorie" />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className={`btn btn-sm ${config.isVictory ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setConfig({...config, isVictory: true})} style={{ flex: 1 }}>Victoire</button>
                    <button className={`btn btn-sm ${!config.isVictory ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setConfig({...config, isVictory: false})} style={{ flex: 1 }}>Défaite</button>
                  </div>
                </div>
                <div className="grid-2">
                  <input className="input" value={config.resultHomeTeam} onChange={e => setConfig({...config, resultHomeTeam: e.target.value})} placeholder="Équipe 1" />
                  <input className="input" value={config.resultAwayTeam} onChange={e => setConfig({...config, resultAwayTeam: e.target.value})} placeholder="Équipe 2" />
                </div>
                <div className="grid-2">
                  <input className="input" type="number" value={config.scoreHome} onChange={e => setConfig({...config, scoreHome: e.target.value})} placeholder="Score 1" />
                  <input className="input" type="number" value={config.scoreAway} onChange={e => setConfig({...config, scoreAway: e.target.value})} placeholder="Score 2" />
                </div>
                <input className="input" value={config.resultDetails} onChange={e => setConfig({...config, resultDetails: e.target.value})} placeholder="Détails Q1 à Q4" />
              </div>
            )}

            {/* TEMPLATE 4 : MVP */}
            {selectedTemplate.id === 'player_mvp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select className="input select" value={config.selectedMemberId} onChange={e => setConfig({...config, selectedMemberId: e.target.value})}>
                  <option value="">-- Choisir un joueur dans l'effectif BDD --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.team || m.role || 'Joueur'})</option>
                  ))}
                </select>
                <div className="grid-2">
                  <input className="input" value={config.playerNumber} onChange={e => setConfig({...config, playerNumber: e.target.value})} placeholder="Numéro # (ex: 10)" />
                  <input className="input" value={config.playerPosition} onChange={e => setConfig({...config, playerPosition: e.target.value})} placeholder="Poste de jeu" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input className="input" style={{ width: '60%' }} value={config.stat1Label} onChange={e => setConfig({...config, stat1Label: e.target.value})} />
                    <input className="input" style={{ width: '40%' }} value={config.stat1Value} onChange={e => setConfig({...config, stat1Value: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input className="input" style={{ width: '60%' }} value={config.stat2Label} onChange={e => setConfig({...config, stat2Label: e.target.value})} />
                    <input className="input" style={{ width: '40%' }} value={config.stat2Value} onChange={e => setConfig({...config, stat2Value: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {/* TEMPLATE 5 : ANNONCE */}
            {selectedTemplate.id === 'announcement' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input className="input" value={config.announcementTag} onChange={e => setConfig({...config, announcementTag: e.target.value})} placeholder="Badge haut" />
                <input className="input" value={config.announcementTitle} onChange={e => setConfig({...config, announcementTitle: e.target.value})} placeholder="Titre principal" />
                <textarea className="input textarea" rows={3} value={config.announcementBody} onChange={e => setConfig({...config, announcementBody: e.target.value})} placeholder="Message" />
              </div>
            )}
          </div>

          {/* LÉGENDE RÉSEAUX SOCIAUX EN BAS DU PANEL */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon icon="ph:instagram-logo-bold" width="14" height="14" color="#E1306C" />
                Légende Prête pour Instagram
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyCaption} style={{ fontSize: 11, padding: '2px 8px' }}>
                {copiedCaption ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                {copiedCaption ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <textarea
              className="input textarea"
              value={generateCaption()}
              readOnly
              rows={3}
              style={{ fontSize: 11, fontFamily: 'monospace', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        {/* RIGHT PANEL : LIVE HD CANVAS PREVIEW */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon icon="ph:eye-bold" width="18" height="18" color="var(--primary-light)" />
              <span style={{ fontWeight: 800, fontSize: 14 }}>Aperçu HD Live ({selectedFormat.label})</span>
            </div>

            {/* Export Buttons */}
            {selectedTemplate.id === 'weekend_program' && totalProgramPages > 1 ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleDownload(currentProgramPage)} 
                  disabled={isExporting}
                  style={{ fontWeight: 700 }}
                >
                  <Download size={14} /> Page {currentProgramPage}
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={handleDownloadAllPages} 
                  disabled={isExporting}
                  style={{ boxShadow: '0 4px 14px rgba(11,77,59,0.35)', fontWeight: 800 }}
                >
                  {isExporting ? <RefreshCw size={14} className="spin" /> : <Layers size={14} />}
                  {isExporting ? 'Export...' : `Exporter Tout (${totalProgramPages} PNGs)`}
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={() => handleDownload(1)} 
                disabled={isExporting}
                style={{ boxShadow: '0 4px 14px rgba(11,77,59,0.35)', fontWeight: 800 }}
              >
                {isExporting ? <RefreshCw size={15} className="spin" /> : <Download size={15} />}
                {isExporting ? 'Génération...' : 'Exporter PNG 4K'}
              </button>
            )}
          </div>

          {/* Multi-Page Navigation Bar if matches exceed 1 poster */}
          {selectedTemplate.id === 'weekend_program' && totalProgramPages > 1 && (
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
              padding: '6px 12px',
              borderRadius: 8,
              gap: 8
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} />
                <span>{config.saturdayMatches.length + config.sundayMatches.length} matchs : 2 affiches générées automatiquement</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {Array.from({ length: totalProgramPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCur = currentProgramPage === pNum;
                  return (
                    <button
                      key={pNum}
                      className={`btn btn-sm ${isCur ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setCurrentProgramPage(pNum)}
                      style={{ fontSize: 10, padding: '2px 8px', fontWeight: 800 }}
                    >
                      Partie {pNum} / {totalProgramPages}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Master Canvas Container */}
          <div 
            ref={canvasRef}
            style={{
              width: selectedFormat.width,
              maxWidth: '100%',
              aspectRatio: selectedFormat.ratio,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.08)'
            }}
          >
            {renderActiveVisual()}
          </div>
        </div>

      </div>
    </div>
  );
}


