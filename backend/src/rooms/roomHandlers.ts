import { Server, Socket } from 'socket.io';
import { rooms } from './roomManager';
import { generateCode } from '../utils/generateCode';
import { Player, Room, GamePhase } from './room.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function broadcastRoom(io: Server, roomCode: string) {
  const room = rooms[roomCode];
  if (!room) return;
  io.to(roomCode).emit('room_state', room);
}

// Siapa yang giliran berikutnya (skip folded & allIn), dalam playing players saja
function getNextActiveIndex(room: Room, fromIndex: number): number {
  const playingIndices = getPlayingIndices(room);
  if (playingIndices.length === 0) return -1;

  const posInPlaying = playingIndices.indexOf(fromIndex);
  const total = playingIndices.length;
  for (let i = 1; i <= total; i++) {
    const nextPos = (posInPlaying + i) % total;
    const idx = playingIndices[nextPos];
    const p = room.players[idx];
    if (!p.folded && !p.allIn) return idx;
  }
  return -1;
}

// Indices player yang ikut main (bukan dealer non-player)
function getPlayingIndices(room: Room): number[] {
  return room.players
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => {
      // Dealer non-player tidak ikut main
      if (!room.dealerIsPlayer && p.id === room.dealerId) return false;
      return true;
    })
    .map(({ i }) => i);
}

// Cek apakah betting round selesai
// Selesai jika semua active player (tidak fold, tidak allIn) bet == room.currentBet
// DAN giliran sudah kembali ke lastRaiserIndex (atau lastRaiserIndex == -1)
function isBettingDone(room: Room): boolean {
  const activePlayers = room.players.filter(p => !p.folded && !p.allIn);
  if (activePlayers.length === 0) return true;
  // Semua harus bet sama
  if (!activePlayers.every(p => p.currentBet === room.currentBet)) return false;
  // lastRaiserIndex -1 artinya tidak ada yang raise, langsung selesai
  return true;
}

// Hanya 1 player (tidak fold) tersisa?
function onlyOneLeft(room: Room): boolean {
  return room.players.filter(p => !p.folded).length <= 1;
}

function resetBets(room: Room) {
  room.players.forEach(p => { p.currentBet = 0; });
  room.currentBet = 0;
}

function nextPhase(room: Room): GamePhase {
  const order: GamePhase[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];
  const idx = order.indexOf(room.phase);
  if (idx === -1 || idx === order.length - 1) return 'showdown';
  return order[idx + 1];
}

// Set active player pertama setelah fase baru (mulai dari SB)
function setFirstActiveAfterSB(room: Room) {
  const playingIndices = getPlayingIndices(room);
  const sbPosInPlaying = playingIndices.indexOf(room.sbIndex);
  const startPos = sbPosInPlaying === -1 ? 0 : sbPosInPlaying;
  for (let i = 0; i < playingIndices.length; i++) {
    const idx = playingIndices[(startPos + i) % playingIndices.length];
    if (!room.players[idx].folded && !room.players[idx].allIn) {
      room.activePlayerIndex = idx;
      return;
    }
  }
}

// Otomatis award pot ke 1 pemenang tersisa
function autoAwardPot(io: Server, room: Room) {
  const remaining = room.players.filter(p => !p.folded);
  if (remaining.length !== 1) return;

  const winner = remaining[0];
  winner.chips += room.pot;

  io.to(room.code).emit('winner_declared', {
    winnerIds: [winner.id],
    pot: room.pot,
    players: room.players,
    auto: true,
  });

  room.pot = 0;
  room.phase = 'showdown';
  room.bettingComplete = false;
  room.lastRaiserIndex = -1;
  broadcastRoom(io, room.code);
}

