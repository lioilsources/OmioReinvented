import { create } from 'zustand';
import type { Destination, DistanceMode, TimeMode, PaxConfig, Child } from '@/shared/types';

interface Origin {
  lat: number;
  lng: number;
  name: string;
}

const PRAGUE: Origin = { lat: 50.0755, lng: 14.4378, name: 'Prague' };

interface SearchState {
  origin: Origin;
  distanceMode: DistanceMode;
  destination: Destination | null;
  timeMode: TimeMode | null;
  pax: PaxConfig;

  // Actions
  setOrigin: (origin: Origin) => void;
  setDistanceMode: (mode: DistanceMode) => void;
  setDestination: (destination: Destination | null) => void;
  setTimeMode: (mode: TimeMode | null) => void;
  setAdults: (count: number) => void;
  addChild: () => void;
  removeChild: (index: number) => void;
  setChildAge: (index: number, age: number) => void;
  reset: () => void;

  // Derived
  getPricePerPax: () => number;
  getTotalPrice: () => number;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  origin: PRAGUE,
  distanceMode: 'medium',
  destination: null,
  timeMode: null,
  pax: { adults: 1, children: [] },

  setOrigin: (origin) => set({ origin }),
  setDistanceMode: (distanceMode) => set({ distanceMode, destination: null, timeMode: null }),
  setDestination: (destination) => set({ destination }),
  setTimeMode: (timeMode) => set({ timeMode }),

  setAdults: (count) =>
    set((state) => ({
      pax: { ...state.pax, adults: Math.max(1, Math.min(9, count)) },
    })),

  addChild: () =>
    set((state) => ({
      pax: {
        ...state.pax,
        children: [...state.pax.children, { age: 6 }],
      },
    })),

  removeChild: (index) =>
    set((state) => ({
      pax: {
        ...state.pax,
        children: state.pax.children.filter((_, i) => i !== index),
      },
    })),

  setChildAge: (index, age) =>
    set((state) => {
      const children = [...state.pax.children];
      children[index] = { age };
      return { pax: { ...state.pax, children } };
    }),

  reset: () =>
    set({
      origin: PRAGUE,
      distanceMode: 'medium',
      destination: null,
      timeMode: null,
      pax: { adults: 1, children: [] },
    }),

  getPricePerPax: () => {
    const { destination, timeMode } = get();
    if (!destination) return 0;
    if (!timeMode) return destination.priceFrom;
    return destination.prices_by_when[timeMode] ?? destination.priceFrom;
  },

  getTotalPrice: () => {
    const pricePerPax = get().getPricePerPax();
    const { pax } = get();

    const adultTotal = pax.adults * pricePerPax;
    const childTotal = pax.children.reduce((sum, child) => {
      if (child.age < 6) return sum; // free
      if (child.age < 15) return sum + pricePerPax * 0.5; // half price
      return sum + pricePerPax; // full price
    }, 0);

    return Math.round((adultTotal + childTotal) * 100) / 100;
  },
}));
