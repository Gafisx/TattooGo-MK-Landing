import { create } from "zustand";

type ScrollProgressState = {
  progress: number;
  setProgress: (progress: number) => void;
  artistsCarouselProgress: number;
  setArtistsCarouselProgress: (progress: number) => void;
  artistsCarouselVisible: boolean;
  setArtistsCarouselVisible: (visible: boolean) => void;
  
  // NOVAS PROPRIEDADES PARA O EFEITO DE IMERSÃO
  immersiveProgress: number;
  setImmersiveProgress: (progress: number) => void;
  immersiveVisible: boolean;
  setImmersiveVisible: (visible: boolean) => void;
};

export const useScrollStore = create<ScrollProgressState>((set) => ({
  progress: 0,
  setProgress: (progress) => set((state) => (state.progress === progress ? state : { progress })),
  
  artistsCarouselProgress: 0,
  setArtistsCarouselProgress: (artistsCarouselProgress) =>
    set((state) => (state.artistsCarouselProgress === artistsCarouselProgress ? state : { artistsCarouselProgress })),
  
  artistsCarouselVisible: false,
  setArtistsCarouselVisible: (visible) =>
    set((state) => (state.artistsCarouselVisible === visible ? state : { artistsCarouselVisible: visible })),

  // INICIALIZAÇÃO DO NOVO ESTADO
  immersiveProgress: 0,
  setImmersiveProgress: (immersiveProgress) =>
    set((state) => (state.immersiveProgress === immersiveProgress ? state : { immersiveProgress })),
  
  immersiveVisible: false,
  setImmersiveVisible: (immersiveVisible) =>
    set((state) => (state.immersiveVisible === immersiveVisible ? state : { immersiveVisible })),
}));