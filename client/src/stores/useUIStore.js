// -----------------------------------------------------------------------------
// Title:       useUIStore.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-04-20
// Purpose:     Zustand store for panel visibility and transient UI state.
//              Includes journal panel view state (journalView, journalText,
//              journalPrompt). Holds nav active state and companion panel
//              routing (activeNav, activePanel) added in Phase 1.
//              Focus mode infrastructure (mode/focusFeature + open/close/switch
//              actions) added in Phase 4.
//              No localStorage persistence - all ephemeral.
// -----------------------------------------------------------------------------

import { create } from 'zustand';
import { pickRandom } from '../utils';
import { JOURNAL_PROMPTS } from '../messages';

// Crossfade duration between companion and focus mode layers (ms). Must match
// the opacity transition in DesktopPet.jsx.
const FOCUS_TRANSITION_MS = 300;

// Module-scoped ref for the transition timer so it can be cleared if a rapid
// open/close happens before the previous transition finishes.
let focusTransitionTimer = null;

export const useUIStore = create((set, get) => ({
  showSettings: false,
  showJournal:  false,

  // Nav bar and companion panel state (Phase 1)
  activeNav:    'home',   // 'home' | 'water' | 'steps' | 'nutrition' | 'tasks' | 'more'
  activePanel:  null,     // null | 'water' | 'steps' | 'nutrition' | 'tasks' | 'focus'
  navBarHeight: 80,       // measured via ResizeObserver in NavBar.jsx
  requestClose: false,    // signal from NavBar to CompanionPanel to animate closed
  showMoreMenu: false,    // controls the "more" feature grid overlay

  // ---- Focus mode (Phase 4) ----
  mode:                'companion', // 'companion' | 'transitioning' | 'focus'
  focusFeature:        null,        // e.g. 'settings', 'food library'
  transitionDirection: null,        // 'opening' | 'closing' (only set while transitioning)

  // Journal panel internal state
  journalView:   "write",
  journalText:   "",
  journalPrompt: pickRandom(JOURNAL_PROMPTS),

  setShowMoreMenu: (v) => set({ showMoreMenu: v }),
  setShowSettings: (v) => set({ showSettings: v }),
  setShowJournal:  (v) => set({ showJournal: v }),
  setActiveNav:    (v) => set({ activeNav: v }),
  setActivePanel:  (v) => set({ activePanel: v }),
  setNavBarHeight: (h) => set({ navBarHeight: h }),
  setRequestClose: (v) => set({ requestClose: v }),
  setJournalView:  (v) => set({ journalView: v }),
  setJournalText:  (v) => set({ journalText: v }),
  setJournalPrompt:(v) => set({ journalPrompt: v }),

  // ---- Focus mode actions ----
  // Start the companion -> focus crossfade. Ignored if a transition is already
  // in progress or we are not currently in companion mode (rapid-toggle guard).
  openFocusMode: (feature, onComplete) => {
    if (get().mode !== 'companion') return;
    if (focusTransitionTimer) clearTimeout(focusTransitionTimer);
    set({
      focusFeature:        feature,
      mode:                'transitioning',
      transitionDirection: 'opening',
    });
    focusTransitionTimer = setTimeout(() => {
      focusTransitionTimer = null;
      set({ mode: 'focus', transitionDirection: null });
      if (typeof onComplete === 'function') onComplete();
    }, FOCUS_TRANSITION_MS);
  },

  // Start the focus -> companion crossfade. Ignored if not currently in focus.
  closeFocusMode: (onComplete) => {
    if (get().mode !== 'focus') return;
    if (focusTransitionTimer) clearTimeout(focusTransitionTimer);
    set({
      mode:                'transitioning',
      transitionDirection: 'closing',
    });
    focusTransitionTimer = setTimeout(() => {
      focusTransitionTimer = null;
      set({ mode: 'companion', focusFeature: null, transitionDirection: null });
      if (typeof onComplete === 'function') onComplete();
    }, FOCUS_TRANSITION_MS);
  },

  // Swap the active focus feature without a mode transition. Content-level
  // crossfade is handled by FocusShell (key change remounts content).
  switchFocusFeature: (feature) => {
    if (get().mode !== 'focus') return;
    set({ focusFeature: feature });
  },
}));
