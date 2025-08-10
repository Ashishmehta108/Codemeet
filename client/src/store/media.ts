import { create } from 'zustand';

export const useMediaStore = create((set) => ({
  cameraOn: true,
  micOn: true,
  setCameraOn: (on: boolean) => set({ cameraOn: on }),
  setMicOn: (on: boolean) => set({ micOn: on }),
}));