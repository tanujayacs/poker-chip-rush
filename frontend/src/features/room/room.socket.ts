import { Socket } from 'socket.io-client';
import { Room, Player } from './room.types';

// ─── Emitters ────────────────────────────────────────────────────────────────

export function emitCreateRoom(socket: Socket, payload: {
  name: string;
  isPlayer: boolean;
  chips?: number;
  smallBlind?: number;
  bigBlind?: number;
}) {
  socket.emit('create_room', payload);
}

export function emitRequestJoin(socket: Socket, payload: {
  roomCode: string;
  name: string;
  chips: number;
}) {
  socket.emit('request_join', payload);
}

export function emitApprovePlayer(socket: Socket, roomCode: string, playerId: string) {
  socket.emit('approve_player', { roomCode, playerId });
}

export function emitKickPlayer(socket: Socket, roomCode: string, playerId: string) {
  socket.emit('kick_player', { roomCode, playerId });
}

export function emitUpdateBlinds(socket: Socket, roomCode: string, smallBlind: number, bigBlind: number) {
  socket.emit('update_blinds', { roomCode, smallBlind, bigBlind });
}

export function emitStartGame(socket: Socket, roomCode: string) {
  socket.emit('start_game', { roomCode });
}

export function emitReconnect(socket: Socket, roomCode: string, name: string) {
  socket.emit('reconnect_room', { roomCode, name });
}

// ─── Listeners ───────────────────────────────────────────────────────────────

export function onRoomState(socket: Socket, cb: (room: Room) => void) {
  socket.on('room_state', cb);
  return () => socket.off('room_state', cb);
}

export function onRoomCreated(socket: Socket, cb: (data: { roomCode: string }) => void) {
  socket.on('room_created', cb);
  return () => socket.off('room_created', cb);
}

export function onPlayerWaiting(socket: Socket, cb: (player: Player) => void) {
  socket.on('player_waiting', cb);
  return () => socket.off('player_waiting', cb);
}

export function onApproved(socket: Socket, cb: () => void) {
  socket.on('approved', cb);
  return () => socket.off('approved', cb);
}

export function onKicked(socket: Socket, cb: () => void) {
  socket.on('kicked', cb);
  return () => socket.off('kicked', cb);
}

export function onJoinError(socket: Socket, cb: (data: { message: string }) => void) {
  socket.on('join_error', cb);
  return () => socket.off('join_error', cb);
}

export function onWaitingApproval(socket: Socket, cb: () => void) {
  socket.on('waiting_approval', cb);
  return () => socket.off('waiting_approval', cb);
}

export function onReconnected(socket: Socket, cb: (data: { room: Room; playerId: string; isDealer?: boolean }) => void) {
  socket.on('reconnected', cb);
  return () => socket.off('reconnected', cb);
}

export function onReconnectFailed(socket: Socket, cb: () => void) {
  socket.on('reconnect_failed', cb);
  return () => socket.off('reconnect_failed', cb);
}

export function onPlayerDisconnected(socket: Socket, cb: (data: { name: string }) => void) {
  socket.on('player_disconnected', cb);
  return () => socket.off('player_disconnected', cb);
}