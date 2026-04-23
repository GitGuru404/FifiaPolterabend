export interface Stats {
  content: number;
  stamina: number;
  hairline: number;
  legend: number;
  bottle: number;
  moves: number;
}

export interface StatDelta {
  stat: keyof Stats;
  amount: number;
}

export type ChallengeStatus = 'locked' | 'pending' | 'active' | 'completed' | 'failed';

export interface Challenge {
  id: string;
  phase: number;
  name: string;
  description: string;
  rewards: StatDelta[];
  penalties: StatDelta[];
  status: ChallengeStatus;
  isBossChallenge?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  powerType: string;
}

export interface PlayerRole {
  playerId: string;
  roleId: string;
  phase: number;
  used: boolean;
}

export interface Player {
  id: string;
  name: string;
}

export interface GroomCard {
  name: string;
  isIcon: boolean;
  stats: Stats;
  ovr: number;
}

export interface Helpers {
  phase: number;
  volunteered: string[];
  assigned: string[];
  finalized: boolean;
}

export interface LogEntry {
  timestamp: number;
  message: string;
  type: string;
}

export interface PublicGameState {
  phase: number;
  groomCard: GroomCard;
  challenges: Challenge[];
  players: Player[];
  playerRoles: PlayerRole[];
  helpers: Helpers;
  log: LogEntry[];
}

export interface LocalIdentity {
  playerId: string;
  playerName: string;
  isGroom?: boolean;
}
