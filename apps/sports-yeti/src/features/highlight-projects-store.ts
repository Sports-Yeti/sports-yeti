import { useMemo } from 'react';
import { create } from 'zustand';
import {
  HIGHLIGHT_PROJECTS,
  type HighlightProject,
} from '../mocks/highlights';

/**
 * Session-created AI highlight projects layered over the seeded
 * `HIGHLIGHT_PROJECTS`. Finishing the generation wizard adds a
 * `processing` project here so it shows up in the Studio immediately —
 * the wizard journey lands somewhere real instead of ending on a toast.
 * Resets on app restart (mock data only).
 */
interface HighlightProjectsState {
  createdProjects: HighlightProject[];
  addProject: (project: HighlightProject) => void;
}

export const useHighlightProjectsStore = create<HighlightProjectsState>(
  (set) => ({
    createdProjects: [],
    addProject: (project) =>
      set((state) => ({
        createdProjects: [project, ...state.createdProjects],
      })),
  }),
);

/** Session projects first (newest work at the top), then the seeds. */
export function useHighlightProjects(): HighlightProject[] {
  const createdProjects = useHighlightProjectsStore((s) => s.createdProjects);
  return useMemo(
    () => [...createdProjects, ...HIGHLIGHT_PROJECTS],
    [createdProjects],
  );
}
