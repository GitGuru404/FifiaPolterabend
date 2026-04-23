import type { Challenge } from '../types';
import './ChallengeModal.css';

const STATUS_LABEL: Record<string, string> = {
  locked: '🔒 Låst',
  pending: '⏳ Afventer start',
  active: '▶ I gang',
  completed: '✅ Klaret',
  failed: '❌ Fejlet',
};

interface Props {
  challenge: Challenge;
  onClose: () => void;
}

export default function ChallengeModal({ challenge, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-status-badge ${challenge.status}`}>
          {STATUS_LABEL[challenge.status]}
        </div>

        {challenge.isBossChallenge && (
          <div className="modal-boss-badge">⚡ BOSS CHALLENGE</div>
        )}

        <h2 className="modal-title">{challenge.name}</h2>
        <p className="modal-desc">{challenge.description}</p>

        <div className="modal-stats">
          <div className="modal-stat-col">
            <div className="modal-stat-header">Belønning</div>
            {challenge.rewards.map((r, i) => (
              <div key={i} className="modal-stat-row reward">
                <span>+{r.amount}</span>
                <span>{r.stat.toUpperCase()}</span>
              </div>
            ))}
          </div>
          {challenge.penalties.length > 0 && (
            <div className="modal-stat-col">
              <div className="modal-stat-header">Straf ved fejl</div>
              {challenge.penalties.map((p, i) => (
                <div key={i} className="modal-stat-row penalty">
                  <span>{p.amount}</span>
                  <span>{p.stat.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="modal-close" onClick={onClose}>Luk</button>
      </div>
    </div>
  );
}
