import { Server, Socket } from 'socket.io';
import { rooms } from './roomManager';
import { generateCode } from '../utils/generateCode';
import { Player, Room, GamePhase } from './room.types';

// Helper: broadcast state room ke semua yang ada di room
function broadcastRoom(io: Server, roomCode: string) {
  const room = rooms[roomCode];
  if (!room) return;
  io.to(roomCode).emit('room_state', room);
}

// Helper: cari player di room (sudah approved)
function findPlayer(room: Room, socketId: string): Player | undefined {
  return room.players.find((p) => p.id === socketId);
}

// Helper: siapa yang giliran berikutnya (skip folded & allIn jika semua sudah bet sama)
function getNextActiveIndex(room: Room, fromIndex: number): number {
  const total = room.players.length;
  let next = (fromIndex + 1) % total;
  let looped = 0;
  while (looped < total) {
    const p = room.players[next];
    if (!p.folded && !p.allIn) return next;
    next = (next + 1) % total;
    looped++;
  }
  return -1; // semua fold/allIn
}

// Helper: cek apakah betting round sudah selesai
function isBettingDone(room: Room): boolean {
  const activePlayers = room.players.filter((p) => !p.folded && !p.allIn);
  if (activePlayers.length === 0) return true;
  const allMatched = activePlayers.every((p) => p.currentBet === room.currentBet);
  return allMatched;
}

// Helper: cek apakah hanya 1 player yang tidak fold
function onlyOneLeft(room: Room): boolean {
  return room.players.filter((p) => !p.folded).length <= 1;
}

// Helper: reset bet per round
function resetBets(room: Room) {
  room.players.forEach((p) => {
    p.currentBet = 0;
  });
  room.currentBet = 0;
}

// Helper: advance phase
function nextPhase(room: Room): GamePhase {
  const order: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];
  const idx = order.indexOf(room.phase);
  if (idx === -1 || idx === order.length - 1) return 'showdown';
  return order[idx + 1];
}

