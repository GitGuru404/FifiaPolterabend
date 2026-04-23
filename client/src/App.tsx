import { useEffect, useState, useCallback, useRef } from 'react';
import { socket } from './socket';
import type { PublicGameState, LocalIdentity, Role, Challenge } from './types';
import JoinScreen from './components/JoinScreen';
import CardView from './components/CardView';
import RoleView from './components/RoleView';
import AdminPanel from './components/AdminPanel';
import GroomView from './components/GroomView';
import HelperPopup from './components/HelperPopup';
import ChallengeModal from './components/ChallengeModal';
import './App.css';

type AppView = 'card' | 'role' | 'admin';

const STORAGE_KEY = 'weber_identity';
const ADMIN_KEY = 'weber_admin';

const PHASES = [
  'Morgenoverraskning',
  'Spray tan & Kostume',
  'Paintball',
  'Park & Beer Olympics',
  'Middag',
  'Partybussen',
  'Klubben',
];

function loadIdentity(): LocalIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveIdentity(id: LocalIdentity) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
}

export default function App() {
  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [identity, setIdentity] = useState<LocalIdentity | null>(loadIdentity);
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem(ADMIN_KEY));
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem(ADMIN_KEY) ?? '');
  const [view, setView] = useState<AppView>('card');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  // Helper popup — shown when phase changes for non-groom players
  const [showHelperPopup, setShowHelperPopup] = useState(false);
  const lastPhaseRef = useRef<number | null>(null);

  // Challenge detail modal
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Fetch roles once
  useEffect(() => {
    fetch('/api/roles')
      .then((r) => r.json())
      .then(setRoles)
      .catch(() => {});
  }, []);

  // Socket setup
  useEffect(() => {
    socket.connect();

    function onConnect() {
      setConnected(true);
      const id = loadIdentity();
      if (id) {
        socket.emit('join', {
          inviteCode: id.isGroom ? 'GROOM99' : 'WEBER2025',
          playerId: id.playerId,
          playerName: id.playerName,
        });
      }
    }

    function onGameState(state: PublicGameState) {
      setGameState((prev) => {
        // Detect phase change → show helper popup for non-groom, non-admin
        const id = loadIdentity();
        if (
          id &&
          !id.isGroom &&
          !localStorage.getItem(ADMIN_KEY) &&
          prev !== null &&
          state.phase !== prev.phase
        ) {
          setShowHelperPopup(true);
        }
        lastPhaseRef.current = state.phase;
        return state;
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', () => setConnected(false));
    socket.on('gameState', onGameState);
    socket.on('error', (msg: string) => setError(msg));

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect');
      socket.off('gameState', onGameState);
      socket.off('error');
    };
  }, []);

  // Poll fallback every 5s when disconnected
  useEffect(() => {
    if (connected) return;
    const id = setInterval(() => {
      fetch('/api/state')
        .then((r) => r.json())
        .then((data) => {
          setGameState(data);
          if (data.roles) setRoles(data.roles);
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [connected]);

  const handleJoin = useCallback((id: LocalIdentity, code: string) => {
    setError('');
    const upper = code.toUpperCase();
    if (upper !== 'WEBER2025' && upper !== 'GROOM99') {
      setError('Forkert invitationskode');
      return;
    }
    saveIdentity(id);
    setIdentity(id);
    socket.emit('join', {
      inviteCode: upper,
      playerId: id.playerId,
      playerName: id.playerName,
    });
  }, []);

  const handleAdminJoin = useCallback((password: string) => {
    socket.emit('adminJoin', password, (ok: boolean) => {
      if (ok) {
        setIsAdmin(true);
        setAdminPassword(password);
        localStorage.setItem(ADMIN_KEY, password);
        setView('admin');
      } else {
        setError('Forkert admin-kodeord');
      }
    });
  }, []);

  if (!gameState) {
    return (
      <div className="loading-screen">
        <div className="loading-ball">⚽</div>
        <div className="loading-text">Henter spiltilstand…</div>
      </div>
    );
  }

  if (!identity && !isAdmin) {
    return (
      <JoinScreen
        players={gameState.players}
        onJoin={handleJoin}
        onAdminJoin={handleAdminJoin}
        error={error}
      />
    );
  }

  // Groom gets minimal view — card + stats only
  if (identity?.isGroom) {
    return (
      <div className="app">
        <div className={`conn-dot ${connected ? 'online' : 'offline'}`} />
        <GroomView state={gameState} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className={`conn-dot ${connected ? 'online' : 'offline'}`} title={connected ? 'Tilsluttet' : 'Offline'} />

      {/* Helper volunteer popup (shows on phase change) */}
      {showHelperPopup && identity && !isAdmin && (
        <HelperPopup
          helpers={gameState.helpers}
          players={gameState.players}
          myPlayerId={identity.playerId}
          phase={gameState.phase}
          phaseName={PHASES[gameState.phase] ?? `Fase ${gameState.phase + 1}`}
          onDismiss={() => setShowHelperPopup(false)}
        />
      )}

      {/* Challenge detail modal */}
      {selectedChallenge && (
        <ChallengeModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}

      <main className="app-main">
        {isAdmin && view === 'admin' ? (
          <AdminPanel state={gameState} roles={roles} adminPassword={adminPassword} />
        ) : view === 'card' ? (
          <CardView state={gameState} onChallengeClick={setSelectedChallenge} />
        ) : (
          identity && (
            <RoleView state={gameState} identity={identity} roles={roles} />
          )
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-btn ${view === 'card' ? 'active' : ''}`}
          onClick={() => setView('card')}
        >
          <span className="nav-icon">⚽</span>
          <span className="nav-label">Kort</span>
        </button>

        {identity && !isAdmin && (
          <button
            className={`nav-btn ${view === 'role' ? 'active' : ''}`}
            onClick={() => setView('role')}
          >
            <span className="nav-icon">🃏</span>
            <span className="nav-label">Min rolle</span>
          </button>
        )}

        {isAdmin && (
          <button
            className={`nav-btn ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView('admin')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Admin</span>
          </button>
        )}
      </nav>
    </div>
  );
}
