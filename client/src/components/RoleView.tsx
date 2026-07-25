import type { PublicGameState, LocalIdentity, Role } from '../types';
import './RoleView.css';

const PHASES = [
  'Morgenoverraskning',
  'Spray tan & Kostume',
  'Paintball',
  'Park & Beer Olympics',
  'Middag',
  'Partybussen',
  'Klubben',
];

const POWER_ICONS: Record<string, string> = {
  double_reward: '⚡',
  swap_challenge: '🔄',
  unlock_secret: '🔍',
  remove_penalty: '🩺',
  downgrade_challenge: '📉',
  upgrade_challenge: '🔥',
  overturn_fail: '📺',
  veto_challenge: '🚫',
  force_content: '📱',
  assign_costume: '👕',
  judge: '⚖️',
  commentate: '🎙️',
  assign_drink: '🍺',
  add_timer: '⏱️',
  set_music: '🎵',
  group_challenge: '⚔️',
  add_physical: '💪',
  preview_challenges: '🔮',
  decide_post: '📲',
  immunity: '🛡️',
};

interface Props {
  state: PublicGameState;
  identity: LocalIdentity;
  roles: Role[];
}

export default function RoleView({ state, identity, roles }: Props) {
  const { phase, playerRoles, helpers } = state;

  const myRole = playerRoles.find((pr) => pr.playerId === identity.playerId);

  const roleInfo = myRole ? roles.find((r) => r.id === myRole.roleId) : null;
  const icon = roleInfo ? (POWER_ICONS[roleInfo.powerType] ?? '🃏') : '🃏';

  // Is this player a helper this phase?
  const isHelper = helpers.assigned.includes(identity.playerId);
  const isVolunteered = helpers.volunteered.includes(identity.playerId);
  const helpersFinalized = helpers.finalized;

  return (
    <div className="role-view">
      <div className="role-header">
        <div className="role-phase-label">FASE {phase + 1} · {PHASES[phase]}</div>
        <div className="role-player-name">{identity.playerName}</div>
      </div>

      {/* Helper status banner */}
      {isHelper && (
        <div className="helper-status-banner assigned">
          🤝 Du er hjælper denne fase
          <p className="helper-status-note">
            Din rolle-magt er sat på pause. Du hjælper Simon med udfordringerne.
          </p>
        </div>
      )}
      {!isHelper && isVolunteered && !helpersFinalized && (
        <div className="helper-status-banner volunteered">
          ⏳ Du har meldt dig som hjælper
          <p className="helper-status-note">
            Afventer admin bekræftelse. Hjælperne vælges snart.
          </p>
        </div>
      )}

      {roleInfo ? (
        <div className={`role-card ${myRole?.used || isHelper ? 'used' : 'available'}`}>
          <div className="role-icon">{isHelper ? '🤝' : icon}</div>
          <div className="role-name">{isHelper ? 'Hjælper' : roleInfo.name}</div>
          <div className="role-description">
            {isHelper
              ? 'Du hjælper Simon med udfordringerne denne fase. Din normale magt er sat på pause.'
              : roleInfo.description}
          </div>

          {myRole?.used && !isHelper ? (
            <div className="role-status used">✓ Magt brugt — kan ikke bruges igen</div>
          ) : isHelper ? (
            <div className="role-status helper">🤝 Hjælper aktiv</div>
          ) : (
            <div className="role-status available">
              Magt tilgængelig — koordiner med admin
            </div>
          )}
        </div>
      ) : (
        <div className="role-card no-role">
          <div className="role-icon">⏳</div>
          <div className="role-name">Ingen rolle endnu</div>
          <div className="role-description">Roller tildeles når næste fase begynder.</div>
        </div>
      )}

      {/* How to use — only if role available and not a helper */}
      {roleInfo && !myRole?.used && !isHelper && (
        <div className="role-instructions">
          <h3 className="instructions-title">Sådan bruger du din magt</h3>
          <ol className="instructions-list">
            <li>Beslut hvornår du vil aktivere din magt</li>
            <li>Sig det højt til gruppen</li>
            <li>Admin bekræfter og registrerer det i appen</li>
            <li>Din magt er brugt for denne fase</li>
          </ol>
          <p className="instructions-note">
            Du kan kun bruge din magt én gang i løbet af hele dagen.
          </p>
        </div>
      )}

      {/* Phase overview dots */}
      <div className="phase-dots">
        {PHASES.map((name, i) => (
          <div
            key={i}
            className={`phase-dot ${i === phase ? 'current' : i < phase ? 'past' : 'future'}`}
            title={name}
          />
        ))}
      </div>
    </div>
  );
}
