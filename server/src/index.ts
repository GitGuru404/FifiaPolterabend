import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import {
  createInitialState, advancePhase, startChallenge, completeChallenge,
  failChallenge, triggerIconUpgrade, markRoleUsed, addPlayer, removePlayer,
  updateChallenge, volunteerHelper, finalizeHelpers,
} from './gameState';
import { GameState, Challenge } from './types';
import { ROLES, ADMIN_PASSWORD, INVITE_CODE, GROOM_CODE } from './gameData';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(cors());
app.use(express.json());

const STATE_FILE = path.join(__dirname, '../../gamestate.json');

function loadState(): GameState {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) as GameState;
  } catch {}
  return createInitialState();
}

function saveState(state: GameState) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

let gameState: GameState = loadState();

function broadcast() {
  const pub = {
    phase: gameState.phase,
    groomCard: gameState.groomCard,
    challenges: gameState.challenges,
    players: gameState.players,
    playerRoles: gameState.playerRoles,
    helpers: gameState.helpers,
    log: gameState.log.slice(-50),
  };
  io.emit('gameState', pub);
  saveState(gameState);
}

// ── REST ──────────────────────────────────────────────────────
app.get('/api/state', (_, res) => {
  res.json({
    phase: gameState.phase,
    groomCard: gameState.groomCard,
    challenges: gameState.challenges,
    players: gameState.players,
    playerRoles: gameState.playerRoles,
    helpers: gameState.helpers,
    log: gameState.log.slice(-50),
    roles: ROLES,
    phases: ['Morgenoverraskning', 'Spray tan & Kostume', 'Paintball', 'Park & Beer Olympics', 'Middag', 'Partybussen', 'Klubben'],
  });
});

app.get('/api/roles', (_, res) => res.json(ROLES));

app.post('/api/admin/reset', (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  gameState = createInitialState();
  broadcast();
  res.json({ ok: true });
});

// ── Socket.io ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  // Send current state immediately on connect
  socket.emit('gameState', {
    phase: gameState.phase,
    groomCard: gameState.groomCard,
    challenges: gameState.challenges,
    players: gameState.players,
    playerRoles: gameState.playerRoles,
    helpers: gameState.helpers,
    log: gameState.log.slice(-50),
  });

  socket.on('join', (data: { inviteCode: string; playerId: string; playerName: string }) => {
    const code = (data.inviteCode ?? '').toUpperCase();
    if (code !== INVITE_CODE && code !== GROOM_CODE) {
      socket.emit('error', 'Forkert invitationskode');
      return;
    }
    if (code === INVITE_CODE) {
      gameState = addPlayer(gameState, data.playerName, data.playerId);
      broadcast();
    }
  });

  socket.on('adminJoin', (password: string, cb?: (ok: boolean) => void) => {
    if (cb) cb(password === ADMIN_PASSWORD);
  });

  socket.on('setPhase', (data: { password: string; phase: number }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = advancePhase(gameState, data.phase);
    broadcast();
  });

  socket.on('startChallenge', (data: { password: string; challengeId: string }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = startChallenge(gameState, data.challengeId);
    broadcast();
  });

  socket.on('completeChallenge', (data: { password: string; challengeId: string; double?: boolean }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = completeChallenge(gameState, data.challengeId, data.double);
    broadcast();
  });

  socket.on('failChallenge', (data: { password: string; challengeId: string }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = failChallenge(gameState, data.challengeId);
    broadcast();
  });

  socket.on('updateChallenge', (data: { password: string; challenge: Challenge }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = updateChallenge(gameState, data.challenge);
    broadcast();
  });

  socket.on('triggerIconUpgrade', (data: { password: string }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = triggerIconUpgrade(gameState);
    broadcast();
  });

  socket.on('useRolePower', (data: { password: string; playerId: string }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = markRoleUsed(gameState, data.playerId);
    broadcast();
  });

  socket.on('addPlayer', (data: { password: string; name: string; id: string }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = addPlayer(gameState, data.name, data.id);
    broadcast();
  });

  socket.on('removePlayer', (data: { password: string; playerId: string }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = removePlayer(gameState, data.playerId);
    broadcast();
  });

  socket.on('reassignRoles', (data: { password: string }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    const { assignRolesForPhase } = require('./gameState');
    gameState = { ...gameState, playerRoles: assignRolesForPhase(gameState, gameState.phase) };
    broadcast();
  });

  socket.on('volunteerHelper', (data: { playerId: string }) => {
    gameState = volunteerHelper(gameState, data.playerId);
    broadcast();
  });

  socket.on('finalizeHelpers', (data: { password: string }) => {
    if (data.password !== ADMIN_PASSWORD) return;
    gameState = finalizeHelpers(gameState);
    broadcast();
  });
});

// ── Serve built client ────────────────────────────────────────
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 FIFA Polterabend server kører på http://localhost:${PORT}`);
  console.log(`📋 Invite code: ${INVITE_CODE} | Groom code: ${GROOM_CODE}`);
  console.log(`🔑 Admin password: ${ADMIN_PASSWORD}`);
});
