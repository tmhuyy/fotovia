import { create } from "zustand";

interface UiState {
  isMenuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMenuOpen: false,
  setMenuOpen: (value) => set({ isMenuOpen: value }),
}));