export function roomHandlers(io: Server, socket: Socket) {

  // ─── CREATE ROOM ───────────────────────────────────────────────────────────
  socket.on('create_room', ({ name, isPlayer, chips, smallBlind = 1, bigBlind = 2 }) => {
    let code = generateCode();
    while (rooms[code]) code = generateCode(); // pastikan unik

    const dealer: Player = {
      id: socket.id,
      name,
      chips: isPlayer ? chips : 0,
      currentBet: 0,
      folded: false,
      allIn: false,
      isDealer: true,
    };

    const room: Room = {
      code,
      dealerId: socket.id,
      dealerIsPlayer: isPlayer,
      players: isPlayer ? [dealer] : [],
      waiting: [],
      smallBlind,
      bigBlind,
      phase: 'waiting',
      pot: 0,
      currentBet: 0,
      activePlayerIndex: 0,
      handNumber: 0,
      sbIndex: 0,
    };

    rooms[code] = room;
    socket.join(code);
    socket.emit('room_created', { roomCode: code });
    broadcastRoom(io, code);
  });

  // ─── UPDATE BLINDS ─────────────────────────────────────────────────────────
  socket.on('update_blinds', ({ roomCode, smallBlind, bigBlind }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    room.smallBlind = smallBlind;
    room.bigBlind = bigBlind;
    broadcastRoom(io, roomCode);
  });

  // ─── REQUEST JOIN ──────────────────────────────────────────────────────────
  socket.on('request_join', ({ roomCode, name, chips }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('join_error', { message: 'Room tidak ditemukan.' });
      return;
    }
    if (room.phase !== 'waiting') {
      socket.emit('join_error', { message: 'Game sudah dimulai.' });
      return;
    }

    const player: Player = {
      id: socket.id,
      name,
      chips,
      currentBet: 0,
      folded: false,
      allIn: false,
      isDealer: false,
    };

    room.waiting.push(player);
    socket.join(roomCode);

    // beritahu dealer ada yang mau join
    io.to(room.dealerId).emit('player_waiting', player);

    // beritahu player sendiri: masih nunggu
    socket.emit('waiting_approval');
    broadcastRoom(io, roomCode);
  });

  // ─── APPROVE PLAYER ────────────────────────────────────────────────────────
  socket.on('approve_player', ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    const idx = room.waiting.findIndex((p) => p.id === playerId);
    if (idx === -1) return;

    const [player] = room.waiting.splice(idx, 1);
    room.players.push(player);

    io.to(playerId).emit('approved');
    broadcastRoom(io, roomCode);
  });

  // ─── DECLINE / KICK PLAYER ─────────────────────────────────────────────────
  socket.on('kick_player', ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    // coba dari waiting dulu
    const waitIdx = room.waiting.findIndex((p) => p.id === playerId);
    if (waitIdx !== -1) {
      room.waiting.splice(waitIdx, 1);
      io.to(playerId).emit('kicked');
      broadcastRoom(io, roomCode);
      return;
    }

    // atau dari players (saat lobby, sebelum game start)
    const playerIdx = room.players.findIndex((p) => p.id === playerId);
    if (playerIdx !== -1) {
      room.players.splice(playerIdx, 1);
      io.to(playerId).emit('kicked');
      broadcastRoom(io, roomCode);
    }
  });

  // ─── START GAME ────────────────────────────────────────────────────────────
  socket.on('start_game', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    if (room.players.length < 2) {
      socket.emit('start_error', { message: 'Minimal 2 pemain.' });
      return;
    }

    startNewHand(io, room);
  });

  // ─── PLAYER ACTION ─────────────────────────────────────────────────────────
  socket.on('player_action', ({ roomCode, action, amount }) => {
    const room = rooms[roomCode];
    if (!room || room.phase === 'waiting' || room.phase === 'showdown') return;

    const activePlayer = room.players[room.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== socket.id) return;

    switch (action) {
      case 'fold':
        activePlayer.folded = true;
        break;

      case 'check':
        // hanya valid jika currentBet == player.currentBet
        break;

      case 'call': {
        const toCall = room.currentBet - activePlayer.currentBet;
        const actual = Math.min(toCall, activePlayer.chips);
        activePlayer.chips -= actual;
        activePlayer.currentBet += actual;
        room.pot += actual;
        if (activePlayer.chips === 0) activePlayer.allIn = true;
        break;
      }

      case 'raise': {
        const raiseAmount = Number(amount);
        const toCall = room.currentBet - activePlayer.currentBet;
        const total = toCall + raiseAmount;
        const actual = Math.min(total, activePlayer.chips);
        activePlayer.chips -= actual;
        activePlayer.currentBet += actual;
        room.pot += actual;
        room.currentBet = activePlayer.currentBet;
        if (activePlayer.chips === 0) activePlayer.allIn = true;
        break;
      }

      case 'allin': {
        const allInAmount = activePlayer.chips;
        activePlayer.currentBet += allInAmount;
        room.pot += allInAmount;
        if (activePlayer.currentBet > room.currentBet) {
          room.currentBet = activePlayer.currentBet;
        }
        activePlayer.chips = 0;
        activePlayer.allIn = true;
        break;
      }
    }

    broadcastRoom(io, roomCode);

    // cek apakah round selesai
    if (onlyOneLeft(room)) {
      // langsung showdown / award pot ke satu yang tersisa
      room.phase = 'showdown';
      broadcastRoom(io, roomCode);
      return;
    }

    if (isBettingDone(room)) {
      // advance ke phase berikutnya
      const next = nextPhase(room);
      room.phase = next;
      if (next !== 'showdown') {
        resetBets(room);
        // mulai dari player setelah dealer (sbIndex)
        room.activePlayerIndex = room.sbIndex % room.players.length;
        // skip yang fold/allIn
        const notFolded = room.players.filter(p => !p.folded && !p.allIn);
        if (notFolded.length > 0) {
          room.activePlayerIndex = room.players.findIndex(p => p.id === notFolded[0].id);
        }
      }
      broadcastRoom(io, roomCode);
    } else {
      // giliran berikutnya
      const next = getNextActiveIndex(room, room.activePlayerIndex);
      if (next === -1) {
        room.phase = nextPhase(room);
        if (room.phase !== 'showdown') {
          resetBets(room);
        }
      } else {
        room.activePlayerIndex = next;
      }
      broadcastRoom(io, roomCode);
    }
  });

  // ─── DEALER ADVANCE PHASE (manual, untuk flop/turn/river) ─────────────────
  socket.on('advance_phase', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    const next = nextPhase(room);
    room.phase = next;
    if (next !== 'showdown') {
      resetBets(room);
      const notFolded = room.players.filter(p => !p.folded && !p.allIn);
      if (notFolded.length > 0) {
        room.activePlayerIndex = room.players.findIndex(p => p.id === notFolded[0].id);
      }
    }
    broadcastRoom(io, roomCode);
  });

  // ─── DECLARE WINNER ────────────────────────────────────────────────────────
  socket.on('declare_winner', ({ roomCode, winnerIds }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    const winners: Player[] = winnerIds
      .map((id: string) => room.players.find((p) => p.id === id))
      .filter(Boolean) as Player[];

    if (winners.length === 0) return;

    const share = Math.floor(room.pot / winners.length);
    winners.forEach((w) => {
      w.chips += share;
    });

    // sisa pot karena pembagian integer
    const remainder = room.pot - share * winners.length;
    if (remainder > 0) winners[0].chips += remainder;

    io.to(roomCode).emit('winner_declared', {
      winnerIds,
      pot: room.pot,
      players: room.players,
    });

    room.pot = 0;
    broadcastRoom(io, roomCode);
  });

  // ─── NEW HAND ──────────────────────────────────────────────────────────────
  socket.on('new_hand', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    // hapus player chipless
    room.players = room.players.filter((p) => p.chips > 0);

    if (room.players.length < 2) {
      socket.emit('start_error', { message: 'Tidak cukup pemain untuk hand baru.' });
      return;
    }

    startNewHand(io, room);
  });

  // ─── REBUY ─────────────────────────────────────────────────────────────────
  socket.on('rebuy', ({ roomCode, playerId, amount }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return;

    player.chips += Number(amount);
    player.allIn = false;
    broadcastRoom(io, roomCode);
  });

  // ─── END GAME ──────────────────────────────────────────────────────────────
  socket.on('end_game', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    io.to(roomCode).emit('game_ended', { players: room.players });
    delete rooms[roomCode];
  });

  // ─── RECONNECT ─────────────────────────────────────────────────────────────
  socket.on('reconnect_room', ({ roomCode, name }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('reconnect_failed');
      return;
    }

    // cek apakah nama ada di players
    const existing = room.players.find((p) => p.name === name);
    if (existing) {
      const oldId = existing.id;
      existing.id = socket.id;
      socket.join(roomCode);
      socket.emit('reconnected', { room, playerId: socket.id });
      broadcastRoom(io, roomCode);
      return;
    }

    // cek apakah dia dealer
    if (room.players.find(p => p.isDealer)?.name === name || 
        (!room.dealerIsPlayer && room.dealerId === oldDealerId(room, name))) {
      room.dealerId = socket.id;
      socket.join(roomCode);
      socket.emit('reconnected', { room, playerId: socket.id, isDealer: true });
      broadcastRoom(io, roomCode);
      return;
    }

    socket.emit('reconnect_failed');
  });

  // ─── DISCONNECT ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    // tandai player sebagai disconnected tapi jangan hapus dulu
    // biarkan reconnect_room yang handle
    for (const code of Object.keys(rooms)) {
      const room = rooms[code];
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        io.to(code).emit('player_disconnected', { name: player.name });
        break;
      }
    }
  });
}

