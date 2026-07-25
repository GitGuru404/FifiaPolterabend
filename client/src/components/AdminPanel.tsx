import { useState } from 'react';
import type { PublicGameState, Challenge, Role } from '../types';
import FifaCard from './FifaCard';
import { socket } from '../socket';
import './AdminPanel.css';

const PHASES = [
  'Morgenoverraskning',
  'Spray tan & Kostume',
  'Paintball',
  'Park & Beer Olympics',
  'Middag',
  'Partybussen',
  'Klubben',
];

interface Props {
  state: PublicGameState;
  roles: Role[];
  adminPassword: string;
}

type AdminTab = 'overview' | 'challenges' | 'roles' | 'players';

interface ConfirmAction {
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function AdminPanel({ state, roles, adminPassword }: Props) {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [iconConfirm, setIconConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  function emit(event: string, data: object) {
    socket.emit(event, { password: adminPassword, ...data });
  }

  function confirmThen(action: ConfirmAction) {
    setConfirmAction(action);
  }

  function executeConfirm() {
    confirmAction?.onConfirm();
    setConfirmAction(null);
  }

  function setPhase(phase: number) {
    confirmThen({
      title: `Skift til fase ${phase + 1}`,
      message: `Er du sikker på, at du vil starte fase ${phase + 1}: "${PHASES[phase]}"?`,
      onConfirm: () => emit('setPhase', { phase }),
    });
  }

  function startChallenge(id: string, name: string) {
    confirmThen({
      title: 'Start udfordring',
      message: `Vil du starte udfordringen "${name}"?`,
      onConfirm: () => emit('startChallenge', { challengeId: id }),
    });
  }

  function completeChallenge(id: string, double = false) {
    emit('completeChallenge', { challengeId: id, double });
  }

  function failChallenge(id: string) {
    emit('failChallenge', { challengeId: id });
  }

  function saveChallenge(c: Challenge) {
    emit('updateChallenge', { challenge: c });
    setEditingChallenge(null);
  }

  function reassignRoles() {
    socket.emit('reassignRoles', { password: adminPassword });
  }

  function markRoleUsed(playerId: string) {
    emit('useRolePower', { playerId });
  }

  function finalizeHelpers() {
    emit('finalizeHelpers', {});
  }

  function addPlayer() {
    if (!newPlayerName.trim()) return;
    const id = Math.random().toString(36).slice(2, 10);
    emit('addPlayer', { name: newPlayerName.trim(), id });
    setNewPlayerName('');
  }

  function removePlayer(playerId: string) {
    emit('removePlayer', { playerId });
  }

  function triggerIcon() {
    emit('triggerIconUpgrade', {});
    setIconConfirm(false);
  }

  const currentPhaseRoles = state.playerRoles;
  const helpers = state.helpers;
  const helperNames = helpers.assigned.map(
    (id) => state.players.find((p) => p.id === id)?.name ?? id
  );

  return (
    <div className="admin-panel">
      {/* Confirm overlay */}
      {confirmAction && (
        <div className="admin-confirm-overlay">
          <div className="admin-confirm-card">
            <h3 className="confirm-title">{confirmAction.title}</h3>
            <p className="confirm-msg">{confirmAction.message}</p>
            <div className="confirm-btns">
              <button className="action-btn success" onClick={executeConfirm}>
                ✓ Bekræft
              </button>
              <button className="cancel-btn" onClick={() => setConfirmAction(null)}>
                Annuller
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-header">
        <FifaCard card={state.groomCard} />
        <div className="admin-ovr-info">
          <span className="admin-ovr">{state.groomCard.ovr} OVR</span>
          <span className="admin-name">{state.groomCard.name}</span>
        </div>
      </div>

      {/* Tab nav */}
      <nav className="admin-tabs">
        {(['overview', 'challenges', 'roles', 'players'] as AdminTab[]).map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' && '🎮'}
            {t === 'challenges' && '⚡'}
            {t === 'roles' && '🃏'}
            {t === 'players' && '👥'}
            <span className="admin-tab-label">
              {t === 'overview' && 'Oversigt'}
              {t === 'challenges' && 'Udfordringer'}
              {t === 'roles' && 'Roller'}
              {t === 'players' && 'Spillere'}
            </span>
          </button>
        ))}
      </nav>

      {/* ── OVERVIEW tab ── */}
      {tab === 'overview' && (
        <div className="admin-section">
          <h2 className="admin-section-title">Fase kontrol</h2>
          <div className="phase-buttons">
            {PHASES.map((name, i) => (
              <button
                key={i}
                className={`phase-btn ${state.phase === i ? 'current' : i < state.phase ? 'done' : ''}`}
                onClick={() => setPhase(i)}
              >
                <span className="phase-btn-num">{i + 1}</span>
                <span className="phase-btn-name">{name}</span>
              </button>
            ))}
          </div>

          {/* ICON upgrade */}
          <div className="icon-section">
            <h2 className="admin-section-title">ICON Upgrade</h2>
            {!iconConfirm ? (
              <button className="icon-btn" onClick={() => setIconConfirm(true)}>
                🏆 Aktiver ICON Upgrade
              </button>
            ) : (
              <div className="icon-confirm">
                <p>Er du sikker? Simon bliver ICON — HAIRLINE sættes til 1, alt andet til 99.</p>
                <div className="confirm-btns">
                  <button className="icon-btn confirm" onClick={triggerIcon}>Ja, aktiver!</button>
                  <button className="cancel-btn" onClick={() => setIconConfirm(false)}>Annuller</button>
                </div>
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="reset-section">
            <h2 className="admin-section-title">Nulstil spil</h2>
            {!resetConfirm ? (
              <button className="reset-btn" onClick={() => setResetConfirm(true)}>
                🔄 Nulstil til start
              </button>
            ) : (
              <div className="icon-confirm">
                <p>Dette sletter ALT — alle spillere, faser og point. Bruges til test-kørsler.</p>
                <div className="confirm-btns">
                  <button
                    className="reset-btn confirm"
                    onClick={() => {
                      fetch('/api/admin/reset', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: adminPassword }),
                      });
                      setResetConfirm(false);
                    }}
                  >
                    Ja, nulstil
                  </button>
                  <button className="cancel-btn" onClick={() => setResetConfirm(false)}>Annuller</button>
                </div>
              </div>
            )}
          </div>

          {/* Log */}
          <h2 className="admin-section-title">Hændelseslog</h2>
          <div className="admin-log">
            {[...state.log].reverse().map((e, i) => (
              <div key={i} className="admin-log-entry">{e.message}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── CHALLENGES tab ── */}
      {tab === 'challenges' && (
        <div className="admin-section">
          <h2 className="admin-section-title">Udfordringer — Fase {state.phase + 1}</h2>
          {editingChallenge ? (
            <ChallengeEditor
              challenge={editingChallenge}
              onSave={saveChallenge}
              onCancel={() => setEditingChallenge(null)}
            />
          ) : (
            <div className="challenge-list">
              {PHASES.map((phaseName, phaseIdx) => {
                const phaseChallenges = state.challenges.filter((c) => c.phase === phaseIdx);
                if (phaseChallenges.length === 0) return null;
                return (
                  <div key={phaseIdx}>
                    <div className={`challenge-phase-header ${phaseIdx === state.phase ? 'current-phase' : ''}`}>
                      {phaseIdx + 1}. {phaseName}
                    </div>
                    {phaseChallenges.map((c) => (
                      <div key={c.id} className={`admin-challenge ${c.status}`}>
                        <div className="admin-challenge-top">
                          <div className="admin-challenge-name-row">
                            {c.isBossChallenge && <span className="boss-tag">⚡ BOSS</span>}
                            <span className="admin-challenge-name">{c.name}</span>
                          </div>
                          <span className={`challenge-status-badge ${c.status}`}>
                            {c.status === 'pending' && '⏳ Afventer'}
                            {c.status === 'active' && '▶ Aktiv'}
                            {c.status === 'locked' && '🔒 Låst'}
                            {c.status === 'completed' && '✅ Klaret'}
                            {c.status === 'failed' && '❌ Fejlet'}
                          </span>
                        </div>
                        <p className="admin-challenge-desc">{c.description}</p>
                        <div className="admin-challenge-actions">
                          {c.status === 'pending' && (
                            <button
                              className="action-btn start"
                              onClick={() => startChallenge(c.id, c.name)}
                            >
                              ▶ Start
                            </button>
                          )}
                          {c.status === 'active' && (
                            <>
                              <button
                                className="action-btn success"
                                onClick={() => completeChallenge(c.id)}
                              >
                                ✅ Klaret
                              </button>
                              <button
                                className="action-btn success-double"
                                onClick={() => completeChallenge(c.id, true)}
                              >
                                ⚡ ×2
                              </button>
                              <button
                                className="action-btn danger"
                                onClick={() => failChallenge(c.id)}
                              >
                                ❌ Fejlet
                              </button>
                            </>
                          )}
                          <button
                            className="action-btn edit"
                            onClick={() => setEditingChallenge({ ...c })}
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ROLES tab ── */}
      {tab === 'roles' && (
        <div className="admin-section">
          <div className="roles-header">
            <h2 className="admin-section-title">Roller — Fase {state.phase + 1}</h2>
            <button className="reassign-btn" onClick={reassignRoles}>
              🔀 Ny tildeling
            </button>
          </div>

          {/* Helper status */}
          <div className="helper-admin-section">
            <div className="helper-admin-header">
              <span className="helper-admin-title">🤝 Hjælpere denne fase</span>
              <span className="helper-admin-count">
                {helpers.volunteered.length} meldt sig · {helpers.assigned.length} tildelt
              </span>
            </div>
            {!helpers.finalized ? (
              <>
                {helpers.volunteered.length > 0 && (
                  <div className="helper-chips">
                    {helpers.volunteered.map((id) => {
                      const p = state.players.find((pl) => pl.id === id);
                      return <span key={id} className="helper-chip">{p?.name ?? id}</span>;
                    })}
                  </div>
                )}
                <button className="action-btn success helper-finalize-btn" onClick={finalizeHelpers}>
                  ✓ Afslut hjælpertilmelding
                </button>
              </>
            ) : (
              <>
                <div className="helper-chips">
                  {helperNames.map((n) => (
                    <span key={n} className="helper-chip assigned">{n}</span>
                  ))}
                </div>
                <div className="helper-finalized-badge">Hjælpere er låst for denne fase</div>
              </>
            )}
          </div>

          <div className="roles-list">
            {currentPhaseRoles.map((pr) => {
              const player = state.players.find((p) => p.id === pr.playerId);
              const role = roles.find((r) => r.id === pr.roleId);
              const isHelper = helpers.assigned.includes(pr.playerId);
              return (
                <div key={pr.playerId} className={`role-admin-row ${pr.used ? 'used' : ''} ${isHelper ? 'is-helper' : ''}`}>
                  <div className="role-admin-info">
                    <span className="role-admin-player">
                      {player?.name ?? '?'}
                      {isHelper && <span className="helper-tag">🤝 Hjælper</span>}
                    </span>
                    <span className="role-admin-role">{role?.name ?? pr.roleId}</span>
                    <span className="role-admin-desc">{role?.description}</span>
                  </div>
                  {!pr.used ? (
                    <button
                      className="action-btn edit"
                      onClick={() => markRoleUsed(pr.playerId)}
                    >
                      Magt brugt
                    </button>
                  ) : (
                    <span className="role-used-badge">Brugt</span>
                  )}
                </div>
              );
            })}
            {currentPhaseRoles.length === 0 && (
              <p className="empty-state">Ingen roller tildelt endnu. Start en fase for at tildele roller.</p>
            )}
          </div>
        </div>
      )}

      {/* ── PLAYERS tab ── */}
      {tab === 'players' && (
        <div className="admin-section">
          <h2 className="admin-section-title">Spillere ({state.players.length})</h2>
          <div className="add-player-row">
            <input
              className="admin-input"
              type="text"
              placeholder="Navn på ny spiller"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button className="action-btn success" onClick={addPlayer}>
              + Tilføj
            </button>
          </div>
          <div className="players-list">
            {state.players.map((p) => {
              const role = currentPhaseRoles.find((pr) => pr.playerId === p.id);
              const roleInfo = role ? roles.find((r) => r.id === role.roleId) : null;
              const isHelper = helpers.assigned.includes(p.id);
              return (
                <div key={p.id} className="player-row">
                  <div className="player-info">
                    <span className="player-name">{p.name}</span>
                    <div className="player-tags">
                      {roleInfo && <span className="player-role-tag">{roleInfo.name}</span>}
                      {isHelper && <span className="player-helper-tag">🤝 Hjælper</span>}
                    </div>
                  </div>
                  <button
                    className="action-btn danger small"
                    onClick={() => removePlayer(p.id)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            {state.players.length === 0 && (
              <p className="empty-state">Ingen spillere tilmeldt endnu.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Challenge editor ──────────────────────────────────────────
function ChallengeEditor({
  challenge,
  onSave,
  onCancel,
}: {
  challenge: Challenge;
  onSave: (c: Challenge) => void;
  onCancel: () => void;
}) {
  const [c, setC] = useState<Challenge>({ ...challenge });

  return (
    <div className="challenge-editor">
      <h3 className="editor-title">Rediger udfordring</h3>

      <label className="editor-label">Navn</label>
      <input
        className="admin-input"
        value={c.name}
        onChange={(e) => setC({ ...c, name: e.target.value })}
      />

      <label className="editor-label">Beskrivelse</label>
      <textarea
        className="admin-textarea"
        value={c.description}
        onChange={(e) => setC({ ...c, description: e.target.value })}
        rows={4}
      />

      <label className="editor-label">Belønninger (stat:amount, ét per linje)</label>
      <textarea
        className="admin-textarea"
        value={c.rewards.map((r) => `${r.stat}:${r.amount}`).join('\n')}
        onChange={(e) => {
          const rewards = e.target.value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [stat, amount] = line.split(':');
              return { stat: stat as any, amount: parseInt(amount) || 0 };
            });
          setC({ ...c, rewards });
        }}
        rows={3}
      />

      <label className="editor-label">Straffe (stat:amount, ét per linje — brug negative tal)</label>
      <textarea
        className="admin-textarea"
        value={c.penalties.map((r) => `${r.stat}:${r.amount}`).join('\n')}
        onChange={(e) => {
          const penalties = e.target.value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [stat, amount] = line.split(':');
              return { stat: stat as any, amount: parseInt(amount) || 0 };
            });
          setC({ ...c, penalties });
        }}
        rows={3}
      />

      <div className="editor-actions">
        <button className="action-btn success" onClick={() => onSave(c)}>
          Gem ændringer
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Annuller
        </button>
      </div>
    </div>
  );
}
