// -----------------------------------------------------------------------------
// Title:       useUIStore.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Zustand store for panel visibility and transient UI state.
//              Includes journal panel view state (journalView, journalText,
//              journalPrompt). Holds nav active state and companion panel
//              routing (activeNav, activePanel) added in Phase 1.
//              No localStorage persistence - all ephemeral.
// -----------------------------------------------------------------------------

import { create } from 'zustand';
import { pickRandom } from '../utils';
import { JOURNAL_PROMPTS } from '../messages';

export const useUIStore = create((set) => ({
  showSettings: false,
  showJournal:  false,

  // Nav bar and companion panel state (Phase 1)
  activeNav:   'home',   // 'home' | 'focus' | 'tasks' | 'water' | 'more'
  activePanel: null,     // null | 'focus' | 'tasks' | 'water'
  navBarHeight: 80,      // measured via ResizeObserver in NavBar.jsx

  // Journal panel internal state
  journalView:   "write",
  journalText:   "",
  journalPrompt: pickRandom(JOURNAL_PROMPTS),

  setShowSettings: (v) => set({ showSettings: v }),
  setShowJournal:  (v) => set({ showJournal: v }),
  setActiveNav:    (v) => set({ activeNav: v }),
  setActivePanel:  (v) => set({ activePanel: v }),
  setNavBarHeight: (h) => set({ navBarHeight: h }),
  setJournalView:  (v) => set({ journalView: v }),
  setJournalText:  (v) => set({ journalText: v }),
  setJournalPrompt:(v) => set({ journalPrompt: v }),
}));
