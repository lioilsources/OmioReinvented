import { create } from 'zustand';
import type { DepartureTime, Destination, DistanceMode, TimeMode, PaxConfig, Child } from '@/shared/types';

export interface Origin {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

const PRAGUE: Origin = { id: '375859', lat: 50.08804, lng: 14.42076, name: 'Prague' };

export const ORIGINS: Origin[] = [
  PRAGUE,
  { id: '376217', lat: 52.52437, lng: 13.41053, name: 'Berlin' },
  { id: '380553', lat: 51.50853, lng: -0.12574, name: 'London' },
  { id: '388498', lat: 41.89474, lng: 12.4839, name: 'Rome' },
  { id: '378655', lat: 40.4165, lng: -3.70256, name: 'Madrid' },
  { id: '379727', lat: 48.85341, lng: 2.3488, name: 'Paris' },
];

interface SearchState {
  origin: Origin;
  distanceMode: DistanceMode;
  destination: Destination | null;
  timeMode: TimeMode | null;
  departureTime: DepartureTime;
  pax: PaxConfig;
  selectedPoiType: string | null;

  // Actions
  setOrigin: (origin: Origin) => void;
  setDistanceMode: (mode: DistanceMode) => void;
  setDestination: (destination: Destination | null) => void;
  setTimeMode: (mode: TimeMode | null) => void;
  setDepartureTime: (time: DepartureTime) => void;
  setSelectedPoiType: (type: string | null) => void;
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
  departureTime: 'morning',
  pax: { adults: 1, children: [] },
  selectedPoiType: null,

  setOrigin: (origin) => set({ origin }),
  setDistanceMode: (distanceMode) => set({ distanceMode, destination: null, timeMode: null, selectedPoiType: null }),
  setSelectedPoiType: (selectedPoiType) => set({ selectedPoiType }),
  setDestination: (destination) => set({ destination }),
  setTimeMode: (timeMode) => set({ timeMode }),
  setDepartureTime: (departureTime) => set({ departureTime }),

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
      departureTime: 'morning',
      pax: { adults: 1, children: [] },
      selectedPoiType: null,
    }),

  getPricePerPax: () => {
    const { destination } = get();
    if (!destination || destination.priceFrom === null) return 0;
    return destination.priceFrom;
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