// ─── advanceTurn ──────────────────────────────────────────────────────────────
function advanceTurn(io: Server, room: Room, roomCode: string) {
  // Auto-award jika hanya 1 tersisa
  if (onlyOneLeft(room)) {
    autoAwardPot(io, room);
    return;
  }

  // Cari giliran berikutnya
  const next = getNextActiveIndex(room, room.activePlayerIndex);
  if (next === -1) {
    // Semua allIn atau fold
    room.bettingComplete = true;
    room.lastRaiserIndex = -1;
    broadcastRoom(io, roomCode);
    return;
  }

  room.activePlayerIndex = next;

  // Cek apakah betting selesai SETELAH pindah giliran
  // Kasus preflop: BB bisa raise (lastRaiserIndex = bbIndex)
  // Betting selesai jika next player == lastRaiserIndex dan semua bet sama
  if (next === room.lastRaiserIndex && isBettingDone(room)) {
    room.bettingComplete = true;
    room.lastRaiserIndex = -1;
    broadcastRoom(io, roomCode);
    return;
  }

  // Cek normal isBettingDone (tanpa raise tracking)
  if (room.lastRaiserIndex === -1 && isBettingDone(room)) {
    room.bettingComplete = true;
    broadcastRoom(io, roomCode);
    return;
  }

  broadcastRoom(io, roomCode);
}

