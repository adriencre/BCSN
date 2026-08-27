import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Mot de passe d'accès au dashboard
const DASHBOARD_PASSWORD = 'Alban030303@';

export function LoginGate({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      sessionStorage.setItem('bcsn_auth', 'true');
      onAuthenticated();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: '#0B0E14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(15,109,66,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 380,
        position: 'relative',
        zIndex: 1,
        animation: 'fadeSlideUp 0.5s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #0F6D42, #168E56)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 36,
            boxShadow: '0 8px 32px rgba(15,109,66,0.25)',
          }}>
            🏀
          </div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 24,
            fontWeight: 800,
            color: '#F1F5F9',
            marginBottom: 6,
          }}>
            BCSN Dashboard
          </h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>
            Accès réservé à l'administration
          </p>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} style={{
          background: '#161921',
          border: '1px solid #252830',
          borderRadius: 20,
          padding: '32px 24px',
          animation: shake ? 'shake 0.4s ease' : 'none',
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#CBD5E1',
              marginBottom: 8,
            }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#4A5168',
              }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Entrer le mot de passe"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 48px 14px 44px',
                  background: '#0F1117',
                  border: `1.5px solid ${error ? '#EF4444' : '#2A2D38'}`,
                  borderRadius: 12,
                  color: '#F1F5F9',
                  fontSize: 16,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => { if (!error) e.target.style.borderColor = '#168E56'; e.target.style.boxShadow = '0 0 0 3px rgba(22,142,86,0.12)'; }}
                onBlur={e => { if (!error) e.target.style.borderColor = '#2A2D38'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#FCA5A5',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
            }}>
              <AlertCircle size={15} /> Mot de passe incorrect
            </div>
          )}

          <button type="submit" style={{
            width: '100%',
            padding: '14px 24px',
            border: 'none',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0F6D42 0%, #168E56 100%)',
            color: 'white',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 20px rgba(15,109,66,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <Lock size={16} /> Se connecter
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#3A3D48', marginTop: 20 }}>
          Les formulaires joueurs & coachs restent accessibles sans connexion
        </p>
      </div>
    </div>
  );
}

export function isAuthenticated() {
  return sessionStorage.getItem('bcsn_auth') === 'true';
}
