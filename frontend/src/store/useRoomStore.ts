import { create } from 'zustand';
import { Room, Player } from '../features/room/room.types';

interface RoomStore {
  room: Room | null;
  myId: string | null;
  myName: string | null;
  isDealer: boolean;
  setRoom: (room: Room) => void;
  setMyId: (id: string) => void;
  setMyName: (name: string) => void;
  setIsDealer: (v: boolean) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  myId: null,
  myName: null,
  isDealer: false,
  setRoom: (room) => set({ room }),
  setMyId: (myId) => set({ myId }),
  setMyName: (myName) => set({ myName }),
  setIsDealer: (isDealer) => set({ isDealer }),
  clearRoom: () => set({ room: null, myId: null, myName: null, isDealer: false }),
}));