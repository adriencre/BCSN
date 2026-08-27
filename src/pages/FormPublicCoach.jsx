import React, { useState, useRef } from 'react';
import { CheckCircle, Camera, AlertCircle } from 'lucide-react';
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

export function FormPublicCoach() {
  const [form, setForm] = useState({
    name: '', equipes: '', horaires: '', instagram: '',
    joueurPrefere: '', meilleurSouvenir: '', objectif: '', anecdote: '',
    consent: false,
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
    if (!form.equipes.trim()) { setError('Merci d\'indiquer ton/tes équipe(s)'); return; }
    if (!form.consent) { setError('Tu dois accepter le droit à l\'image pour continuer'); return; }

    const member = {
      id: generateId(),
      name: form.name.trim(),
      team: form.equipes.trim(),
      role: 'Coach',
      phone: '',
      email: '',
      imageConsent: form.consent ? 'granted' : 'pending',
      formCompleted: true,
      createdAt: new Date().toISOString(),
      photo: photo || null,
      formAnswers: {
        'Équipe(s) entraînée(s)': form.equipes || '—',
        'Jours et horaires': form.horaires || '—',
        'Instagram': form.instagram || '—',
        'Joueur préféré': form.joueurPrefere || '—',
        'Meilleur souvenir au club': form.meilleurSouvenir || '—',
        'Objectif cette saison': form.objectif || '—',
        'Anecdote amusante': form.anecdote || '—',
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
          <h1>Merci coach ! 🏀</h1>
          <p>Ta fiche a bien été enregistrée, <strong>{form.name}</strong>.</p>
          <p className="close-hint">Tu peux fermer cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-hero">
        <div className="form-hero-emoji">🏀</div>
        <h1>Présentation du Staff</h1>
        <p>2 minutes pour créer ta fiche coach et être présenté sur les réseaux du BCSN cette saison !</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>

        {/* Section 1 — Infos sportives */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">📋</span> Infos sportives
          </div>

          <div className="form-field">
            <label className="form-label">Prénom et Nom <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Gregory Duquesne"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Équipe(s) entraînée(s) <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              className="form-input"
              value={form.equipes}
              onChange={e => setForm({ ...form, equipes: e.target.value })}
              placeholder="Séniors A (M), École de basket"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Jours et horaires d'entraînement</label>
            <textarea
              className="form-input form-textarea"
              value={form.horaires}
              onChange={e => setForm({ ...form, horaires: e.target.value })}
              placeholder="Mar. 19h–21h, Jeu. 19h–21h, Sam. 10h–12h"
            />
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
        </div>

        {/* Section 2 — Interview rapide */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">🎙️</span> 1 minute avec le coach
          </div>
          <p style={{ fontSize: 12, color: '#64748B', marginTop: -10, marginBottom: 16, lineHeight: 1.5 }}>
            Tes réponses serviront à rédiger ta présentation sur les réseaux du club
          </p>

          <div className="form-field">
            <label className="form-label">Ton joueur préféré ?</label>
            <input
              className="form-input"
              value={form.joueurPrefere}
              onChange={e => setForm({ ...form, joueurPrefere: e.target.value })}
              placeholder="Michael Jordan"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Ton meilleur souvenir au club ?</label>
            <textarea
              className="form-input form-textarea"
              value={form.meilleurSouvenir}
              onChange={e => setForm({ ...form, meilleurSouvenir: e.target.value })}
              placeholder="Raconte-nous..."
            />
          </div>

          <div className="form-field">
            <label className="form-label">Ton objectif cette saison ?</label>
            <textarea
              className="form-input form-textarea"
              value={form.objectif}
              onChange={e => setForm({ ...form, objectif: e.target.value })}
              placeholder="Monter en division, former les jeunes..."
            />
          </div>

          <div className="form-field">
            <label className="form-label">Une anecdote amusante ? <span className="optional">optionnel</span></label>
            <textarea
              className="form-input form-textarea"
              value={form.anecdote}
              onChange={e => setForm({ ...form, anecdote: e.target.value })}
              placeholder="Un moment drôle à l'entraînement, un souvenir de match..."
            />
          </div>
        </div>

        {/* Section 3 — Photo + consentement */}
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
                  Pas de selfie ! Fais-toi prendre en photo devant un mur uni, face à la lumière naturelle, en tenue sportive du club.
                </p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        {/* Consentement */}
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
              J'autorise le BCSN à utiliser cette photo et mes réponses sur ses réseaux sociaux (Facebook, Instagram, Site Web) dans le cadre strict de la promotion du club.
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
          🏀 Envoyer ma fiche coach
        </button>
      </form>
    </div>
  );
}
