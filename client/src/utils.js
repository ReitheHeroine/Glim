// -----------------------------------------------------------------------------
// Title:       utils.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Shared utility functions used by stores and components.
//              Extracted from DesktopPet.jsx so stores can import them
//              without creating circular dependencies.
// -----------------------------------------------------------------------------

export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6)  return "lateNight";
  if (h < 9)  return "earlyMorning";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "lateNight";
}

export function getColors() {
  const h = new Date().getHours();
  if (h < 6)  return { hue: 310, sat: 65 };
  if (h < 9)  return { hue: 150, sat: 60 };
  if (h < 12) return { hue: 175, sat: 65 };
  if (h < 17) return { hue: 220, sat: 65 };
  if (h < 21) return { hue: 270, sat: 60 };
  return { hue: 310, sat: 65 };
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
