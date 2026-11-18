"use client";

import { create } from "zustand";

type ScrollProgressState = {
  progress: number;
  setProgress: (progress: number) => void;
};

export const useScrollStore = create<ScrollProgressState>((set) => ({
  progress: 0,
  setProgress: (progress) =>
    set((state) => (state.progress === progress ? state : { progress })),
}));
