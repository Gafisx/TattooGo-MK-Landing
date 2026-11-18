"use client";

import { createContext, useContext } from "react";

export type ProceduralAudioContextValue = {
  muted: boolean;
  toggleMuted: () => Promise<void>;
  playHoverClick: () => void;
};

export const ProceduralAudioContext =
  createContext<ProceduralAudioContextValue | null>(null);

export function useProceduralAudio() {
  const audio = useContext(ProceduralAudioContext);
  if (!audio) {
    throw new Error(
      "useProceduralAudio must be used within a ProceduralAudioProvider",
    );
  }
  return audio;
}
