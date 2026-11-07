import { create } from 'zustand';

export interface UIState {
  isCreatePostModalOpen: boolean;
  createPostInitialMode: 'CASUAL' | 'RECIPE';
  openCreatePostModal: (mode?: 'CASUAL' | 'RECIPE') => void;
  closeCreatePostModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreatePostModalOpen: false,
  createPostInitialMode: 'CASUAL',
  openCreatePostModal: (mode = 'CASUAL') =>
    set({ isCreatePostModalOpen: true, createPostInitialMode: mode }),
  closeCreatePostModal: () => set({ isCreatePostModalOpen: false }),
}));

export default useUIStore;

