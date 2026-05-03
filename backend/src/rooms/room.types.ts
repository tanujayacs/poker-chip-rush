export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface Player {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  folded: boolean;
  allIn: boolean;
  isDealer: boolean; // true jika dia adalah room master
}

export interface Room {
  code: string;
  dealerId: string;        // socket id dealer
  dealerIsPlayer: boolean; // apakah dealer ikut main
  players: Player[];       // sudah approved
  waiting: Player[];       // menunggu approval
  smallBlind: number;
  bigBlind: number;
  phase: GamePhase;
  pot: number;
  currentBet: number;
  activePlayerIndex: number; // index di players[] yang sedang giliran
  handNumber: number;
  sbIndex: number;          // index small blind di players[]
}