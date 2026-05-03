import { create } from 'zustand';

interface GameStore {
  winnerDeclared: { winnerIds: string[]; pot: number } | null;
  gameEnded: boolean;
  setWinnerDeclared: (v: { winnerIds: string[]; pot: number } | null) => void;
  setGameEnded: (v: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  winnerDeclared: null,
  gameEnded: false,
  setWinnerDeclared: (winnerDeclared) => set({ winnerDeclared }),
  setGameEnded: (gameEnded) => set({ gameEnded }),
}));