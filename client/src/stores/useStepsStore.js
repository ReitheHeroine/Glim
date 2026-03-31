// -----------------------------------------------------------------------------
// Title:       useStepsStore.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-30
// Last Modified: 2026-03-30
// Purpose:     Zustand store for step tracking. Persists to localStorage under
//              key 'glim-steps'. Replace-style: latest entry per date wins when
//              deriving today's count. Tracks all raw entries for cross-device
//              sync (additive merge at storage layer, replace-style at derived
//              value layer). Exposes streak (consecutive days >= tier 1) and
//              7-day rolling average.
// Inputs:      None (reads localStorage on import)
// Outputs:     Zustand store hook exported as useStepsStore
// -----------------------------------------------------------------------------

import { create } from 'zustand';
import { todayStr, dateStr, toLogicalDateStr } from '../utils/dateUtils';

// Re-export so existing consumers (StepsPanel) don't break
export { dateStr };

const STORAGE_KEY = 'glim-steps';

// Default tiers - hardcoded; custom tiers deferred to future config
export const TIERS = [2500, 5000, 7500, 10000];

// --- Persistence helpers ---

function loadSteps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { entries: [] };
}

function saveSteps(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: state.entries }));
  } catch { /* ignore */ }
}

// --- Computed helpers ---

// Replace-style: latest entry per date wins for the step count
export function countForDate(entries, dateString) {
  const dayEntries = entries.filter(e => dateStr(e.timestamp) === dateString);
  if (dayEntries.length === 0) return 0;
  return dayEntries.reduce((latest, e) => (e.timestamp > latest.timestamp ? e : latest)).count;
}

// Streak: consecutive days reaching tier 1 (2,500 steps), counting back from today
function computeStreak(entries) {
  if (entries.length === 0) return 0;
  const base = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dStr = toLogicalDateStr(d);
    if (countForDate(entries, dStr) >= TIERS[0]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// 7-day rolling average of daily step counts (using replace-style counts per day)
function computeWeeklyAvg(entries) {
  const base = new Date();
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    total += countForDate(entries, toLogicalDateStr(d));
  }
  return Math.round((total / 7) * 10) / 10;
}

// --- Store ---

const initial = loadSteps();

export const useStepsStore = create((set, get) => ({
  entries: initial.entries ?? [],

  // Creates a new log entry. Replace-style resolution happens at the derived
  // value layer (countForDate picks the latest entry per date), not here.
  logSteps: (count) => {
    const entry = { id: Date.now(), timestamp: Date.now(), count };
    set(state => {
      const next = { ...state, entries: [...state.entries, entry] };
      saveSteps(next);
      return next;
    });
  },

  // Called by sync service after a pull that updates localStorage
  reload: () => {
    const data = loadSteps();
    set({ entries: data.entries ?? [] });
  },

  // Computed selectors - read current state via get()
  getTodayCount: () => countForDate(get().entries, todayStr()),
  getStreak:     () => computeStreak(get().entries),
  getWeeklyAvg:  () => computeWeeklyAvg(get().entries),
}));