// ─── HELPER: Start New Hand ─────────────────────────────────────────────────
function startNewHand(io: Server, room: Room) {
  room.handNumber += 1;
  room.phase = 'preflop';
  room.pot = 0;
  room.currentBet = room.bigBlind;

  // reset semua player state
  room.players.forEach((p) => {
    p.folded = false;
    p.allIn = false;
    p.currentBet = 0;
  });

  // rotate SB setiap hand
  room.sbIndex = room.handNumber % room.players.length;
  const bbIndex = (room.sbIndex + 1) % room.players.length;

  // post blinds
  const sbPlayer = room.players[room.sbIndex];
  const bbPlayer = room.players[bbIndex];

  const sbAmount = Math.min(room.smallBlind, sbPlayer.chips);
  sbPlayer.chips -= sbAmount;
  sbPlayer.currentBet = sbAmount;
  room.pot += sbAmount;
  if (sbPlayer.chips === 0) sbPlayer.allIn = true;

  const bbAmount = Math.min(room.bigBlind, bbPlayer.chips);
  bbPlayer.chips -= bbAmount;
  bbPlayer.currentBet = bbAmount;
  room.pot += bbAmount;
  if (bbPlayer.chips === 0) bbPlayer.allIn = true;

  // giliran pertama: player setelah BB
  room.activePlayerIndex = (bbIndex + 1) % room.players.length;
  // skip yang fold/allIn
  const notFolded = room.players.filter(p => !p.folded && !p.allIn);
  if (notFolded.length > 0) {
    const firstActive = room.players.findIndex(
      (p, i) => i >= room.activePlayerIndex && !p.folded && !p.allIn
    );
    room.activePlayerIndex = firstActive !== -1 ? firstActive : 
      room.players.findIndex(p => !p.folded && !p.allIn);
  }

  broadcastRoom(io, room.code);
}

// helper dummy untuk reconnect dealer non-player
function oldDealerId(room: Room, name: string): string {
  return '';
}