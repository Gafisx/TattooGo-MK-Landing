"use client";

import { create } from "zustand";

type ScrollProgressState = {
  progress: number;
  pointer: { x: number; y: number };
  isDrawing: boolean;
  drawProgress: number;
  setProgress: (progress: number) => void;
  setPointer: (x: number, y: number, isDrawing: boolean) => void;
};

export const useScrollStore = create<ScrollProgressState>((set) => ({
  progress: 0,
  pointer: { x: 0.75, y: 0.5 },
  isDrawing: false,
  drawProgress: 0,
  setProgress: (progress) =>
    set((state) =>
      state.progress === progress ? state : { progress },
    ),
  setPointer: (x, y, isDrawing) =>
    set((state) => {
      const distance = Math.hypot(x - state.pointer.x, y - state.pointer.y);
      const drawProgress =
        isDrawing && state.isDrawing
          ? Math.min(1, state.drawProgress + distance * 1.6)
          : state.drawProgress;

      if (
        state.pointer.x === x &&
        state.pointer.y === y &&
        state.isDrawing === isDrawing &&
        state.drawProgress === drawProgress
      ) {
        return state;
      }

      return {
        pointer: { x, y },
        isDrawing,
        drawProgress,
      };
    }),
}));
