export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'allin';

export interface ActionPayload {
  roomCode: string;
  action: PlayerAction;
  amount?: number;
}

export interface WinnerPayload {
  winnerIds: string[];
  pot: number;
  players: import('../room/room.types').Player[];
}