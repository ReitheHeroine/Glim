// -----------------------------------------------------------------------------
// Title:       useWaterStore.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Zustand store for water tracking. Persists to localStorage under
//              key 'glim-water'. Tracks bottle log entries, bottle size, and
//              daily goal. Exposes computed selectors for today's count, streak
//              (consecutive days at or above goal), and 7-day rolling average.
// Inputs:      None (reads localStorage on import)
// Outputs:     Zustand store hook exported as useWaterStore
// -----------------------------------------------------------------------------

import { create } from 'zustand';

const STORAGE_KEY = 'glim-water';

// --- Persistence helpers ---

function loadWater() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { entries: [], bottleOz: 24, goal: 6, configUpdatedAt: new Date().toISOString() };
}

function saveWater(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      entries:          state.entries,
      bottleOz:         state.bottleOz,
      goal:             state.goal,
      configUpdatedAt:  state.configUpdatedAt,
    }));
  } catch { /* ignore */ }
}

// --- Date helpers ---

function todayStr() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function dateStr(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

// --- Computed helpers ---

function countToday(entries) {
  const today = todayStr();
  return entries.filter(e => dateStr(e.timestamp) === today).length;
}

// Consecutive days at or above goal, counting backward from today
function computeStreak(entries, goal) {
  if (entries.length === 0) return 0;

  const byDate = {};
  for (const e of entries) {
    const d = dateStr(e.timestamp);
    byDate[d] = (byDate[d] || 0) + 1;
  }

  let streak = 0;
  const base = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    if ((byDate[dStr] || 0) >= goal) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Average bottles per day over the last 7 days (including today)
function computeWeeklyAvg(entries) {
  const byDate = {};
  for (const e of entries) {
    const d = dateStr(e.timestamp);
    byDate[d] = (byDate[d] || 0) + 1;
  }
  const base = new Date();
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    total += byDate[dStr] || 0;
  }
  return Math.round((total / 7) * 10) / 10;
}

// --- Store ---

const initial = loadWater();

export const useWaterStore = create((set, get) => ({
  entries:         initial.entries,
  bottleOz:        initial.bottleOz,
  goal:            initial.goal,
  configUpdatedAt: initial.configUpdatedAt ?? new Date().toISOString(),

  logBottle: () => {
    const entry = {
      id:        Date.now(),
      timestamp: Date.now(),
      bottleOz:  get().bottleOz,
    };
    set(state => {
      const next = { ...state, entries: [...state.entries, entry] };
      saveWater(next);
      return next;
    });
  },

  undoLast: () => {
    set(state => {
      const today = todayStr();
      const todayEntries = state.entries.filter(e => dateStr(e.timestamp) === today);
      if (todayEntries.length === 0) return state;
      const lastId = todayEntries[todayEntries.length - 1].id;
      const next = { ...state, entries: state.entries.filter(e => e.id !== lastId) };
      saveWater(next);
      return next;
    });
  },

  setBottleOz: (oz) => {
    set(state => {
      const next = { ...state, bottleOz: oz, configUpdatedAt: new Date().toISOString() };
      saveWater(next);
      return next;
    });
  },

  setGoal: (n) => {
    set(state => {
      const next = { ...state, goal: n, configUpdatedAt: new Date().toISOString() };
      saveWater(next);
      return next;
    });
  },

  // Called by sync service after a pull that updates localStorage
  reload: () => {
    const data = loadWater();
    set({
      entries:         data.entries,
      bottleOz:        data.bottleOz,
      goal:            data.goal,
      configUpdatedAt: data.configUpdatedAt ?? new Date().toISOString(),
    });
  },

  // Computed selectors - read current state via get()
  getToday:     () => countToday(get().entries),
  getStreak:    () => computeStreak(get().entries, get().goal),
  getWeeklyAvg: () => computeWeeklyAvg(get().entries),
}));
