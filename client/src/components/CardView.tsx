import type { PublicGameState, Challenge } from '../types';
import FifaCard from './FifaCard';
import './CardView.css';

const PHASES = [
  'Morgenoverraskning',
  'Spray tan & Kostume',
  'Paintball',
  'Park & Beer Olympics',
  'Middag',
  'Partybussen',
  'Klubben',
];

const STAT_COLORS: Record<string, string> = {
  content: '#a78bfa',
  stamina: '#34d399',
  hairline: '#f472b6',
  legend: '#fbbf24',
  bottle: '#60a5fa',
  moves: '#fb923c',
};

const STATUS_LABEL: Record<string, string> = {
  locked: '🔒',
  pending: '⏳',
  active: '▶',
  completed: '✅',
  failed: '❌',
};

interface Props {
  state: PublicGameState;
  onChallengeClick: (c: Challenge) => void;
}

export default function CardView({ state, onChallengeClick }: Props) {
  const { groomCard, challenges, phase, log } = state;

  const completedCount = challenges.filter((c) => c.status === 'completed').length;
  const failedCount = challenges.filter((c) => c.status === 'failed').length;

  // All challenges for current phase (shown as tappable list)
  const allCurrentChallenges = challenges.filter((c) => c.phase === phase);

  return (
    <div className="card-view">
      {/* Phase badge */}
      <div className="phase-badge">
        <span className="phase-number">FASE {phase + 1}</span>
        <span className="phase-name">{PHASES[phase]}</span>
      </div>

      {/* The card — centrepiece */}
      <div className="card-spotlight">
        {groomCard.isIcon && <div className="icon-glow" />}
        <FifaCard card={groomCard} animate={groomCard.isIcon} />
        <div className="card-class">
          {groomCard.isIcon
            ? '★ ICON — SIMON WEBER VALENTIN ★'
            : `${completedCount} klaret · ${failedCount} fejlet`}
        </div>
      </div>

      {/* Stat bars */}
      <div className="stat-bars">
        {Object.entries(groomCard.stats).map(([key, value]) => (
          <div key={key} className="stat-bar-row">
            <span className="stat-bar-label">{key.toUpperCase()}</span>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${Math.min(value, 99)}%`,
                  background: STAT_COLORS[key] ?? '#f0d060',
                }}
              />
            </div>
            <span className="stat-bar-value">{value}</span>
          </div>
        ))}
      </div>

      {/* Current phase challenges (tappable) */}
      {allCurrentChallenges.length > 0 && (
        <div className="challenges-section">
          <h3 className="section-title">FASE {phase + 1} UDFORDRINGER</h3>
          <p className="section-hint">Tryk for detaljer</p>
          {allCurrentChallenges.map((c) => (
            <button
              key={c.id}
              className={`challenge-card ${c.status}`}
              onClick={() => onChallengeClick(c)}
            >
              <div className="challenge-card-top">
                <div className="challenge-name-row">
                  {c.isBossChallenge && <span className="challenge-boss-tag">⚡</span>}
                  <span className="challenge-name">{c.name}</span>
                </div>
                <span className={`challenge-status-icon ${c.status}`}>
                  {STATUS_LABEL[c.status]}
                </span>
              </div>
              {(c.status === 'active' || c.status === 'pending') && (
                <div className="challenge-desc">{c.description}</div>
              )}
              {c.status === 'active' && (
                <div className="challenge-rewards">
                  {c.rewards.map((r, i) => (
                    <span key={i} className="reward-chip">
                      +{r.amount} {r.stat.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Recent log */}
      {log.length > 0 && (
        <div className="log-section">
          <h3 className="section-title">SENESTE HÆNDELSER</h3>
          <div className="log-list">
            {[...log].reverse().slice(0, 8).map((entry, i) => (
              <div key={i} className="log-entry">
                <span className="log-msg">{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
