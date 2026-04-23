import { useState } from 'react';
import type { LocalIdentity } from '../types';
import './JoinScreen.css';

interface Props {
  players: { id: string; name: string }[];
  onJoin: (identity: LocalIdentity, inviteCode: string) => void;
  onAdminJoin: (password: string) => void;
  error?: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function JoinScreen({ onJoin, onAdminJoin, error }: Props) {
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [step, setStep] = useState<'code' | 'name'>('code');

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    if (code === 'GROOM99') {
      onJoin({ playerId: 'groom', playerName: 'Simon Weber', isGroom: true }, code);
    } else if (code === 'WEBER2025') {
      setStep('name');
    }
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const storedId = localStorage.getItem(`player_id_${name.trim()}`) ?? generateId();
    localStorage.setItem(`player_id_${name.trim()}`, storedId);
    onJoin({ playerId: storedId, playerName: name.trim() }, inviteCode.trim().toUpperCase());
  }

  function handleAdminJoin(e: React.FormEvent) {
    e.preventDefault();
    onAdminJoin(adminPassword);
  }

  if (adminMode) {
    return (
      <div className="join-screen">
        <div className="join-bg-effect" />
        <div className="join-card">
          <div className="join-logo">⚙️</div>
          <h1 className="join-title">ADMIN</h1>
          <form onSubmit={handleAdminJoin} className="join-form">
            <input
              className="join-input"
              type="password"
              placeholder="Kodeord"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoComplete="off"
            />
            <button className="join-btn primary" type="submit">Log ind</button>
            <button className="join-btn ghost" type="button" onClick={() => setAdminMode(false)}>← Tilbage</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="join-screen">
      <div className="join-bg-effect" />

      <div className="join-card">
        <div className="join-ea-badge">EA SPORTS FC</div>
        <div className="join-logo">⚽</div>
        <h1 className="join-title">WEBER FC</h1>
        <p className="join-subtitle">POLTERABEND EDITION</p>

        {step === 'code' ? (
          <form onSubmit={handleCodeSubmit} className="join-form">
            <label className="join-label">INVITATIONSKODE</label>
            <input
              className="join-input"
              type="text"
              placeholder="• • • • • • • •"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              autoComplete="off"
              autoCapitalize="characters"
            />
            {error && <p className="join-error">{error}</p>}
            <button className="join-btn primary" type="submit" disabled={!inviteCode.trim()}>
              FORTSÆT
            </button>
            <button className="join-btn ghost" type="button" onClick={() => setAdminMode(true)}>
              ADMIN LOGIN
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="join-form">
            <label className="join-label">DIT NAVN</label>
            <input
              className="join-input"
              type="text"
              placeholder="Skriv dit navn..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              autoFocus
            />
            <button className="join-btn primary" type="submit" disabled={!name.trim()}>
              DELTAG
            </button>
            <button className="join-btn ghost" type="button" onClick={() => setStep('code')}>
              ← TILBAGE
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