// ─── startNewHand ─────────────────────────────────────────────────────────────
function startNewHand(io: Server, room: Room) {
  room.handNumber += 1;
  room.phase = 'preflop';
  room.pot = 0;
  room.currentBet = room.bigBlind;
  room.bettingComplete = false;
  room.lastRaiserIndex = -1;

  room.players.forEach(p => {
    p.folded = false;
    p.allIn = false;
    p.currentBet = 0;
  });

  const playingIndices = getPlayingIndices(room);

  // Rotate SB di antara playing players
  const sbPosInPlaying = room.handNumber % playingIndices.length;
  room.sbIndex = playingIndices[sbPosInPlaying];
  const bbPosInPlaying = (sbPosInPlaying + 1) % playingIndices.length;
  const bbIndex = playingIndices[bbPosInPlaying];

  // Post blinds
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

  // Giliran pertama: player setelah BB
  const firstPosInPlaying = (bbPosInPlaying + 1) % playingIndices.length;
  let activeIdx = playingIndices[firstPosInPlaying];
  for (let i = 0; i < playingIndices.length; i++) {
    const candidate = playingIndices[(firstPosInPlaying + i) % playingIndices.length];
    if (!room.players[candidate].allIn && !room.players[candidate].folded) {
      activeIdx = candidate;
      break;
    }
  }
  room.activePlayerIndex = activeIdx;

  // Preflop: lastRaiserIndex = bbIndex
  // Ini memastikan betting tidak selesai sampai BB dapat kesempatan raise
  room.lastRaiserIndex = bbIndex;

  broadcastRoom(io, room.code);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function roomHandlers(io: Server, socket: Socket) {

  socket.on('create_room', ({ name, isPlayer, chips, smallBlind = 1, bigBlind = 2 }) => {
    let code = generateCode();
    while (rooms[code]) code = generateCode();

    const dealer: Player = {
      id: socket.id, name,
      chips: isPlayer ? chips : 0,
      currentBet: 0, folded: false, allIn: false, isDealer: true,
    };

    const room: Room = {
      code,
      dealerId: socket.id,
      dealerIsPlayer: isPlayer,
      players: isPlayer ? [dealer] : [],
      waiting: [],
      smallBlind, bigBlind,
      phase: 'waiting',
      pot: 0, currentBet: 0,
      activePlayerIndex: 0,
      handNumber: 0, sbIndex: 0,
      bettingComplete: false,
      lastRaiserIndex: -1,
    };

    rooms[code] = room;
    socket.join(code);
    socket.emit('room_created', { roomCode: code });
    broadcastRoom(io, code);
  });

  socket.on('update_blinds', ({ roomCode, smallBlind, bigBlind }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    room.smallBlind = smallBlind;
    room.bigBlind = bigBlind;
    broadcastRoom(io, roomCode);
  });

  socket.on('request_join', ({ roomCode, name, chips }) => {
    const room = rooms[roomCode];
    if (!room) { socket.emit('join_error', { message: 'Room tidak ditemukan.' }); return; }
    if (room.phase !== 'waiting') { socket.emit('join_error', { message: 'Game sudah dimulai.' }); return; }

    const player: Player = {
      id: socket.id, name, chips,
      currentBet: 0, folded: false, allIn: false, isDealer: false,
    };
    room.waiting.push(player);
    socket.join(roomCode);
    io.to(room.dealerId).emit('player_waiting', player);
    socket.emit('waiting_approval');
    broadcastRoom(io, roomCode);
  });

  socket.on('approve_player', ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    const idx = room.waiting.findIndex(p => p.id === playerId);
    if (idx === -1) return;
    const [player] = room.waiting.splice(idx, 1);
    room.players.push(player);
    io.to(playerId).emit('approved');
    broadcastRoom(io, roomCode);
  });

  socket.on('kick_player', ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    const waitIdx = room.waiting.findIndex(p => p.id === playerId);
    if (waitIdx !== -1) {
      room.waiting.splice(waitIdx, 1);
      io.to(playerId).emit('kicked');
      broadcastRoom(io, roomCode);
      return;
    }
    const playerIdx = room.players.findIndex(p => p.id === playerId);
    if (playerIdx !== -1) {
      room.players.splice(playerIdx, 1);
      io.to(playerId).emit('kicked');
      broadcastRoom(io, roomCode);
    }
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    if (room.players.length < 2) {
      socket.emit('start_error', { message: 'Minimal 2 pemain.' });
      return;
    }
    startNewHand(io, room);
  });

  socket.on('player_action', ({ roomCode, action, amount }) => {
    const room = rooms[roomCode];
    if (!room || room.phase === 'waiting' || room.phase === 'showdown') return;

    const activePlayer = room.players[room.activePlayerIndex];
    if (!activePlayer || activePlayer.id !== socket.id) return;

    // Dealer non-player tidak boleh bet
    if (!room.dealerIsPlayer && room.dealerId === socket.id) return;

    switch (action) {
      case 'fold':
        activePlayer.folded = true;
        break;

      case 'check':
        // Hanya valid jika tidak ada yang harus di-call
        if (activePlayer.currentBet < room.currentBet) return;
        break;

      case 'call': {
        const toCall = room.currentBet - activePlayer.currentBet;
        if (toCall <= 0) break; // tidak perlu call
        const actual = Math.min(toCall, activePlayer.chips);
        activePlayer.chips -= actual;
        activePlayer.currentBet += actual;
        room.pot += actual;
        if (activePlayer.chips === 0) activePlayer.allIn = true;
        break;
      }

      case 'raise': {
        const raiseAmount = Number(amount);
        if (raiseAmount <= 0) return;
        const toCall = room.currentBet - activePlayer.currentBet;
        const total = toCall + raiseAmount;
        const actual = Math.min(total, activePlayer.chips);
        activePlayer.chips -= actual;
        activePlayer.currentBet += actual;
        room.pot += actual;
        room.currentBet = activePlayer.currentBet;
        if (activePlayer.chips === 0) activePlayer.allIn = true;
        // Setelah raise, betting belum selesai — semua orang lain harus respond
        // lastRaiserIndex = current player, betting selesai jika giliran balik ke sini
        room.lastRaiserIndex = room.activePlayerIndex;
        room.bettingComplete = false;
        broadcastRoom(io, roomCode);
        advanceTurn(io, room, roomCode);
        return;
      }

      case 'allin': {
        const allInAmount = activePlayer.chips;
        activePlayer.currentBet += allInAmount;
        room.pot += allInAmount;
        if (activePlayer.currentBet > room.currentBet) {
          room.currentBet = activePlayer.currentBet;
          room.lastRaiserIndex = room.activePlayerIndex;
          room.bettingComplete = false;
        }
        activePlayer.chips = 0;
        activePlayer.allIn = true;
        break;
      }
    }

    broadcastRoom(io, roomCode);

    // Auto-award jika hanya 1 tersisa
    if (onlyOneLeft(room)) {
      autoAwardPot(io, room);
      return;
    }

    advanceTurn(io, room, roomCode);
  });

  socket.on('advance_phase', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    if (!room.bettingComplete && room.phase !== 'showdown') {
      socket.emit('advance_error', { message: 'Belum semua pemain selesai bet.' });
      return;
    }

    const next = nextPhase(room);
    room.phase = next;
    room.bettingComplete = false;
    room.lastRaiserIndex = -1;

    if (next !== 'showdown') {
      resetBets(room);
      setFirstActiveAfterSB(room);
    }
    broadcastRoom(io, roomCode);
  });

  socket.on('declare_winner', ({ roomCode, winnerIds }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;

    const winners: Player[] = (winnerIds as string[])
      .map(id => room.players.find(p => p.id === id))
      .filter(Boolean) as Player[];
    if (winners.length === 0) return;

    const share = Math.floor(room.pot / winners.length);
    winners.forEach(w => { w.chips += share; });
    const remainder = room.pot - share * winners.length;
    if (remainder > 0) winners[0].chips += remainder;

    io.to(roomCode).emit('winner_declared', {
      winnerIds, pot: room.pot, players: room.players, auto: false,
    });

    room.pot = 0;
    room.phase = 'showdown';
    room.bettingComplete = false;
    broadcastRoom(io, roomCode);
  });

  socket.on('new_hand', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    if (room.phase !== 'showdown') {
      socket.emit('start_error', { message: 'Hand belum selesai.' });
      return;
    }

    // Hapus pemain 0 chips (bukan dealer non-player)
    room.players = room.players.filter(p => {
      if (!room.dealerIsPlayer && p.id === room.dealerId) return false; // dealer non-player tidak di players
      return p.chips > 0;
    });

    // Hitung pemain yang bisa main
    const playingCount = getPlayingIndices(room).length;
    if (playingCount < 2) {
      socket.emit('start_error', { message: 'Tidak cukup pemain untuk hand baru.' });
      return;
    }

    startNewHand(io, room);
  });

  socket.on('rebuy', ({ roomCode, playerId, amount }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    if (room.phase !== 'showdown') {
      socket.emit('rebuy_error', { message: 'Rebuy hanya bisa saat hand selesai.' });
      return;
    }
    const player = room.players.find(p => p.id === playerId);
    if (!player) return;
    player.chips += Number(amount);
    player.allIn = false;
    broadcastRoom(io, roomCode);
  });

  socket.on('end_game', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.dealerId !== socket.id) return;
    if (room.phase !== 'showdown' && room.phase !== 'waiting') {
      socket.emit('end_error', { message: 'Game hanya bisa diakhiri setelah hand selesai.' });
      return;
    }
    io.to(roomCode).emit('game_ended', { players: room.players });
    delete rooms[roomCode];
  });

  socket.on('reconnect_room', ({ roomCode, name }) => {
    const room = rooms[roomCode];
    if (!room) { socket.emit('reconnect_failed'); return; }

    const existing = room.players.find(p => p.name === name);
    if (existing) {
      existing.id = socket.id;
      socket.join(roomCode);
      socket.emit('reconnected', { room, playerId: socket.id });
      broadcastRoom(io, roomCode);
      return;
    }

    if (!room.dealerIsPlayer) {
      room.dealerId = socket.id;
      socket.join(roomCode);
      socket.emit('reconnected', { room, playerId: socket.id, isDealer: true });
      broadcastRoom(io, roomCode);
      return;
    }

    socket.emit('reconnect_failed');
  });

  socket.on('disconnect', () => {
    for (const code of Object.keys(rooms)) {
      const room = rooms[code];
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        io.to(code).emit('player_disconnected', { name: player.name });
        break;
      }
    }
  });
}