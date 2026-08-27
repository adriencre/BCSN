import React, { useState } from 'react';
import { Cloud, CheckCircle, X, ExternalLink, RefreshCw, Key } from 'lucide-react';
import { getFirebaseConfig } from '../config/firebaseConfig';
import { isCloudEnabled } from '../services/firebase';

export function CloudConfigModal({ isOpen, onClose, onSaved }) {
  const currentConfig = getFirebaseConfig();
  const [configText, setConfigText] = useState(() => {
    return JSON.stringify(currentConfig, null, 2);
  });
  const [savedStatus, setSavedStatus] = useState(null);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(configText);
      if (!parsed.projectId) {
        setSavedStatus({ type: 'error', msg: 'Le champ "projectId" est obligatoire.' });
        return;
      }
      localStorage.setItem('bcsn_firebase_config', JSON.stringify(parsed));
      setSavedStatus({ type: 'success', msg: 'Configuration enregistrée ! Rechargement...' });
      setTimeout(() => {
        onSaved();
        onClose();
        window.location.reload();
      }, 1200);
    } catch {
      setSavedStatus({ type: 'error', msg: 'Format JSON invalide. Vérifie la ponctuation.' });
    }
  };

  const handleReset = () => {
    localStorage.removeItem('bcsn_firebase_config');
    window.location.reload();
  };

  const isConnected = isCloudEnabled();

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#161921', border: '1px solid #252830', borderRadius: 20,
        width: '100%', maxWidth: 520, padding: 24, position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer',
        }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: isConnected ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cloud size={24} color={isConnected ? '#10B981' : '#F59E0B'} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9' }}>Base de Données Cloud (Gratuite)</h2>
            <p style={{ fontSize: 12, color: isConnected ? '#10B981' : '#F59E0B', fontWeight: 600 }}>
              {isConnected ? '🟢 Connecté à Firebase Firestore' : '🟠 Mode local (localStorage)'}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, marginBottom: 16 }}>
          Pour synchroniser les formulaires remplis par les joueurs depuis leur téléphone directement sur ton ordinateur, configure ton projet <strong>Firebase (100% Gratuit)</strong>.
        </p>

        <div style={{
          background: '#0F1117', border: '1px solid #252830', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 12, color: '#CBD5E1', lineHeight: 1.5,
        }}>
          <strong style={{ color: '#F1F5F9' }}>Guide rapide (2 minutes) :</strong>
          <ol style={{ paddingLeft: 18, marginTop: 6, margin: 0 }}>
            <li>Rends-toi sur <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ color: '#168E56', textDecoration: 'underline' }}>console.firebase.google.com <ExternalLink size={10} /></a></li>
            <li>Crée un projet gratuit → Ajoute une application Web</li>
            <li>Colle le code `firebaseConfig` ci-dessous puis clique sur Enregistrer</li>
          </ol>
        </div>

        <form onSubmit={handleSave}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>
            Configuration JSON Firebase :
          </label>
          <textarea
            value={configText}
            onChange={e => setConfigText(e.target.value)}
            rows={8}
            style={{
              width: '100%', padding: 12, background: '#0F1117', border: '1px solid #2A2D38',
              borderRadius: 10, color: '#F1F5F9', fontFamily: 'monospace', fontSize: 12,
              resize: 'vertical', outline: 'none',
            }}
          />

          {savedStatus && (
            <div style={{
              marginTop: 12, padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: savedStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: savedStatus.type === 'success' ? '#10B981' : '#FCA5A5',
            }}>
              {savedStatus.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <Key size={16} /> Enregistrer la config
            </button>
            {isConnected && (
              <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ color: '#EF4444' }}>
                <RefreshCw size={14} /> Réinitialiser
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
