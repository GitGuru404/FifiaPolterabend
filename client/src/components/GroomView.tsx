import type { PublicGameState } from '../types';
import FifaCard from './FifaCard';
import './GroomView.css';

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

interface Props {
  state: PublicGameState;
}

export default function GroomView({ state }: Props) {
  const { groomCard, phase } = state;

  return (
    <div className="groom-view">
      <div className="groom-phase">
        <span className="groom-phase-num">FASE {phase + 1}</span>
        <span className="groom-phase-name">{PHASES[phase]}</span>
      </div>

      <div className="groom-card-wrap">
        {groomCard.isIcon && <div className="groom-icon-glow" />}
        <FifaCard card={groomCard} animate={groomCard.isIcon} />
      </div>

      {groomCard.isIcon && (
        <div className="groom-icon-title">
          ★ ICON ★
        </div>
      )}

      <div className="groom-stat-bars">
        {Object.entries(groomCard.stats).map(([key, value]) => (
          <div key={key} className="groom-stat-row">
            <span className="groom-stat-label">{key.toUpperCase()}</span>
            <div className="groom-stat-track">
              <div
                className="groom-stat-fill"
                style={{ width: `${value}%`, background: STAT_COLORS[key] ?? '#f0d060' }}
              />
            </div>
            <span className="groom-stat-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="groom-ovr-display">
        <span className="groom-ovr-label">OVR</span>
        <span className="groom-ovr-value">{groomCard.ovr}</span>
      </div>

      <div className="groom-phase-dots">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className={`groom-dot ${i === phase ? 'current' : i < phase ? 'past' : 'future'}`}
          />
        ))}
      </div>
    </div>
  );
}
