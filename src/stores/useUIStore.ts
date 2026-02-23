import { create } from 'zustand';

export type ActiveSheet = 'destinations' | 'time' | 'pax';

interface UIState {
  activeSheet: ActiveSheet;
  mapInteracting: boolean;

  setActiveSheet: (sheet: ActiveSheet) => void;
  setMapInteracting: (interacting: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeSheet: 'destinations',
  mapInteracting: false,

  setActiveSheet: (activeSheet) => set({ activeSheet }),
  setMapInteracting: (mapInteracting) => set({ mapInteracting }),
}));
