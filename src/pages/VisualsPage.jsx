import React, { useState, useRef } from 'react';
import { 
  Download, Copy, Check, Plus, Trash2, Zap, Shield, 
  Sparkles, Calendar, Trophy, Swords, Star, Megaphone,
  MapPin, Home, RefreshCw, Share2, Layers, Sliders, ChevronRight
} from 'lucide-react';
import { Icon } from '@iconify/react';
import { getInitials } from '../hooks/useLocalStorage';
import { formatMemberTeams } from '../utils/teamUtils';

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
  { 
    id: 'player_portrait', 
    name: 'Portrait Joueur de la Semaine', 
    badge: 'Nouveau',
    icon: 'ph:user-focus-bold', 
    desc: 'Portrait, statistiques & Q&A personnalisés',
    color: '#10B981'
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
  const [activeResultDayTab, setActiveResultDayTab] = useState('saturday'); // 'saturday' | 'sunday'
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

    // Result template (Récapitulatif des scores par jour)
    resultTitleMain: 'RÉSULTATS',
    resultTitleSub: 'DU WEEK-END',
    saturdayResults: [
      { id: 'res-sat-1', category: 'U11 F', opponent: 'vs ARRAS', score: '56-42', isVictory: true },
      { id: 'res-sat-2', category: 'U13 M', opponent: 'à DOUAI', score: '61-58', isVictory: true },
      { id: 'res-sat-3', category: 'U15 M', opponent: 'vs LIÉVIN', score: '48-63', isVictory: false },
      { id: 'res-sat-4', category: 'U17 F', opponent: 'à BÉTHUNE', score: '72-49', isVictory: true },
      { id: 'res-sat-5', category: 'U18 F', opponent: 'vs LENS', score: '59-47', isVictory: true },
      { id: 'res-sat-6', category: 'SENIORS A', opponent: 'vs DOUAI', score: '78-64', isVictory: true }
    ],
    sundayResults: [
      { id: 'res-sun-1', category: 'SENIORS B', opponent: 'à HÉNIN', score: '66-53', isVictory: true },
      { id: 'res-sun-2', category: 'U9', opponent: 'vs ARRAS', score: '34-18', isVictory: true },
      { id: 'res-sun-3', category: 'U11 M', opponent: 'à LIÉVIN', score: '32-50', isVictory: false },
      { id: 'res-sun-4', category: 'U13 F', opponent: 'vs BÉTHUNE', score: '41-55', isVictory: false },
      { id: 'res-sun-5', category: 'U15 F', opponent: 'à LENS', score: '60-44', isVictory: true },
      { id: 'res-sun-6', category: 'U18 M', opponent: 'vs DOUAI', score: '69-57', isVictory: true }
    ],

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

    // Portrait Joueur de la Semaine template
    portraitTitleMain: 'PORTRAIT',
    portraitTitleSub: 'DU JOUEUR',
    portraitTitleBadge: 'DE LA SEMAINE',
    portraitNumber: '7',
    portraitPlayerName: 'LÉO MARTIN',
    portraitCategory: 'U15 A',
    portraitPosition: 'POSTE MENEUR',
    portraitSeniority: 'AU CLUB DEPUIS 4 ANS',
    portraitQ1: 'POURQUOI LE BASKET ?',
    portraitA1: 'Pour le plaisir du jeu et l\'esprit d\'équipe.',
    portraitQ2: 'SON MEILLEUR SOUVENIR AVEC LE BCSN',
    portraitA2: 'La victoire en finale départementale U13 avec toute l\'équipe, un moment incroyable !',
    portraitQ3: 'SON OBJECTIF CETTE SAISON',
    portraitA3: 'Continuer à progresser et aider l\'équipe à aller le plus loin possible.',
    portraitQ4: 'SA MUSIQUE AVANT UN MATCH',
    portraitA4: 'Ninho, SDM, Gazo',
    portraitQ5: 'MOT POUR LES SUPPORTERS / LICENCIÉS',
    portraitA5: 'Hâte de vous retrouver au Complexe Bonne Humeur pour faire du bruit !',
    portraitSelectedMemberId: '',
  });

  // Multi-page automatic calculation (jusqu'à 11 matchs par colonne par affiche)
  const maxMatchesPerPage = 11;
  const totalSatPages = Math.ceil((config?.saturdayMatches?.length || 0) / maxMatchesPerPage) || 1;
  const totalSunPages = Math.ceil((config?.sundayMatches?.length || 0) / maxMatchesPerPage) || 1;
  const totalProgramPages = Math.max(totalSatPages, totalSunPages);

  // Multi-page automatic calculation for results (jusqu'à 11 résultats par jour par affiche)
  const maxResultsPerPage = 11;
  const totalSatResultPages = Math.ceil((config?.saturdayResults?.length || 0) / maxResultsPerPage) || 1;
  const totalSunResultPages = Math.ceil((config?.sundayResults?.length || 0) / maxResultsPerPage) || 1;
  const totalResultPages = Math.max(totalSatResultPages, totalSunResultPages);
  const [currentResultPage, setCurrentResultPage] = useState(1);

  const canvasRef = useRef(null);
  const selectedMember = members.find(m => m.id === config.selectedMemberId);
  const selectedPortraitMember = members.find(m => m.id === config.portraitSelectedMemberId);
  const customLogos = customAssets.filter(a => a.type === 'logo');

  // -------------------------------------------------------------
  // RESULT MANAGEMENT LOGIC (SAMEDI & DIMANCHE SÉPARÉS)
  // -------------------------------------------------------------
  const handleAddSaturdayResult = () => {
    const newR = { id: `res-sat-${Date.now()}`, category: 'NOUVELLE ÉQUIPE', opponent: 'vs ADVERSAIRE', score: '50-50', isVictory: true };
    setConfig(prev => ({ ...prev, saturdayResults: [...(prev.saturdayResults || []), newR] }));
  };

  const handleRemoveSaturdayResult = (id) => {
    setConfig(prev => ({ ...prev, saturdayResults: (prev.saturdayResults || []).filter(r => r.id !== id) }));
  };

  const handleUpdateSaturdayResult = (id, field, val) => {
    setConfig(prev => ({
      ...prev,
      saturdayResults: (prev.saturdayResults || []).map(r => r.id === id ? { ...r, [field]: val } : r)
    }));
  };

  const handleAddSundayResult = () => {
    const newR = { id: `res-sun-${Date.now()}`, category: 'NOUVELLE ÉQUIPE', opponent: 'vs ADVERSAIRE', score: '50-50', isVictory: true };
    setConfig(prev => ({ ...prev, sundayResults: [...(prev.sundayResults || []), newR] }));
  };

  const handleRemoveSundayResult = (id) => {
    setConfig(prev => ({ ...prev, sundayResults: (prev.sundayResults || []).filter(r => r.id !== id) }));
  };

  const handleUpdateSundayResult = (id, field, val) => {
    setConfig(prev => ({
      ...prev,
      sundayResults: (prev.sundayResults || []).map(r => r.id === id ? { ...r, [field]: val } : r)
    }));
  };

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
  const handleDownload = async (pageToExport = selectedTemplate.id === 'result' ? currentResultPage : currentProgramPage) => {
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
      let pageSuffix = '';
      if (selectedTemplate.id === 'weekend_program' && totalProgramPages > 1) {
        pageSuffix = `-page${pageToExport}`;
      } else if (selectedTemplate.id === 'result' && totalResultPages > 1) {
        pageSuffix = `-page${pageToExport}`;
      }
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
    const totalPages = selectedTemplate.id === 'result' ? totalResultPages : totalProgramPages;
    const setPage = selectedTemplate.id === 'result' ? setCurrentResultPage : setCurrentProgramPage;
    const initialPage = selectedTemplate.id === 'result' ? currentResultPage : currentProgramPage;

    if (totalPages <= 1) {
      handleDownload(1);
      return;
    }
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      for (let p = 1; p <= totalPages; p++) {
        setPage(p);
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
          link.download = `bcsn-${selectedTemplate.id}-partie${p}-sur-${totalPages}-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      }
    } catch (err) {
      console.error('Erreur export multi-pages:', err);
      alert("Erreur lors de l'exportation de toutes les pages.");
    } finally {
      setPage(initialPage);
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
        return `🔥 RÉSULTATS DU WEEK-END 🔥\n\n` +
          `📅 SAMEDI :\n` +
          (config.saturdayResults || []).map(r => `${r.isVictory ? '✅' : '❌'} ${r.category} | ${r.opponent} | ${r.score}`).join('\n') +
          `\n\n📅 DIMANCHE :\n` +
          (config.sundayResults || []).map(r => `${r.isVictory ? '✅' : '❌'} ${r.category} | ${r.opponent} | ${r.score}`).join('\n') +
          (totalResultPages > 1 ? `\n\n👉 Faites glisser le carrousel pour voir toutes les fiches résultats (Parties 1 à ${totalResultPages}) ! 📲` : '') +
          `\n\nFélicitations à toutes nos équipes pour leurs performances ! 💚🤍\n\n${hashtag}`;

      case 'player_mvp':
        return `⭐ MVP DU MATCH ⭐\n\n` +
          `Félicitations à ${selectedMember ? selectedMember.name : 'notre joueur'} #${config.playerNumber} pour cette grosse performance !\n` +
          `📊 Statistiques du match :\n` +
          `• ${config.stat1Value} ${config.stat1Label}\n` +
          `• ${config.stat2Value} ${config.stat2Label}\n` +
          `• ${config.stat3Value} ${config.stat3Label}\n` +
          `• ${config.stat4Value} ${config.stat4Label}\n\n` +
          `Let's go BCSN ! 💚🤍\n\n${hashtag}`;

      case 'player_portrait':
        return `🌟 PORTRAIT DU JOUEUR DE LA SEMAINE 🌟\n\n` +
          `Découvrez le portrait de ${selectedPortraitMember ? selectedPortraitMember.name : config.portraitPlayerName} (#${selectedPortraitMember ? (selectedPortraitMember.number || config.portraitNumber) : config.portraitNumber}), joueur en équipe ${selectedPortraitMember ? (selectedPortraitMember.team || config.portraitCategory) : config.portraitCategory} ! 🏀\n\n` +
          `💬 "Pourquoi le basket ?" : ${config.portraitA1}\n` +
          `🏆 "Son meilleur souvenir BCSN" : ${config.portraitA2}\n` +
          `🎯 "Son objectif cette saison" : ${config.portraitA3}\n` +
          `🎵 "Sa musique avant match" : ${config.portraitA4}\n` +
          `😂 "Fun Fact" : ${config.portraitA5}\n\n` +
          `Fiers d'avoir des profils comme lui au club ! À suivre sur les parquets ! 💚🤍\n\n${hashtag}`;

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
        padding: isStory ? '24px 16px 14px 16px' : isPost ? '12px 12px' : '16px 16px 12px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: isDark ? '#FFFFFF' : '#1E293B'
      }}>
        {/* HEADER BRANDING : 100% DROIT & CENTRÉ */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 4 }}>
          {/* Logo officiel du club */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
            <BcsnOfficialLogo isDark={isDark} size={isStory ? 60 : isPost ? 46 : 54} customLogoUrl={customLogoUrl} />
          </div>

          {/* Titre Principal + Badge Multi-Page */}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: isStory ? 34 : isPost ? 26 : 30,
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
                padding: '2px 7px',
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
            gap: 10,
            background: isDark ? 'rgba(16,185,129,0.18)' : '#0B4D3B',
            color: '#FFFFFF',
            border: isDark ? '1px solid rgba(16,185,129,0.4)' : 'none',
            borderRadius: 6,
            padding: '3px 12px',
            marginTop: 4,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.5,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:basketball-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubSocialName}</span>
            </div>
            <span style={{ opacity: 0.5 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:instagram-logo-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubInstagram}</span>
            </div>
          </div>
        </div>

        {/* 2 COLONNES (SAMEDI & DIMANCHE) : DESCENDENT JUSQU'EN BAS DU DESIGN */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          flex: 1,
          margin: '4px 0 8px 0',
          alignItems: 'start',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* SAMEDI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            {/* Header Samedi */}
            <div style={{
              background: isDark ? '#10B981' : '#0B4D3B',
              color: isDark ? '#000000' : '#FFFFFF',
              borderRadius: 5,
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Icon icon="ph:calendar-blank-bold" width="13" height="13" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontStyle: 'italic', fontSize: 14.5, letterSpacing: 1.5, fontWeight: 900, lineHeight: 1 }}>
                SAMEDI
              </span>
            </div>

            {/* List of Saturday Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {paginatedSatMatches.map((m) => {
                const matchColor = m.isHome ? (isDark ? '#10B981' : homeColor) : awayColor;
                return (
                  <div key={m.id} style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                    borderRadius: 6,
                    padding: '3px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                    minHeight: 27,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: matchColor, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon icon="ph:basketball-bold" width="11" height="11" color="#FFFFFF" />
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, fontWeight: 900, color: matchColor, letterSpacing: 0.3, whiteSpace: 'nowrap', lineHeight: 1, flexShrink: 0 }}>
                        {m.category}
                      </div>
                      <span style={{ color: isDark ? '#4B5563' : '#CBD5E1', fontSize: 8 }}>|</span>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>
                        {m.time}
                      </div>
                      <div style={{ fontSize: 8, fontWeight: 600, color: isDark ? '#94A3B8' : '#334155', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }}>
                        {m.opponent}
                      </div>
                    </div>

                    {/* Right Dom/Ext Pill */}
                    <div style={{
                      background: matchColor,
                      color: '#FFFFFF',
                      borderRadius: 3.5,
                      padding: '2px 5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      flexShrink: 0
                    }}>
                      <Icon icon={m.isHome ? "ph:house-line-bold" : "ph:map-pin-bold"} width="7.5" height="7.5" color="#FFFFFF" />
                      <span style={{ fontSize: 6.5, fontWeight: 900, letterSpacing: 0.2, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {m.isHome ? 'DOM' : 'EXT'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {paginatedSatMatches.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: 9, opacity: 0.5, padding: 6, fontStyle: 'italic' }}>
                  Aucun match supplémentaire le samedi
                </div>
              )}
            </div>
          </div>

          {/* DIMANCHE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            {/* Header Dimanche */}
            <div style={{
              background: isDark ? '#10B981' : '#0B4D3B',
              color: isDark ? '#000000' : '#FFFFFF',
              borderRadius: 5,
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Icon icon="ph:calendar-blank-bold" width="13" height="13" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontStyle: 'italic', fontSize: 14.5, letterSpacing: 1.5, fontWeight: 900, lineHeight: 1 }}>
                DIMANCHE
              </span>
            </div>

            {/* List of Sunday Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {paginatedSunMatches.map((m) => {
                const matchColor = m.isHome ? (isDark ? '#10B981' : homeColor) : awayColor;
                return (
                  <div key={m.id} style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                    borderRadius: 6,
                    padding: '3px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                    minHeight: 27,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: matchColor, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon icon="ph:basketball-bold" width="11" height="11" color="#FFFFFF" />
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, fontWeight: 900, color: matchColor, letterSpacing: 0.3, whiteSpace: 'nowrap', lineHeight: 1, flexShrink: 0 }}>
                        {m.category}
                      </div>
                      <span style={{ color: isDark ? '#4B5563' : '#CBD5E1', fontSize: 8 }}>|</span>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>
                        {m.time}
                      </div>
                      <div style={{ fontSize: 8, fontWeight: 600, color: isDark ? '#94A3B8' : '#334155', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }}>
                        {m.opponent}
                      </div>
                    </div>

                    {/* Right Dom/Ext Pill */}
                    <div style={{
                      background: matchColor,
                      color: '#FFFFFF',
                      borderRadius: 3.5,
                      padding: '2px 5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      flexShrink: 0
                    }}>
                      <Icon icon={m.isHome ? "ph:house-line-bold" : "ph:map-pin-bold"} width="7.5" height="7.5" color="#FFFFFF" />
                      <span style={{ fontSize: 6.5, fontWeight: 900, letterSpacing: 0.2, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                        {m.isHome ? 'DOM' : 'EXT'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {paginatedSunMatches.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: 9, opacity: 0.5, padding: 6, fontStyle: 'italic' }}>
                  Aucun match supplémentaire le dimanche
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Légende Salles : Rectiligne & Centré */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.6)' : '#FFFFFF',
            borderRadius: 6,
            padding: '4px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 8.5,
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: isDark ? '#10B981' : '#0B4D3B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:house-line-bold" width="8.5" height="8.5" color={isDark ? '#000' : '#FFF'} />
              </div>
              <span style={{ color: isDark ? '#10B981' : '#0B4D3B', fontWeight: 900, textTransform: 'uppercase', fontSize: 8 }}>DOMICILE :</span>
              <span style={{ color: isDark ? '#CBD5E1' : '#475569', fontWeight: 600 }}>{config.venueHome}</span>
            </div>
            <span style={{ color: isDark ? '#4B5563' : '#CBD5E1' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#D62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:map-pin-bold" width="8.5" height="8.5" color="#FFFFFF" />
              </div>
              <span style={{ color: '#D62828', fontWeight: 900, textTransform: 'uppercase', fontSize: 8 }}>EXTÉRIEUR :</span>
              <span style={{ color: isDark ? '#CBD5E1' : '#475569', fontWeight: 600 }}>{config.venueAway}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. JOUR DE MATCH (GAME DAY)
  const renderMatchDayGraphic = () => {
    const isDark = selectedTheme.id === 'dark_arena';
    const isStory = selectedFormat.id === 'story';
    const isPost = selectedFormat.id === 'post';

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
        padding: isStory ? '24px 16px 14px 16px' : isPost ? '12px 12px' : '16px 16px 12px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: isDark ? '#FFFFFF' : '#1E293B',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        {/* HEADER BRANDING */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 4 }}>
          {/* Logo officiel du club */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
            <BcsnOfficialLogo isDark={isDark} size={isStory ? 60 : isPost ? 46 : 54} customLogoUrl={customLogoUrl} />
          </div>

          {/* Titre Principal JOUR DE MATCH */}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: isStory ? 38 : isPost ? 30 : 34,
            lineHeight: 1,
            letterSpacing: 1.5,
            color: isDark ? '#10B981' : homeColor,
            textShadow: isDark ? '0 0 20px rgba(16,185,129,0.3)' : 'none',
            marginTop: 4
          }}>
            JOUR DE MATCH
          </div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: awayColor, fontWeight: 800, marginTop: 2 }}>
            {config.matchCategory}
          </div>

          {/* Social Ribbon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: isDark ? 'rgba(16,185,129,0.18)' : '#0B4D3B',
            color: '#FFFFFF',
            border: isDark ? '1px solid rgba(16,185,129,0.4)' : 'none',
            borderRadius: 6,
            padding: '3px 12px',
            marginTop: 6,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.5,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:basketball-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubSocialName}</span>
            </div>
            <span style={{ opacity: 0.5 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:instagram-logo-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubInstagram}</span>
            </div>
          </div>
        </div>

        {/* CLASH AREA */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '20px 0' }}>
          {/* Home Team */}
          <div style={{
            flex: 1,
            background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            padding: '16px 12px',
            borderRadius: 12,
            border: `2px solid ${isDark ? '#10B981' : homeColor}`,
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, fontWeight: 900, color: isDark ? '#10B981' : homeColor, letterSpacing: 0.5 }}>
              {config.matchHomeTeam}
            </div>
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, fontWeight: 800, letterSpacing: 1 }}>DOMICILE</div>
          </div>

          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, fontStyle: 'italic', color: awayColor, fontWeight: 900 }}>VS</div>

          {/* Away Team */}
          <div style={{
            flex: 1,
            background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
            padding: '16px 12px',
            borderRadius: 12,
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, fontWeight: 900, color: isDark ? '#FFF' : '#334155', letterSpacing: 0.5 }}>
              {config.matchAwayTeam}
            </div>
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4, fontWeight: 800, letterSpacing: 1 }}>EXTÉRIEUR</div>
          </div>
        </div>

        {/* INFO CARD & FOOTER */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* Info Card */}
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.6)' : '#FFFFFF',
            borderRadius: 10,
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            width: '85%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: isDark ? '#E2E8F0' : '#1E293B' }}>
              <Icon icon="ph:calendar-bold" width="16" height="16" color={isDark ? '#10B981' : homeColor} />
              <span>
                {config.matchDate ? new Date(config.matchDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Ce week-end'} à {config.matchTime}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, opacity: 0.85, color: isDark ? '#94A3B8' : '#475569' }}>
              <Icon icon="ph:map-pin-bold" width="15" height="15" color={awayColor} />
              <span>{config.matchVenue}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, color: isDark ? '#10B981' : homeColor, borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)', paddingTop: 6, marginTop: 2 }}>
              <Icon icon="ph:trophy-bold" width="14" height="14" />
              <span>{config.matchCompetition}</span>
            </div>
          </div>

          {/* Social Ribbon / Club Slogan */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4 }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 16,
              color: '#FFFFFF',
              letterSpacing: 1.5
            }}>
              TOUS ENSEMBLE POUR LA VICTOIRE !
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. RÉSULTAT & SCORE (RECAP DES SCORES PAR SAMEDI/DIMANCHE)
  const renderResultGraphic = () => {
    const isDark = selectedTheme.id === 'dark_arena';
    const isStory = selectedFormat.id === 'story';
    const isPost = selectedFormat.id === 'post';

    const safePage = Math.min(Math.max(currentResultPage, 1), totalResultPages);
    const paginatedSatResults = (config.saturdayResults || []).slice((safePage - 1) * maxResultsPerPage, safePage * maxResultsPerPage);
    const paginatedSunResults = (config.sundayResults || []).slice((safePage - 1) * maxResultsPerPage, safePage * maxResultsPerPage);

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
        padding: isStory ? '24px 16px 14px 16px' : isPost ? '12px 12px' : '16px 16px 12px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: isDark ? '#FFFFFF' : '#1E293B',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        {/* HEADER BRANDING */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 4 }}>
          {/* Logo officiel du club */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
            <BcsnOfficialLogo isDark={isDark} size={isStory ? 60 : isPost ? 46 : 54} customLogoUrl={customLogoUrl} />
          </div>

          {/* Titre Principal RÉSULTATS DU WEEK-END */}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: isStory ? 36 : isPost ? 28 : 32,
            lineHeight: 0.95,
            letterSpacing: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2
          }}>
            <span style={{ color: isDark ? '#10B981' : homeColor, fontSize: isStory ? 38 : isPost ? 30 : 34 }}>
              {config.resultTitleMain}
            </span>
            <span style={{ color: awayColor, fontSize: isStory ? 24 : isPost ? 18 : 22, marginTop: -2 }}>
              {config.resultTitleSub}
              {totalResultPages > 1 && (
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontStyle: 'normal',
                  fontSize: 9.5,
                  fontWeight: 900,
                  background: '#D62828',
                  color: '#FFFFFF',
                  padding: '2px 7px',
                  borderRadius: 4,
                  letterSpacing: 0.5,
                  marginLeft: 6,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  verticalAlign: 'middle'
                }}>
                  PARTIE {safePage}/{totalResultPages}
                </span>
              )}
            </span>
          </div>

          {/* Social Ribbon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: isDark ? 'rgba(16,185,129,0.18)' : '#0B4D3B',
            color: '#FFFFFF',
            border: isDark ? '1px solid rgba(16,185,129,0.4)' : 'none',
            borderRadius: 6,
            padding: '3px 12px',
            marginTop: 6,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.5,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:basketball-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubSocialName}</span>
            </div>
            <span style={{ opacity: 0.5 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:instagram-logo-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubInstagram}</span>
            </div>
          </div>
        </div>

        {/* 2 COLONNES (SAMEDI & DIMANCHE) DE RÉSULTATS */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          flex: 1,
          margin: '6px 0 8px 0',
          alignItems: 'start',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* SAMEDI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            {/* Header Samedi */}
            <div style={{
              background: isDark ? homeColor : '#0B4D3B',
              color: '#FFFFFF',
              borderRadius: 5,
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Icon icon="ph:calendar-blank-bold" width="13" height="13" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontStyle: 'italic', fontSize: 14.5, letterSpacing: 1.5, fontWeight: 900, lineHeight: 1 }}>
                SAMEDI
              </span>
            </div>

            {/* List of Saturday Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {paginatedSatResults.map((r) => {
                const matchColor = r.isVictory ? homeColor : awayColor;
                return (
                  <div key={r.id} style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                    borderRadius: 6,
                    padding: '3px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : `1px solid rgba(0,0,0,0.06)`,
                    minHeight: 27,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left side (Status circle + Category + Opponent) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        background: r.isVictory ? homeColor : '#D62828',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon icon={r.isVictory ? "ph:check-bold" : "ph:x-bold"} width="9.5" height="9.5" color="#FFFFFF" />
                      </div>

                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 13,
                        fontWeight: 900,
                        color: r.isVictory ? homeColor : awayColor,
                        letterSpacing: 0.3,
                        whiteSpace: 'nowrap',
                        lineHeight: 1,
                        flexShrink: 0
                      }}>
                        {r.category}
                      </div>

                      <span style={{ color: isDark ? '#4B5563' : '#CBD5E1', fontSize: 8 }}>|</span>

                      <div style={{
                        fontSize: 8,
                        fontWeight: 600,
                        color: isDark ? '#94A3B8' : '#64748B',
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {r.opponent}
                      </div>
                    </div>

                    {/* Right side (Score Pill) */}
                    <div style={{
                      background: r.isVictory ? homeColor : awayColor,
                      color: '#FFFFFF',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 9.5,
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontWeight: 900,
                      letterSpacing: 0.5,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 38,
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {r.score}
                    </div>
                  </div>
                );
              })}
              {paginatedSatResults.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: 9, opacity: 0.5, padding: 6, fontStyle: 'italic' }}>
                  Aucun résultat supplémentaire le samedi
                </div>
              )}
            </div>
          </div>

          {/* DIMANCHE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            {/* Header Dimanche */}
            <div style={{
              background: isDark ? homeColor : '#0B4D3B',
              color: '#FFFFFF',
              borderRadius: 5,
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Icon icon="ph:calendar-blank-bold" width="13" height="13" />
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontStyle: 'italic', fontSize: 14.5, letterSpacing: 1.5, fontWeight: 900, lineHeight: 1 }}>
                DIMANCHE
              </span>
            </div>

            {/* List of Sunday Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {paginatedSunResults.map((r) => {
                const matchColor = r.isVictory ? homeColor : awayColor;
                return (
                  <div key={r.id} style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                    borderRadius: 6,
                    padding: '3px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : `1px solid rgba(0,0,0,0.06)`,
                    minHeight: 27,
                    boxSizing: 'border-box'
                  }}>
                    {/* Left side (Status circle + Category + Opponent) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        background: r.isVictory ? homeColor : '#D62828',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon icon={r.isVictory ? "ph:check-bold" : "ph:x-bold"} width="9.5" height="9.5" color="#FFFFFF" />
                      </div>

                      <div style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 13,
                        fontWeight: 900,
                        color: r.isVictory ? homeColor : awayColor,
                        letterSpacing: 0.3,
                        whiteSpace: 'nowrap',
                        lineHeight: 1,
                        flexShrink: 0
                      }}>
                        {r.category}
                      </div>

                      <span style={{ color: isDark ? '#4B5563' : '#CBD5E1', fontSize: 8 }}>|</span>

                      <div style={{
                        fontSize: 8,
                        fontWeight: 600,
                        color: isDark ? '#94A3B8' : '#64748B',
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: "'Inter', sans-serif"
                      }}>
                        {r.opponent}
                      </div>
                    </div>

                    {/* Right side (Score Pill) */}
                    <div style={{
                      background: r.isVictory ? homeColor : awayColor,
                      color: '#FFFFFF',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 9.5,
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontWeight: 900,
                      letterSpacing: 0.5,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 38,
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {r.score}
                    </div>
                  </div>
                );
              })}
              {paginatedSunResults.length === 0 && (
                <div style={{ textAlign: 'center', fontSize: 9, opacity: 0.5, padding: 6, fontStyle: 'italic' }}>
                  Aucun résultat supplémentaire le dimanche
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {/* Victory/Defeat Legend */}
          <div style={{
            background: isDark ? 'rgba(0,0,0,0.6)' : '#FFFFFF',
            borderRadius: 6,
            padding: '3.5px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 8.5,
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 13, height: 13, borderRadius: '50%', background: homeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:check-bold" width="8" height="8" color="#FFFFFF" />
              </div>
              <span style={{ color: homeColor, fontWeight: 900, textTransform: 'uppercase', fontSize: 7.5 }}>VICTOIRE</span>
            </div>
            <span style={{ color: isDark ? '#4B5563' : '#CBD5E1' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#D62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon icon="ph:x-bold" width="8" height="8" color="#FFFFFF" />
              </div>
              <span style={{ color: '#D62828', fontWeight: 900, textTransform: 'uppercase', fontSize: 7.5 }}>DÉFAITE</span>
            </div>
          </div>

          {/* Inspirational Text */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 16,
              color: '#FFFFFF',
              letterSpacing: 1.5
            }}>
              BRAVO À TOUTES LES ÉQUIPES !
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 12,
              color: awayColor,
              letterSpacing: 1
            }}>
              MERCI POUR VOTRE SOUTIEN !
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 4. MVP / CARTE JOUEUR
  const renderMvpGraphic = () => {
    const isDark = selectedTheme.id === 'dark_arena';
    const isStory = selectedFormat.id === 'story';
    const isPost = selectedFormat.id === 'post';

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
        padding: isStory ? '24px 16px 14px 16px' : isPost ? '12px 12px' : '16px 16px 12px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: isDark ? '#FFFFFF' : '#1E293B',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        {/* HEADER BRANDING */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 4 }}>
          {/* Logo officiel du club */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
            <BcsnOfficialLogo isDark={isDark} size={isStory ? 60 : isPost ? 46 : 54} customLogoUrl={customLogoUrl} />
          </div>

          {/* Titre Principal MVP DU MATCH */}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: isStory ? 38 : isPost ? 30 : 34,
            lineHeight: 1,
            letterSpacing: 1.5,
            color: isDark ? '#10B981' : homeColor,
            marginTop: 4
          }}>
            MVP DU MATCH
          </div>

          {/* Social Ribbon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: isDark ? 'rgba(16,185,129,0.18)' : '#0B4D3B',
            color: '#FFFFFF',
            border: isDark ? '1px solid rgba(16,185,129,0.4)' : 'none',
            borderRadius: 6,
            padding: '3px 12px',
            marginTop: 6,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.5,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:basketball-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubSocialName}</span>
            </div>
            <span style={{ opacity: 0.5 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:instagram-logo-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubInstagram}</span>
            </div>
          </div>
        </div>

        {/* PLAYER DISPLAY SECTION */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0', width: '100%' }}>
          {/* Photo joueur avec cadre stylisé */}
          <div style={{
            width: isStory ? 110 : 90,
            height: isStory ? 110 : 90,
            borderRadius: 16,
            background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
            border: `2px solid ${isDark ? '#10B981' : homeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            {selectedMember && selectedMember.photo ? (
              <img src={selectedMember.photo} alt={selectedMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Icon icon="ph:user-bold" width={isStory ? 48 : 38} color={isDark ? '#10B981' : homeColor} />
            )}
          </div>

          {/* Détails du Joueur */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: isStory ? 28 : 22,
              fontWeight: 900,
              textTransform: 'uppercase',
              color: isDark ? '#FFFFFF' : '#1E293B',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>{selectedMember ? selectedMember.name : 'Nom du Joueur'}</span>
              <span style={{ color: awayColor }}>#{config.playerNumber}</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#10B981' : homeColor, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {config.playerPosition}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 8 }}>
              {[
                { val: config.stat1Value, lbl: config.stat1Label },
                { val: config.stat2Value, lbl: config.stat2Label },
                { val: config.stat3Value, lbl: config.stat3Label },
                { val: config.stat4Value, lbl: config.stat4Label }
              ].map((s, idx) => (
                <div key={idx} style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  padding: '4px 2px',
                  borderRadius: 6,
                  textAlign: 'center',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: isDark ? '#10B981' : homeColor }}>{s.val}</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: isDark ? '#94A3B8' : '#64748B', textTransform: 'uppercase' }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM MOTTO */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: 16,
              color: '#FFFFFF',
              letterSpacing: 1.5
            }}>
              FÉLICITATIONS À NOTRE JOUEUR !
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5. FLASH INFO / ANNONCE
  const renderAnnouncementGraphic = () => {
    const isDark = selectedTheme.id === 'dark_arena';
    const isStory = selectedFormat.id === 'story';
    const isPost = selectedFormat.id === 'post';

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
        padding: isStory ? '24px 16px 14px 16px' : isPost ? '12px 12px' : '16px 16px 12px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: isDark ? '#FFFFFF' : '#1E293B',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        {/* HEADER BRANDING */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', marginBottom: 4 }}>
          {/* Logo officiel du club */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
            <BcsnOfficialLogo isDark={isDark} size={isStory ? 60 : isPost ? 46 : 54} customLogoUrl={customLogoUrl} />
          </div>

          {/* Badge Tag Annonce */}
          <div style={{
            background: awayColor,
            color: '#FFFFFF',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 12,
            padding: '2px 12px',
            borderRadius: 4,
            letterSpacing: 1.5,
            display: 'inline-block',
            marginTop: 2,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            {config.announcementTag}
          </div>

          {/* Titre Principal */}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: isStory ? 34 : isPost ? 26 : 30,
            lineHeight: 1.1,
            letterSpacing: 1,
            color: isDark ? '#10B981' : homeColor,
            marginTop: 6
          }}>
            {config.announcementTitle}
          </div>
        </div>

        {/* ANNOUNCEMENT CONTENT CARD */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
          borderRadius: 12,
          padding: '16px 20px',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
          margin: '14px 0',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{
            fontSize: isStory ? 14 : 12.5,
            lineHeight: 1.6,
            color: isDark ? '#CBD5E1' : '#334155',
            fontWeight: 600,
            margin: 0,
            textAlign: 'center'
          }}>
            {config.announcementBody}
          </p>
        </div>

        {/* BOTTOM SECTION */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {/* Social Ribbon */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: isDark ? 'rgba(16,185,129,0.18)' : '#0B4D3B',
            color: '#FFFFFF',
            border: isDark ? '1px solid rgba(16,185,129,0.4)' : 'none',
            borderRadius: 6,
            padding: '3px 12px',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.5,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:basketball-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubSocialName}</span>
            </div>
            <span style={{ opacity: 0.5 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon icon="ph:instagram-logo-bold" width="12" height="12" color="#FFFFFF" />
              <span>{config.clubInstagram}</span>
            </div>
          </div>

          {/* Footer string */}
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: '#FFFFFF',
            opacity: 0.8,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginTop: 2
          }}>
            {config.announcementFooter}
          </div>
        </div>
      </div>
    );
  };

  // 6. PORTRAIT DU JOUEUR DE LA SEMAINE
  const renderPortraitGraphic = () => {
    const isDark = selectedTheme.id === 'dark_arena';
    const isStory = selectedFormat.id === 'story';
    const isPost = selectedFormat.id === 'post';

    const playerNum = selectedPortraitMember ? (selectedPortraitMember.number || config.portraitNumber) : config.portraitNumber;
    const playerName = selectedPortraitMember ? selectedPortraitMember.name : config.portraitPlayerName;
    const playerCategory = selectedPortraitMember ? (selectedPortraitMember.team || config.portraitCategory) : config.portraitCategory;
    const playerPosition = selectedPortraitMember ? (selectedPortraitMember.role || config.portraitPosition) : config.portraitPosition;
    const playerPhoto = selectedPortraitMember ? selectedPortraitMember.photo : null;

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
        padding: isStory ? '20px 14px 10px 14px' : isPost ? '10px 10px' : '14px 14px 10px 14px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: isDark ? '#FFFFFF' : '#1E293B',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}>
        {/* BACKGROUND WATERMARK */}
        {!isDark && (
          <div style={{
            position: 'absolute',
            right: '-40px',
            top: '40px',
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: 1
          }}>
            <Icon icon="ph:basketball-fill" width="300" height="300" color="#0B4D3B" />
          </div>
        )}

        {/* TOP AREA: LOGO + TITLE */}
        <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BcsnOfficialLogo isDark={isDark} size={isStory ? 48 : isPost ? 36 : 42} customLogoUrl={customLogoUrl} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontStyle: 'italic',
              fontWeight: 900,
              fontSize: isStory ? 34 : isPost ? 26 : 30,
              lineHeight: 0.9,
              letterSpacing: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <span style={{ color: isDark ? '#10B981' : homeColor }}>{config.portraitTitleMain}</span>
              <span style={{ color: isDark ? '#FFF' : '#1E293B' }}>{config.portraitTitleSub}</span>
            </div>
            
            {/* Tag De la semaine */}
            <div style={{
              background: awayColor,
              color: '#FFFFFF',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: isStory ? 12 : isPost ? 9.5 : 11,
              fontWeight: 900,
              fontStyle: 'italic',
              padding: '2.5px 12px',
              borderRadius: 3,
              letterSpacing: 1,
              transform: 'rotate(-2deg)',
              marginTop: 3,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {config.portraitTitleBadge}
            </div>
          </div>
        </div>

        {/* MAIN BODY AREA (2 COLUMNS) */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          gap: 12,
          flex: 1,
          alignItems: 'stretch',
          margin: '8px 0',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* LEFT COLUMN: PLAYER PORTRAIT PHOTO */}
          <div style={{
            width: '42%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            position: 'relative'
          }}>
            {/* Main Picture Container */}
            <div style={{
              height: '92%',
              width: '100%',
              borderRadius: 12,
              background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
              border: isDark ? '2px solid rgba(255,255,255,0.1)' : `3px solid ${homeColor}`,
              boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {playerPhoto ? (
                <img src={playerPhoto} alt={playerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Icon icon="ph:user-bold" width="48" color={isDark ? '#10B981' : homeColor} style={{ opacity: 0.6 }} />
                  <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.5 }}>BC SAINT NICOLAS</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: PLAYER NAME, METADATA BADGES & Q&A */}
          <div style={{
            width: '58%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 6
          }}>
            {/* Player Name and Number */}
            <div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: isStory ? 34 : isPost ? 26 : 30,
                fontWeight: 900,
                color: isDark ? '#10B981' : homeColor,
                letterSpacing: 1,
                lineHeight: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap'
              }}>
                <span style={{ color: awayColor }}>#{playerNum}</span>
                <span style={{ color: isDark ? '#FFF' : '#1E293B' }}>{playerName}</span>
              </div>
            </div>

            {/* 4 Metadata Icons & Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 4,
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
              borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
              padding: '4px 0'
            }}>
              {[
                { icon: 'ph:users-three-bold', val: playerCategory, label: 'ÉQUIPE' },
                { icon: 'ph:t-shirt-bold', val: `N° ${playerNum}`, label: 'NUMÉRO' },
                { icon: 'ph:basketball-bold', val: playerPosition.replace('POSTE ', ''), label: 'POSTE' },
                { icon: 'ph:calendar-bold', val: config.portraitSeniority.replace('AU CLUB ', ''), label: 'SENIORITÉ' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: 0 }}>
                  <Icon icon={item.icon} width="14" height="14" color={isDark ? '#10B981' : homeColor} />
                  <span style={{ fontSize: 6.5, fontWeight: 900, textTransform: 'uppercase', color: isDark ? '#FFF' : '#1E293B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {item.val}
                  </span>
                  <span style={{ fontSize: 5, fontWeight: 700, color: isDark ? '#64748B' : '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.2 }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Q&A List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, justifyContent: 'center' }}>
              {[
                { icon: 'ph:star-fill', title: config.portraitQ1, val: config.portraitA1 },
                { icon: 'ph:trophy-fill', title: config.portraitQ2, val: config.portraitA2 },
                { icon: 'ph:target-fill', title: config.portraitQ3, val: config.portraitA3 },
                { icon: 'ph:music-note-simple-fill', title: config.portraitQ4, val: config.portraitA4 },
                { icon: 'ph:smiley-fill', title: config.portraitQ5, val: config.portraitA5 }
              ].map((qa, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  {/* Circle Icon Badge */}
                  <div style={{
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    background: isDark ? 'rgba(16,185,129,0.15)' : homeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1
                  }}>
                    <Icon icon={qa.icon} width="9" height="9" color={isDark ? '#10B981' : '#FFFFFF'} />
                  </div>

                  {/* Question and Answer */}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{
                      fontSize: 7.5,
                      fontWeight: 800,
                      color: isDark ? '#10B981' : '#0F172A',
                      textTransform: 'uppercase',
                      letterSpacing: 0.2,
                      fontFamily: "'Outfit', sans-serif"
                    }}>
                      {qa.title}
                    </div>
                    <div style={{
                      fontSize: 7,
                      fontWeight: 500,
                      color: isDark ? '#94A3B8' : '#475569',
                      lineHeight: 1.15,
                      marginTop: 1,
                      fontStyle: 'italic',
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: 'normal'
                    }}>
                      {qa.val.startsWith('«') ? qa.val : `« ${qa.val} »`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM AREA: FOOTER */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          paddingTop: 5,
          marginTop: 2
        }}>
          {/* Socials Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              <Icon icon="ph:facebook-logo-bold" width="12" height="12" color={isDark ? '#FFF' : '#1E293B'} />
              <Icon icon="ph:instagram-logo-bold" width="12" height="12" color={isDark ? '#FFF' : '#1E293B'} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: 5, fontWeight: 700, color: '#94A3B8' }}>SUIVEZ TOUTE L'ACTU DU CLUB</span>
              <span style={{ fontSize: 6.5, fontWeight: 900, color: isDark ? '#10B981' : homeColor }}>{config.clubInstagram}</span>
            </div>
          </div>

          {/* Slogan "À SUIVRE SUR LES PARQUETS !" */}
          <div style={{
            background: isDark ? '#10B981' : '#0F172A',
            color: '#FFFFFF',
            fontFamily: "'Bebas Neue', sans-serif",
            fontStyle: 'italic',
            fontWeight: 900,
            fontSize: isStory ? 12 : isPost ? 9.5 : 11,
            padding: '2px 10px',
            borderRadius: 3,
            letterSpacing: 1,
            transform: 'skewX(-6deg)'
          }}>
            À SUIVRE SUR LES PARQUETS !
          </div>

          {/* Hashtags */}
          <div style={{ display: 'flex', gap: 3, fontSize: 6.5, fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
            <span style={{ color: isDark ? '#10B981' : homeColor }}>#BCSN</span>
            <span style={{ color: awayColor }}>#ESPRITCLUB</span>
          </div>
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
      case 'player_portrait': return renderPortraitGraphic();
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="grid-2">
                  <input className="input" value={config.resultTitleMain} onChange={e => setConfig({...config, resultTitleMain: e.target.value})} placeholder="Titre principal" />
                  <input className="input" value={config.resultTitleSub} onChange={e => setConfig({...config, resultTitleSub: e.target.value})} placeholder="Sous-titre" />
                </div>
                
                {/* Day selector tabs */}
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <button
                    className={`btn btn-sm`}
                    style={{ flex: 1, justifyContent: 'center', background: activeResultDayTab === 'saturday' ? 'var(--primary)' : 'none', color: activeResultDayTab === 'saturday' ? '#FFF' : 'var(--text-muted)' }}
                    onClick={() => setActiveResultDayTab('saturday')}
                  >
                    Samedi ({config.saturdayResults?.length || 0})
                  </button>
                  <button
                    className={`btn btn-sm`}
                    style={{ flex: 1, justifyContent: 'center', background: activeResultDayTab === 'sunday' ? 'var(--primary)' : 'none', color: activeResultDayTab === 'sunday' ? '#FFF' : 'var(--text-muted)' }}
                    onClick={() => setActiveResultDayTab('sunday')}
                  >
                    Dimanche ({config.sundayResults?.length || 0})
                  </button>
                </div>

                {/* Saturday Results list */}
                {activeResultDayTab === 'saturday' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                      {(config.saturdayResults || []).map((r) => (
                        <div key={r.id} style={{ background: 'var(--bg-card)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input className="input" style={{ width: 80, fontSize: 11, padding: 4 }} value={r.category} onChange={e => handleUpdateSaturdayResult(r.id, 'category', e.target.value)} placeholder="Catégorie" />
                          <input className="input" style={{ flex: 1, fontSize: 11, padding: 4 }} value={r.opponent} onChange={e => handleUpdateSaturdayResult(r.id, 'opponent', e.target.value)} placeholder="Opposant" />
                          <input className="input" style={{ width: 60, fontSize: 11, padding: 4 }} value={r.score} onChange={e => handleUpdateSaturdayResult(r.id, 'score', e.target.value)} placeholder="Score" />
                          
                          <button
                            className="btn btn-sm"
                            style={{
                              fontSize: 9, padding: '3px 6px',
                              background: r.isVictory ? 'rgba(11,77,59,0.2)' : 'rgba(214,40,40,0.2)',
                              color: r.isVictory ? '#10B981' : '#D62828',
                              border: `1px solid ${r.isVictory ? '#10B981' : '#D62828'}`
                            }}
                            onClick={() => handleUpdateSaturdayResult(r.id, 'isVictory', !r.isVictory)}
                          >
                            {r.isVictory ? 'VIC' : 'DÉF'}
                          </button>
                          
                          {config.saturdayResults.length > 1 && (
                            <button onClick={() => handleRemoveSaturdayResult(r.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2 }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={handleAddSaturdayResult} style={{ justifyContent: 'center' }}>
                      <Plus size={13} /> Ajouter un résultat Samedi
                    </button>
                  </div>
                )}

                {/* Sunday Results list */}
                {activeResultDayTab === 'sunday' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                      {(config.sundayResults || []).map((r) => (
                        <div key={r.id} style={{ background: 'var(--bg-card)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input className="input" style={{ width: 80, fontSize: 11, padding: 4 }} value={r.category} onChange={e => handleUpdateSundayResult(r.id, 'category', e.target.value)} placeholder="Catégorie" />
                          <input className="input" style={{ flex: 1, fontSize: 11, padding: 4 }} value={r.opponent} onChange={e => handleUpdateSundayResult(r.id, 'opponent', e.target.value)} placeholder="Opposant" />
                          <input className="input" style={{ width: 60, fontSize: 11, padding: 4 }} value={r.score} onChange={e => handleUpdateSundayResult(r.id, 'score', e.target.value)} placeholder="Score" />
                          
                          <button
                            className="btn btn-sm"
                            style={{
                              fontSize: 9, padding: '3px 6px',
                              background: r.isVictory ? 'rgba(11,77,59,0.2)' : 'rgba(214,40,40,0.2)',
                              color: r.isVictory ? '#10B981' : '#D62828',
                              border: `1px solid ${r.isVictory ? '#10B981' : '#D62828'}`
                            }}
                            onClick={() => handleUpdateSundayResult(r.id, 'isVictory', !r.isVictory)}
                          >
                            {r.isVictory ? 'VIC' : 'DÉF'}
                          </button>
                          
                          {config.sundayResults.length > 1 && (
                            <button onClick={() => handleRemoveSundayResult(r.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2 }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={handleAddSundayResult} style={{ justifyContent: 'center' }}>
                      <Plus size={13} /> Ajouter un résultat Dimanche
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATE 4 : MVP */}
            {selectedTemplate.id === 'player_mvp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select className="input select" value={config.selectedMemberId} onChange={e => setConfig({...config, selectedMemberId: e.target.value})}>
                  <option value="">-- Choisir un joueur dans l'effectif BDD --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({formatMemberTeams(m, m.role || 'Joueur')})</option>
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

            {/* TEMPLATE 6 : PORTRAIT DU JOUEUR */}
            {selectedTemplate.id === 'player_portrait' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.6 }}>Identité du joueur</span>
                <select 
                  className="input select" 
                  value={config.portraitSelectedMemberId} 
                  onChange={e => {
                    const memberId = e.target.value;
                    const m = members.find(x => x.id === memberId);
                    if (m) {
                      const answers = m.formAnswers || {};
                      setConfig(prev => ({
                        ...prev,
                        portraitSelectedMemberId: memberId,
                        portraitPlayerName: m.name || prev.portraitPlayerName,
                        portraitNumber: answers['Numéro de maillot'] && answers['Numéro de maillot'] !== '—' ? answers['Numéro de maillot'] : (m.number || prev.portraitNumber),
                        portraitCategory: formatMemberTeams(m, prev.portraitCategory),
                        portraitPosition: answers['Poste de jeu'] && answers['Poste de jeu'] !== '—' ? `POSTE ${answers['Poste de jeu'].replace(/\s*\(Poste\s*\d+\)/i, '').toUpperCase()}` : (m.role ? `POSTE ${m.role.toUpperCase()}` : prev.portraitPosition),
                        portraitA2: answers['Meilleur souvenir avec le BCSN'] && answers['Meilleur souvenir avec le BCSN'] !== '—' ? answers['Meilleur souvenir avec le BCSN'] : prev.portraitA2,
                        portraitA3: answers['Objectif pour cette saison'] && answers['Objectif pour cette saison'] !== '—' ? answers['Objectif pour cette saison'] : prev.portraitA3,
                        portraitA4: answers['Musique avant un match'] && answers['Musique avant un match'] !== '—' ? answers['Musique avant un match'] : prev.portraitA4,
                        portraitA5: answers['Mot pour les supporters / licenciés'] && answers['Mot pour les supporters / licenciés'] !== '—' ? answers['Mot pour les supporters / licenciés'] : prev.portraitA5
                      }));
                    } else {
                      setConfig(prev => ({
                        ...prev,
                        portraitSelectedMemberId: ''
                      }));
                    }
                  }}
                >
                  <option value="">-- Choisir un joueur (Effectif BDD) --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({formatMemberTeams(m, m.role || 'Joueur')})</option>
                  ))}
                </select>

                <div className="grid-2">
                  <input className="input" value={config.portraitPlayerName} onChange={e => setConfig({...config, portraitPlayerName: e.target.value})} placeholder="Nom du joueur" />
                  <input className="input" value={config.portraitNumber} onChange={e => setConfig({...config, portraitNumber: e.target.value})} placeholder="Numéro # (ex: 7)" />
                </div>
                <div className="grid-2">
                  <input className="input" value={config.portraitCategory} onChange={e => setConfig({...config, portraitCategory: e.target.value})} placeholder="Catégorie (ex: U15 A)" />
                  <input className="input" value={config.portraitPosition} onChange={e => setConfig({...config, portraitPosition: e.target.value})} placeholder="Poste (ex: POSTE MENEUR)" />
                </div>
                <input className="input" value={config.portraitSeniority} onChange={e => setConfig({...config, portraitSeniority: e.target.value})} placeholder="Ancienneté (ex: AU CLUB DEPUIS 4 ANS)" />

                <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginTop: 6 }}>Questions & Réponses</span>
                
                <div style={{ background: 'var(--bg-card)', padding: 8, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary-light)' }}>1. {config.portraitQ1}</span>
                    <input className="input" style={{ fontSize: 11, padding: '3px 6px', marginTop: 2 }} value={config.portraitA1} onChange={e => setConfig({...config, portraitA1: e.target.value})} />
                  </div>
                  <div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary-light)' }}>2. {config.portraitQ2}</span>
                    <input className="input" style={{ fontSize: 11, padding: '3px 6px', marginTop: 2 }} value={config.portraitA2} onChange={e => setConfig({...config, portraitA2: e.target.value})} />
                  </div>
                  <div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary-light)' }}>3. {config.portraitQ3}</span>
                    <input className="input" style={{ fontSize: 11, padding: '3px 6px', marginTop: 2 }} value={config.portraitA3} onChange={e => setConfig({...config, portraitA3: e.target.value})} />
                  </div>
                  <div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary-light)' }}>4. {config.portraitQ4}</span>
                    <input className="input" style={{ fontSize: 11, padding: '3px 6px', marginTop: 2 }} value={config.portraitA4} onChange={e => setConfig({...config, portraitA4: e.target.value})} />
                  </div>
                  <div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary-light)' }}>5. {config.portraitQ5}</span>
                    <input className="input" style={{ fontSize: 11, padding: '3px 6px', marginTop: 2 }} value={config.portraitA5} onChange={e => setConfig({...config, portraitA5: e.target.value})} />
                  </div>
                </div>

                <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginTop: 4 }}>Titres & Badges</span>
                <div className="grid-3">
                  <input className="input" style={{ fontSize: 10 }} value={config.portraitTitleMain} onChange={e => setConfig({...config, portraitTitleMain: e.target.value})} placeholder="Titre 1" />
                  <input className="input" style={{ fontSize: 10 }} value={config.portraitTitleSub} onChange={e => setConfig({...config, portraitTitleSub: e.target.value})} placeholder="Titre 2" />
                  <input className="input" style={{ fontSize: 10 }} value={config.portraitTitleBadge} onChange={e => setConfig({...config, portraitTitleBadge: e.target.value})} placeholder="Badge" />
                </div>
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
            {(selectedTemplate.id === 'weekend_program' && totalProgramPages > 1) || (selectedTemplate.id === 'result' && totalResultPages > 1) ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handleDownload(selectedTemplate.id === 'result' ? currentResultPage : currentProgramPage)} 
                  disabled={isExporting}
                  style={{ fontWeight: 700 }}
                >
                  <Download size={14} /> Page {selectedTemplate.id === 'result' ? currentResultPage : currentProgramPage}
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={handleDownloadAllPages} 
                  disabled={isExporting}
                  style={{ boxShadow: '0 4px 14px rgba(11,77,59,0.35)', fontWeight: 800 }}
                >
                  {isExporting ? <RefreshCw size={14} className="spin" /> : <Layers size={14} />}
                  {isExporting ? 'Export...' : `Exporter Tout (${selectedTemplate.id === 'result' ? totalResultPages : totalProgramPages} PNGs)`}
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
                <span>{config.saturdayMatches.length + config.sundayMatches.length} matchs : {totalProgramPages} affiches générées automatiquement</span>
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

          {/* Multi-Page Navigation Bar for results */}
          {selectedTemplate.id === 'result' && totalResultPages > 1 && (
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
                <span>{((config.saturdayResults?.length || 0) + (config.sundayResults?.length || 0))} résultats : {totalResultPages} affiches générées automatiquement</span>
              </div>
 
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {Array.from({ length: totalResultPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCur = currentResultPage === pNum;
                  return (
                    <button
                      key={pNum}
                      className={`btn btn-sm ${isCur ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setCurrentResultPage(pNum)}
                      style={{ fontSize: 10, padding: '2px 8px', fontWeight: 800 }}
                    >
                      Partie {pNum} / {totalResultPages}
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


