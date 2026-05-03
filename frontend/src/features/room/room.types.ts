export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface Player {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  folded: boolean;
  allIn: boolean;
  isDealer: boolean;
}

export interface Room {
  code: string;
  dealerId: string;
  dealerIsPlayer: boolean;
  players: Player[];
  waiting: Player[];
  smallBlind: number;
  bigBlind: number;
  phase: GamePhase;
  pot: number;
  currentBet: number;
  activePlayerIndex: number;
  handNumber: number;
  sbIndex: number;
}

export interface CreateRoomPayload {
  name: string;
  isPlayer: boolean;
  chips?: number;
  smallBlind?: number;
  bigBlind?: number;
}

export interface JoinRoomPayload {
  roomCode: string;
  name: string;
  chips: number;
}