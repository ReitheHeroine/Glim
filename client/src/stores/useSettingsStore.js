// -----------------------------------------------------------------------------
// Title:       useSettingsStore.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Zustand store for user-configurable reminder intervals.
//              Initializes synchronously from localStorage on import.
//              Writes back to localStorage (with lastModified) on every
//              setter call, preserving the format expected by sync.js.
// Inputs:      localStorage key: 'glim-settings'
// Outputs:     localStorage key: 'glim-settings' (JSON with lastModified)
// -----------------------------------------------------------------------------

import { create } from 'zustand';

// --- Load initial values from localStorage ---
function loadSettings() {
  try {
    const raw = localStorage.getItem('glim-settings');
    if (raw) {
      const s = JSON.parse(raw);
      return {
        wellnessInterval: s.wellnessInterval ?? 20,
        moveInterval:     s.moveInterval     ?? 45,
        eyesInterval:     s.eyesInterval     ?? 20,
      };
    }
  } catch { /* ignore */ }
  return { wellnessInterval: 20, moveInterval: 45, eyesInterval: 20 };
}

// --- Write current state back to localStorage ---
function saveSettings(state) {
  try {
    localStorage.setItem('glim-settings', JSON.stringify({
      wellnessInterval: state.wellnessInterval,
      moveInterval:     state.moveInterval,
      eyesInterval:     state.eyesInterval,
      lastModified:     new Date().toISOString(),
    }));
  } catch { /* ignore */ }
}

export const useSettingsStore = create((set, get) => ({
  ...loadSettings(),

  setWellnessInterval: (v) => { set({ wellnessInterval: v }); saveSettings({ ...get(), wellnessInterval: v }); },
  setMoveInterval:     (v) => { set({ moveInterval: v });     saveSettings({ ...get(), moveInterval: v });     },
  setEyesInterval:     (v) => { set({ eyesInterval: v });     saveSettings({ ...get(), eyesInterval: v });     },

  // Called by sync service event handler when remote settings arrive
  reload: () => { set(loadSettings()); },
}));
