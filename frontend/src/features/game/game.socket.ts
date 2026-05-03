import { Socket } from 'socket.io-client';
import { PlayerAction } from './game.types';
import { Player } from '../room/room.types';

// ─── Emitters ────────────────────────────────────────────────────────────────

export function emitPlayerAction(socket: Socket, roomCode: string, action: PlayerAction, amount?: number) {
  socket.emit('player_action', { roomCode, action, amount });
}

export function emitAdvancePhase(socket: Socket, roomCode: string) {
  socket.emit('advance_phase', { roomCode });
}

export function emitDeclareWinner(socket: Socket, roomCode: string, winnerIds: string[]) {
  socket.emit('declare_winner', { roomCode, winnerIds });
}

export function emitNewHand(socket: Socket, roomCode: string) {
  socket.emit('new_hand', { roomCode });
}

export function emitRebuy(socket: Socket, roomCode: string, playerId: string, amount: number) {
  socket.emit('rebuy', { roomCode, playerId, amount });
}

export function emitEndGame(socket: Socket, roomCode: string) {
  socket.emit('end_game', { roomCode });
}

// ─── Listeners ───────────────────────────────────────────────────────────────

export function onWinnerDeclared(
  socket: Socket,
  cb: (data: { winnerIds: string[]; pot: number; players: Player[] }) => void
) {
  socket.on('winner_declared', cb);
  return () => socket.off('winner_declared', cb);
}

export function onGameEnded(socket: Socket, cb: (data: { players: Player[] }) => void) {
  socket.on('game_ended', cb);
  return () => socket.off('game_ended', cb);
}

export function onStartError(socket: Socket, cb: (data: { message: string }) => void) {
  socket.on('start_error', cb);
  return () => socket.off('start_error', cb);
}