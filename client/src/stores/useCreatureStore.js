// -----------------------------------------------------------------------------
// Title:       useCreatureStore.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Zustand store for all creature visual and motion state.
//              Covers mood/colors, animations, drag/wander, eye tracking,
//              and bug chasing. No localStorage persistence - all ephemeral.
// -----------------------------------------------------------------------------

import { create } from 'zustand';
import { getTimeOfDay, getColors } from '../utils';

export const useCreatureStore = create((set) => {
  const { hue, sat } = getColors();
  return {
    // --- Time of day ---
    mood: getTimeOfDay(),
    hue,
    sat,

    // --- Personality / animation ---
    isHappy: false,
    squeezed: false,
    isPuffed: false,
    isPurring: false,
    specialAnim: null,
    antennaPerk: false,
    wingTwitchSide: null,
    isBlinking: false,
    isShaken: false,
    clickCount: 0,
    pupilOffset: { x: 0, y: 0 },
    chasedBugId: null,

    // --- Drag / motion ---
    dragPos: { x: 0, y: 0 },
    isDragging: false,
    isReturning: false,
    isWandering: false,

    // --- Actions ---
    setMood: (mood) => set({ mood }),
    setColors: ({ hue, sat }) => set({ hue, sat }),
    updateTime: () => {
      const { hue, sat } = getColors();
      set({ mood: getTimeOfDay(), hue, sat });
    },
    setIsHappy: (v) => set({ isHappy: v }),
    setSqueezed: (v) => set({ squeezed: v }),
    setIsPuffed: (v) => set({ isPuffed: v }),
    setIsPurring: (v) => set({ isPurring: v }),
    setSpecialAnim: (v) => set({ specialAnim: v }),
    setAntennaPerk: (v) => set({ antennaPerk: v }),
    setWingTwitchSide: (v) => set({ wingTwitchSide: v }),
    setIsBlinking: (v) => set({ isBlinking: v }),
    setIsShaken: (v) => set({ isShaken: v }),
    setClickCount: (v) => set({ clickCount: v }),
    setPupilOffset: (v) => set({ pupilOffset: v }),
    setChasedBugId: (v) => set({ chasedBugId: v }),
    setDragPos: (v) => set({ dragPos: v }),
    setIsDragging: (v) => set({ isDragging: v }),
    setIsReturning: (v) => set({ isReturning: v }),
    setIsWandering: (v) => set({ isWandering: v }),
  };
});
