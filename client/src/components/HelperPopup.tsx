import { useState } from 'react';
import type { Helpers, Player } from '../types';
import { socket } from '../socket';
import './HelperPopup.css';

interface Props {
  helpers: Helpers;
  players: Player[];
  myPlayerId: string;
  phase: number;
  phaseName: string;
  onDismiss: () => void;
}

export default function HelperPopup({ helpers, players, myPlayerId, phase, phaseName, onDismiss }: Props) {
  const [volunteered, setVolunteered] = useState(false);

  const hasVolunteered = helpers.volunteered.includes(myPlayerId) || volunteered;
  const count = helpers.volunteered.length;
  const isFull = count >= 4;

  function handleVolunteer() {
    socket.emit('volunteerHelper', { playerId: myPlayerId });
    setVolunteered(true);
  }

  const volunteerNames = helpers.volunteered
    .map((id) => players.find((p) => p.id === id)?.name ?? id);

  return (
    <div className="helper-overlay">
      <div className="helper-modal">
        <div className="helper-badge">FASE {phase + 1}</div>
        <h2 className="helper-title">{phaseName}</h2>
        <p className="helper-subtitle">
          Vil du hjælpe Simon med denne fases udfordringer?
        </p>
        <p className="helper-note">
          Som hjælper mister du din rolle-evne denne fase, men du hjælper Simon med at klare udfordringerne.
          Der vælges max <strong>4 hjælpere</strong>.
        </p>

        <div className="helper-count">
          <span className="helper-count-num">{count}</span>
          <span className="helper-count-label">/ 4 har meldt sig</span>
        </div>

        {volunteerNames.length > 0 && (
          <div className="helper-names">
            {volunteerNames.map((n) => (
              <span key={n} className="helper-name-chip">{n}</span>
            ))}
          </div>
        )}

        <div className="helper-actions">
          {!hasVolunteered && !isFull && (
            <button className="helper-btn volunteer" onClick={handleVolunteer}>
              🤝 Hjælp Simon
            </button>
          )}
          {hasVolunteered && (
            <div className="helper-confirmed">✓ Du er tilmeldt som hjælper</div>
          )}
          {isFull && !hasVolunteered && (
            <div className="helper-confirmed">Hold er fyldt (4/4)</div>
          )}
          <button className="helper-btn dismiss" onClick={onDismiss}>
            Luk
          </button>
        </div>
      </div>
    </div>
  );
}
