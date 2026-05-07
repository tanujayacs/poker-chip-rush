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
  bettingComplete: boolean;  // true = dealer bisa advance phase
  lastRaiserIndex: number;   // -1 jika tidak ada raise; dipakai untuk BB option di preflop
}