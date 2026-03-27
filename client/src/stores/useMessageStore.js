// -----------------------------------------------------------------------------
// Title:       useMessageStore.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Zustand store for speech bubble content and persistent
//              reminder banners. No localStorage persistence - ephemeral.
// -----------------------------------------------------------------------------

import { create } from 'zustand';

export const useMessageStore = create((set) => ({
  message: "",
  showBubble: false,
  isWellness: false,
  currentMsgType: null,
  moveReminder: null,
  eyesReminder: null,

  setMessage: (v) => set({ message: v }),
  setShowBubble: (v) => set({ showBubble: v }),
  setIsWellness: (v) => set({ isWellness: v }),
  setCurrentMsgType: (v) => set({ currentMsgType: v }),
  setMoveReminder: (v) => set({ moveReminder: v }),
  setEyesReminder: (v) => set({ eyesReminder: v }),
}));
