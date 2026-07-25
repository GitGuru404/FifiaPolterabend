import { GameState, Challenge, PlayerRole, Stats, LogEntry, Helpers } from './types';
import { STARTING_STATS, INITIAL_CHALLENGES, ROLES, INVITE_CODE, ADMIN_PASSWORD, GROOM_CODE } from './gameData';

const MAX_HELPERS = 4;

export function calcOvr(stats: Stats): number {
  const vals = Object.values(stats);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function assignRolesForPhase(state: GameState, phase: number): PlayerRole[] {
  const roles: PlayerRole[] = [];
  const shuffledPlayers = shuffleArray([...state.players]);
  const shuffledRoles = shuffleArray([...ROLES]);

  shuffledPlayers.forEach((player, idx) => {
    if (idx < shuffledRoles.length) {
      roles.push({
        playerId: player.id,
        roleId: shuffledRoles[idx].id,
        phase,
        used: false,
      });
    }
  });

  return roles;
}

// Assign roles once at game start — roles are permanent for the whole event
function assignRolesOnce(state: GameState): PlayerRole[] {
  if (state.playerRoles.length > 0) return state.playerRoles;
  return assignRolesForPhase(state, 0);
}

function emptyHelpers(phase: number): Helpers {
  return { phase, volunteered: [], assigned: [], finalized: false };
}

export function createInitialState(): GameState {
  const stats = { ...STARTING_STATS };
  const challenges: Challenge[] = INITIAL_CHALLENGES.map((c) => ({
    ...c,
    status: c.phase === 0 ? 'pending' : 'locked',
  }));

  return {
    phase: 0,
    groomCard: { name: 'SIMON WEBER', isIcon: false, stats, ovr: calcOvr(stats) },
    challenges,
    players: [],
    playerRoles: [],
    helpers: emptyHelpers(0),
    log: [],
    inviteCode: INVITE_CODE,
    adminPassword: ADMIN_PASSWORD,
  };
}

export function advancePhase(state: GameState, newPhase: number): GameState {
  const s = { ...state };
  s.phase = newPhase;

  // Unlock challenges for new phase (-> pending, not yet active)
  s.challenges = s.challenges.map((c) => ({
    ...c,
    status: c.phase === newPhase && c.status === 'locked' ? 'pending' : c.status,
  }));

  // Assign roles once for the whole event (no rotation between phases)
  s.playerRoles = assignRolesOnce(s);

  // Reset helpers for new phase
  s.helpers = emptyHelpers(newPhase);

  s.log = [...s.log, logEntry(`Fase ${newPhase + 1} begynder: ${getPhaseName(newPhase)}`, 'phase_change')];
  return s;
}

export function startChallenge(state: GameState, challengeId: string): GameState {
  const s = { ...state };
  // Deactivate any other active challenge first
  s.challenges = s.challenges.map((c) => {
    if (c.id === challengeId && c.status === 'pending') return { ...c, status: 'active' };
    if (c.status === 'active') return { ...c, status: 'pending' }; // push back to pending
    return c;
  });
  const ch = s.challenges.find((c) => c.id === challengeId);
  if (ch) s.log = [...s.log, logEntry(`▶ Udfordring startet: "${ch.name}"`, 'info')];
  return s;
}

export function completeChallenge(state: GameState, challengeId: string, double = false): GameState {
  const s = { ...state };
  const challenge = s.challenges.find((c) => c.id === challengeId);
  if (!challenge || challenge.status !== 'active') return s;

  challenge.status = 'completed';

  const newStats = { ...s.groomCard.stats };
  challenge.rewards.forEach(({ stat, amount }) => {
    const actual = double ? amount * 2 : amount;
    newStats[stat] = Math.min(99, newStats[stat] + actual);
  });

  s.groomCard = { ...s.groomCard, stats: newStats, ovr: calcOvr(newStats) };
  s.log = [...s.log, logEntry(`✅ Udfordring klaret: "${challenge.name}"`, 'challenge_complete')];
  return s;
}

export function failChallenge(state: GameState, challengeId: string): GameState {
  const s = { ...state };
  const challenge = s.challenges.find((c) => c.id === challengeId);
  if (!challenge || challenge.status !== 'active') return s;

  challenge.status = 'failed';

  const newStats = { ...s.groomCard.stats };
  challenge.penalties.forEach(({ stat, amount }) => {
    newStats[stat] = Math.max(1, newStats[stat] + amount);
  });

  s.groomCard = { ...s.groomCard, stats: newStats, ovr: calcOvr(newStats) };
  s.log = [...s.log, logEntry(`❌ Udfordring fejlet: "${challenge.name}"`, 'challenge_fail')];
  return s;
}

export function triggerIconUpgrade(state: GameState): GameState {
  const s = { ...state };
  // ICON upgrade: all stats maxed EXCEPT hairline which gets destroyed
  const iconStats: Stats = {
    content: 99,
    stamina: 99,
    hairline: 1, // hairline pays the price
    legend: 99,
    bottle: 99,
    moves: 99,
  };
  s.groomCard = {
    name: 'SIMON WEBER VALENTIN',
    isIcon: true,
    stats: iconStats,
    ovr: 99,
  };
  s.log = [...s.log, logEntry('🏆 ICON! Simon Weber er nu SIMON WEBER VALENTIN — OVR 99! (Hårlinje: RIP)', 'info')];
  return s;
}

export function volunteerHelper(state: GameState, playerId: string): GameState {
  const s = { ...state };
  const h = { ...s.helpers };
  if (h.finalized) return s;
  if (h.volunteered.includes(playerId)) return s; // already volunteered
  if (h.volunteered.length >= MAX_HELPERS) return s; // full
  h.volunteered = [...h.volunteered, playerId];
  s.helpers = h;
  const player = s.players.find((p) => p.id === playerId);
  s.log = [...s.log, logEntry(`🤝 ${player?.name ?? playerId} melder sig som hjælper`, 'helper')];
  return s;
}

export function finalizeHelpers(state: GameState): GameState {
  const s = { ...state };
  const h = { ...s.helpers };
  if (h.finalized) return s;

  const assigned = [...h.volunteered];

  // Randomly fill up to MAX_HELPERS from non-volunteering players
  if (assigned.length < MAX_HELPERS) {
    const eligible = s.players.filter((p) => !assigned.includes(p.id));
    const shuffled = shuffleArray(eligible);
    const needed = MAX_HELPERS - assigned.length;
    shuffled.slice(0, needed).forEach((p) => assigned.push(p.id));
  }

  h.assigned = assigned;
  h.finalized = true;
  s.helpers = h;

  // Helpers' role power is paused (shown via isHelper flag, not the used flag)

  const names = assigned.map((id) => s.players.find((p) => p.id === id)?.name ?? id).join(', ');
  s.log = [...s.log, logEntry(`🤝 Hjælpere fastsat: ${names}`, 'helper')];
  return s;
}

export function markRoleUsed(state: GameState, playerId: string): GameState {
  const s = { ...state };
  s.playerRoles = s.playerRoles.map((pr) =>
    pr.playerId === playerId ? { ...pr, used: true } : pr
  );
  return s;
}

export function addPlayer(state: GameState, name: string, id: string): GameState {
  if (state.players.find((p) => p.id === id)) return state;
  const s = { ...state };
  s.players = [...s.players, { id, name }];
  return s;
}

export function removePlayer(state: GameState, playerId: string): GameState {
  const s = { ...state };
  s.players = s.players.filter((p) => p.id !== playerId);
  s.playerRoles = s.playerRoles.filter((pr) => pr.playerId !== playerId);
  return s;
}

export function updateChallenge(state: GameState, updated: Challenge): GameState {
  const s = { ...state };
  s.challenges = s.challenges.map((c) => (c.id === updated.id ? updated : c));
  return s;
}

function getPhaseName(phase: number): string {
  const names = ['Morgenoverraskning', 'Spray tan & Kostume', 'Paintball', 'Park & Beer Olympics', 'Middag', 'Partybussen', 'Klubben'];
  return names[phase] ?? `Fase ${phase + 1}`;
}

function logEntry(message: string, type: LogEntry['type']): LogEntry {
  return { timestamp: Date.now(), message, type };
}
