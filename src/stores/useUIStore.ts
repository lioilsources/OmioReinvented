import { create } from 'zustand';

export type ActiveSheet = 'journeys';

interface UIState {
  activeSheet: ActiveSheet;
  mapInteracting: boolean;

  setActiveSheet: (sheet: ActiveSheet) => void;
  setMapInteracting: (interacting: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSheet: 'journeys',
  mapInteracting: false,

  setActiveSheet: (activeSheet) => set({ activeSheet }),
  setMapInteracting: (mapInteracting) => set({ mapInteracting }),
}));
