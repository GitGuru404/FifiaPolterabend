import type { GroomCard } from '../types';
import './FifaCard.css';

interface Props {
  card: GroomCard;
  animate?: boolean;
}

const STAT_LABELS: Record<string, string> = {
  content: 'CONTENT',
  stamina: 'STAMINA',
  hairline: 'HAIRLINE',
  legend: 'LEGEND',
  bottle: 'BOTTLE',
  moves: 'MOVES',
};

const STAT_ORDER = ['content', 'stamina', 'hairline', 'legend', 'bottle', 'moves'];

export default function FifaCard({ card, animate }: Props) {
  const isIcon = card.isIcon;

  return (
    <div className={`fifa-card ${isIcon ? 'icon' : 'gold'} ${animate ? 'animate-upgrade' : ''}`}>
      <div className="card-inner">
        {/* Top section */}
        <div className="card-top">
          <div className="card-ovr">{card.ovr}</div>
          <div className="card-position">CAP</div>
          <div className="card-flag">🇩🇰</div>
        </div>

        {/* Player photo */}
        <div className="card-image">
          <img
            src="/simon.png"
            alt="Simon"
            className="player-photo"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
            }}
          />
          <div className="player-silhouette" style={{ display: 'none' }}>
            {isIcon ? '👑' : '⚽'}
          </div>
        </div>

        {/* Name */}
        <div className="card-name">{card.name}</div>

        {/* Divider */}
        <div className="card-divider" />

        {/* Stats grid */}
        <div className="card-stats">
          <div className="stats-col">
            {STAT_ORDER.slice(0, 3).map((key) => (
              <div key={key} className="stat-row">
                <span className="stat-value">{card.stats[key as keyof typeof card.stats]}</span>
                <span className="stat-label">{STAT_LABELS[key]}</span>
              </div>
            ))}
          </div>
          <div className="stats-col">
            {STAT_ORDER.slice(3).map((key) => (
              <div key={key} className="stat-row">
                <span className="stat-value">{card.stats[key as keyof typeof card.stats]}</span>
                <span className="stat-label">{STAT_LABELS[key]}</span>
              </div>
            ))}
          </div>
        </div>

        {isIcon && (
          <div className="icon-badge">ICON</div>
        )}
      </div>
    </div>
  );
}
