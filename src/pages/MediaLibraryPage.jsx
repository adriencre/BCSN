import React, { useState, useRef } from 'react';
import { 
  FolderOpen, Upload, Trash2, Shield, User, Camera, 
  Image as ImageIcon, Plus, CheckCircle, Sparkles, Layers
} from 'lucide-react';
import { getInitials } from '../hooks/useLocalStorage';

export function MediaLibraryPage({ members = [], customAssets = [], onUpdateCustomAssets }) {
  const [activeTab, setActiveTab] = useState('backgrounds'); // 'backgrounds' | 'players' | 'coaches' | 'logos'
  const [uploadCategory, setUploadCategory] = useState('backgrounds');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const fileInputRef = useRef(null);

  // Filter members by role
  const playerMembers = members.filter(m => (m.role || 'Joueur') === 'Joueur' && m.photo);
  const coachMembers = members.filter(m => (m.role || '').includes('Coach') && m.photo);

  // Custom user assets filtered
  const customBackgrounds = customAssets.filter(a => a.type === 'background');
  const customLogos = customAssets.filter(a => a.type === 'logo');

  // Handle file upload converting to DataURL (Base64)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const newAsset = {
        id: `asset-${Date.now()}`,
        name: newAssetName.trim() || file.name.split('.')[0],
        type: uploadCategory === 'logos' ? 'logo' : 'background',
        url: dataUrl,
        createdAt: new Date().toISOString(),
      };
      onUpdateCustomAssets(prev => [newAsset, ...prev]);
      setNewAssetName('');
      setNewAssetUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrlAsset = () => {
    if (!newAssetUrl.trim()) return;
    const newAsset = {
      id: `asset-${Date.now()}`,
      name: newAssetName.trim() || 'Image importée',
      type: uploadCategory === 'logos' ? 'logo' : 'background',
      url: newAssetUrl.trim(),
      createdAt: new Date().toISOString(),
    };
    onUpdateCustomAssets(prev => [newAsset, ...prev]);
    setNewAssetName('');
    setNewAssetUrl('');
  };

  const handleDeleteAsset = (id) => {
    if (window.confirm('Supprimer cet asset de la médiathèque ?')) {
      onUpdateCustomAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="card mb-16" style={{ background: 'linear-gradient(135deg, #168E56 0%, #0D5634 100%)', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              📁 Médiathèque & Ressources Visuelles BCSN
            </h2>
            <p style={{ fontSize: 13, opacity: 0.9, maxWidth: 600 }}>
              Centralise tes fonds d'écran texturés (parquet, cuir, streetwear), les photos réelles de tes joueurs/coachs issues des formulaires, et les logos d'équipes pour tes posts réseaux sociaux.
            </p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            style={{ background: '#FFF', color: '#0F1117', fontWeight: 800 }}
          >
            <Upload size={16} /> Importer un Asset (Image/Logo)
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tabs mb-20">
        <button 
          className={`tab ${activeTab === 'backgrounds' ? 'active' : ''}`}
          onClick={() => setActiveTab('backgrounds')}
        >
          🖼️ Fonds & Textures ({customBackgrounds.length + 4})
        </button>
        <button 
          className={`tab ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          👤 Photos Joueurs Formulaire ({playerMembers.length})
        </button>
        <button 
          className={`tab ${activeTab === 'coaches' ? 'active' : ''}`}
          onClick={() => setActiveTab('coaches')}
        >
          👔 Photos Coachs Formulaire ({coachMembers.length})
        </button>
        <button 
          className={`tab ${activeTab === 'logos' ? 'active' : ''}`}
          onClick={() => setActiveTab('logos')}
        >
          🛡️ Logos d'Équipes ({customLogos.length})
        </button>
      </div>

      {/* TAB 1: BACKGROUNDS & TEXTURES */}
      {activeTab === 'backgrounds' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {/* Built-in default textures */}
            <div className="card" style={{ padding: 12 }}>
              <div style={{ height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: '#161921' }}>
                <img src="/artifacts/bcsn_wood_court_texture_1787834010959.png" alt="Parquet Bois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>🪵 Parquet Parquet Bois Rétro</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Texture système officielle</div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div style={{ height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: '#161921' }}>
                <img src="/artifacts/bcsn_leather_ball_texture_1787834023930.png" alt="Cuir Ballon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>🏀 Cuir Ballon de Basket</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Texture système officielle</div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div style={{ height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: '#161921' }}>
                <img src="/artifacts/bcsn_dark_sports_bg_1787833109383.png" alt="Arena Mesh" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>🏟️ Arena Sports Neon</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Texture système officielle</div>
            </div>

            <div className="card" style={{ padding: 12 }}>
              <div style={{ height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: '#161921' }}>
                <img src="/artifacts/bcsn_victory_gold_bg_1787833122029.png" alt="Or Victoire" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>🏆 Or & Confêtis Victoire</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Texture système officielle</div>
            </div>

            {/* Custom user imported backgrounds */}
            {customBackgrounds.map(asset => (
              <div key={asset.id} className="card" style={{ padding: 12, position: 'relative' }}>
                <button 
                  onClick={() => handleDeleteAsset(asset.id)}
                  style={{
                    position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.85)', color: '#FFF', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
                <div style={{ height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: '#161921' }}>
                  <img src={asset.url} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{asset.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Importé par le bureau</div>
              </div>
            ))}

            {/* Upload card button */}
            <div 
              onClick={() => { setUploadCategory('backgrounds'); fileInputRef.current?.click(); }}
              className="card" 
              style={{
                padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', border: '2px dashed var(--border)', cursor: 'pointer',
                minHeight: 200, background: 'rgba(255,255,255,0.02)'
              }}
            >
              <Plus size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>Ajouter une texture / photo de fond</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Clique pour importer (PNG, JPG)</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLAYERS FROM FORM */}
      {activeTab === 'players' && (
        <div>
          {playerMembers.length === 0 ? (
            <div className="empty-state card">
              <Camera size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontWeight: 700 }}>Aucune photo de joueur importée pour le moment</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Les photos s'ajouteront automatiquement dès que les joueurs rempliront le formulaire sur smartphone.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {playerMembers.map(p => (
                <div key={p.id} className="card" style={{ padding: 12 }}>
                  <div style={{ height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: '#161921' }}>
                    <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#F8FAFC' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary-light)', marginTop: 2 }}>{p.team || 'Joueur BCSN'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COACHES FROM FORM */}
      {activeTab === 'coaches' && (
        <div>
          {coachMembers.length === 0 ? (
            <div className="empty-state card">
              <Camera size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontWeight: 700 }}>Aucune photo de coach importée pour le moment</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Les photos s'ajouteront automatiquement via le formulaire coach.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {coachMembers.map(c => (
                <div key={c.id} className="card" style={{ padding: 12 }}>
                  <div style={{ height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 8, background: '#161921' }}>
                    <img src={c.photo} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#F8FAFC' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary-light)', marginTop: 2 }}>{c.role || 'Coach'} — {c.team || 'BCSN'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LOGOS */}
      {activeTab === 'logos' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {customLogos.map(logo => (
              <div key={logo.id} className="card" style={{ padding: 12, position: 'relative', textAlign: 'center' }}>
                <button 
                  onClick={() => handleDeleteAsset(logo.id)}
                  style={{
                    position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.85)', color: '#FFF', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
                <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <img src={logo.url} alt={logo.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{logo.name}</div>
              </div>
            ))}

            {/* Upload card button for logos */}
            <div 
              onClick={() => { setUploadCategory('logos'); fileInputRef.current?.click(); }}
              className="card" 
              style={{
                padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', border: '2px dashed var(--border)', cursor: 'pointer',
                minHeight: 180, background: 'rgba(255,255,255,0.02)'
              }}
            >
              <Plus size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: 13, textAlign: 'center' }}>Importer un logo d'équipe (PNG)</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Logo BCSN ou Équipe adverse</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
