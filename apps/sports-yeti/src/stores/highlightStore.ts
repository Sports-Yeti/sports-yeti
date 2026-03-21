import { create } from 'zustand';
import { api } from '../services/api';
import type { HighlightDetail, HighlightSummary } from '../types';

interface HighlightState {
  highlights: HighlightSummary[];
  currentHighlight: HighlightDetail | null;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;

  fetchHighlights: () => Promise<void>;
  fetchHighlight: (id: string) => Promise<void>;
  setUploadProgress: (progress: number) => void;
  setUploading: (uploading: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

export const useHighlightStore = create<HighlightState>((set) => ({
  highlights: [],
  currentHighlight: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,

  fetchHighlights: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getHighlights();
      set({ highlights: response.data, isLoading: false });
    } catch {
      set({ error: 'Failed to load highlights', isLoading: false });
    }
  },

  fetchHighlight: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const highlight = await api.getHighlight(id);
      set({ currentHighlight: highlight, isLoading: false });
    } catch {
      set({ error: 'Failed to load highlight', isLoading: false });
    }
  },

  setUploadProgress: (progress: number) => set({ uploadProgress: progress }),
  setUploading: (uploading: boolean) =>
    set({ isUploading: uploading, uploadProgress: uploading ? 0 : 0 }),
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      highlights: [],
      currentHighlight: null,
      isLoading: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
    }),
}));
