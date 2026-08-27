import React, { useState, useRef } from 'react';
import { CheckCircle, Camera, AlertCircle } from 'lucide-react';
import { TEAMS } from '../data/teamsData';
import { generateId } from '../hooks/useLocalStorage';
import { isCloudEnabled, saveMemberCloud } from '../services/firebase';
import '../styles/forms.css';

function resizeImage(file, maxWidth = 400) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const POSTES = [
  { value: 'Meneur (Poste 1)', emoji: '1️⃣' },
  { value: 'Arrière (Poste 2)', emoji: '2️⃣' },
  { value: 'Ailier (Poste 3)', emoji: '3️⃣' },
  { value: 'Ailier Fort (Poste 4)', emoji: '4️⃣' },
  { value: 'Pivot (Poste 5)', emoji: '5️⃣' },
];

export function FormPublicJoueur() {
  const [form, setForm] = useState({
    name: '', team: '', maillot: '', taille: '', poste: '',
    instagram: '', surnom: '', joueurPrefere: '', consent: false,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const resized = await resizeImage(file);
    setPhoto(resized);
    setPhotoPreview(resized);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Merci d\'indiquer ton prénom et nom'); return; }
    if (!form.team) { setError('Merci de sélectionner ton équipe'); return; }
    if (!form.consent) { setError('Tu dois accepter le droit à l\'image pour continuer'); return; }

    const member = {
      id: generateId(),
      name: form.name.trim(),
      team: form.team,
      role: 'Joueur',
      phone: '',
      email: '',
      imageConsent: form.consent ? 'granted' : 'pending',
      formCompleted: true,
      createdAt: new Date().toISOString(),
      photo: photo || null,
      formAnswers: {
        'Numéro de maillot': form.maillot || '—',
        'Taille (cm)': form.taille || '—',
        'Poste de jeu': form.poste || '—',
        'Instagram': form.instagram || '—',
        'Surnom': form.surnom || '—',
        'Joueur/Joueuse préféré(e)': form.joueurPrefere || '—',
      },
    };

    try {
      if (isCloudEnabled()) {
        saveMemberCloud(member);
      }
      const existing = JSON.parse(localStorage.getItem('bcsn_members') || '[]');
      existing.push(member);
      localStorage.setItem('bcsn_members', JSON.stringify(existing));
      setSubmitted(true);
    } catch {
      setError('Erreur lors de l\'enregistrement. Réessaie.');
    }
  };

  if (submitted) {
    return (
      <div className="form-success">
        <div className="form-success-card">
          <div className="form-success-icon">
            <CheckCircle size={40} color="#10B981" />
          </div>
          <h1>C'est envoyé ! 🏀</h1>
          <p>Merci <strong>{form.name}</strong> !<br />Ta carte joueur est en cours de création.</p>
          <p className="close-hint">Tu peux fermer cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-hero">
        <div className="form-hero-emoji">🏀</div>
        <h1>Crée ta Carte Joueur</h1>
        <p>2 minutes pour créer ta carte de collection et être mis en avant sur les réseaux du BCSN !</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>

        {/* Section 1 — Identité */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">📋</span> Qui es-tu ?
          </div>

          <div className="form-field">
            <label className="form-label">Prénom et Nom <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Lucas Martin"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Ton équipe <span style={{ color: '#EF4444' }}>*</span></label>
            <select
              className="form-input form-select"
              value={form.team}
              onChange={e => setForm({ ...form, team: e.target.value })}
            >
              <option value="">— Choisis ton équipe —</option>
              {TEAMS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Section 2 — Sport */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">🏅</span> Sur le terrain
          </div>

          <div className="form-field">
            <div className="form-row">
              <div>
                <label className="form-label">N° de maillot</label>
                <input
                  className="form-input"
                  type="number"
                  inputMode="numeric"
                  value={form.maillot}
                  onChange={e => setForm({ ...form, maillot: e.target.value })}
                  placeholder="7"
                />
              </div>
              <div>
                <label className="form-label">Taille (cm)</label>
                <input
                  className="form-input"
                  type="number"
                  inputMode="numeric"
                  value={form.taille}
                  onChange={e => setForm({ ...form, taille: e.target.value })}
                  placeholder="185"
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Ton poste</label>
            <div className="form-radio-group">
              {POSTES.map(p => (
                <label
                  key={p.value}
                  className={`form-radio ${form.poste === p.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="poste"
                    value={p.value}
                    checked={form.poste === p.value}
                    onChange={e => setForm({ ...form, poste: e.target.value })}
                  />
                  <div className="form-radio-dot" />
                  <span className="form-radio-label">{p.emoji} {p.value}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3 — Fun */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">📱</span> Fun & Réseaux <span className="optional" style={{ fontSize: 10, color: '#64748B', fontWeight: 400, marginLeft: 4 }}>optionnel</span>
          </div>

          <div className="form-field">
            <label className="form-label">Instagram <span className="optional">optionnel</span></label>
            <input
              className="form-input"
              value={form.instagram}
              onChange={e => setForm({ ...form, instagram: e.target.value })}
              placeholder="@ton_pseudo"
            />
          </div>

          <div className="form-field">
            <div className="form-row">
              <div>
                <label className="form-label">Ton surnom <span className="optional">optionnel</span></label>
                <input
                  className="form-input"
                  value={form.surnom}
                  onChange={e => setForm({ ...form, surnom: e.target.value })}
                  placeholder="Le Tank"
                />
              </div>
              <div>
                <label className="form-label">Joueur/euse préféré(e) <span className="optional">optionnel</span></label>
                <input
                  className="form-input"
                  value={form.joueurPrefere}
                  onChange={e => setForm({ ...form, joueurPrefere: e.target.value })}
                  placeholder="LeBron James"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 — Photo */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">📸</span> Ta photo officielle
          </div>

          <div
            className={`form-photo-zone ${photoPreview ? 'has-photo' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Preview" className="photo-preview" />
                <p className="photo-success">✓ Photo ajoutée</p>
                <p className="photo-hint">Touche pour changer</p>
              </>
            ) : (
              <>
                <div className="photo-icon"><Camera size={24} /></div>
                <p className="photo-title">Ajouter ta photo</p>
                <p className="photo-hint">
                  Pas de selfie ! Fais-toi prendre en photo devant un mur uni, face à la lumière, en maillot du club, plan américain avec un ballon.
                </p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        {/* Section 5 — Consent */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">✅</span> Droit à l'image
          </div>

          <label className={`form-consent ${form.consent ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={form.consent}
              onChange={e => setForm({ ...form, consent: e.target.checked })}
            />
            <div className="form-consent-box" />
            <span className="form-consent-text">
              J'autorise le club à utiliser cette photo sur ses réseaux sociaux (Facebook, Instagram, Site Web) pour la promotion du club. <strong>Pour les mineurs, cette case vaut accord du représentant légal.</strong>
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="form-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="form-submit">
          🏀 Envoyer ma carte joueur
        </button>
      </form>
    </div>
  );
}
