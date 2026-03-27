// -----------------------------------------------------------------------------
// Title:       useUIStore.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Zustand store for panel visibility and transient UI state.
//              Includes journal panel view state (journalView, journalText,
//              journalPrompt). Will grow to hold nav mode (companion/focus)
//              and active panel when the nav shell is built in Phase 1.
//              No localStorage persistence - all ephemeral.
// -----------------------------------------------------------------------------

import { create } from 'zustand';
import { pickRandom } from '../utils';
import { JOURNAL_PROMPTS } from '../messages';

export const useUIStore = create((set) => ({
  showSettings: false,
  showJournal:  false,

  // Journal panel internal state
  journalView:   "write",
  journalText:   "",
  journalPrompt: pickRandom(JOURNAL_PROMPTS),

  setShowSettings: (v) => set({ showSettings: v }),
  setShowJournal:  (v) => set({ showJournal: v }),
  setJournalView:  (v) => set({ journalView: v }),
  setJournalText:  (v) => set({ journalText: v }),
  setJournalPrompt:(v) => set({ journalPrompt: v }),
}));
