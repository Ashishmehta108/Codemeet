import { create } from 'zustand';

export const useRoomStore = create((set) => ({
  roomId: null,
  setRoomId: (roomId: string) => set({ roomId }),
}));