// -----------------------------------------------------------------------------
// Title:       dateUtils.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-31
// Last Modified: 2026-03-31
// Purpose:     Shared date utility functions for the water and steps stores.
//              Centralizes the "what day is it" logic so all stores agree on
//              day boundaries. DAY_BOUNDARY_HOUR controls when the logical day
//              rolls over (0 = midnight, 3 = 3 AM, etc.).
// Inputs:      Date objects or timestamps (ms since epoch)
// Outputs:     YYYY-MM-DD date strings
// -----------------------------------------------------------------------------

/**
 * Returns the logical day boundary offset in hours.
 * The "day" doesn't roll over at midnight - it rolls over at DAY_BOUNDARY_HOUR.
 * When set to 3, 1 AM on March 31 counts as March 30.
 * Set to 0 for standard midnight boundary.
 */
const DAY_BOUNDARY_HOUR = 0;

/**
 * Converts a Date object to a logical-day date string (YYYY-MM-DD).
 * Subtracts DAY_BOUNDARY_HOUR hours before extracting the date.
 */
export function toLogicalDateStr(date) {
  const shifted = new Date(date.getTime());
  shifted.setHours(shifted.getHours() - DAY_BOUNDARY_HOUR);
  return shifted.toISOString().slice(0, 10);
}

/**
 * Returns today's logical date string.
 */
export function todayStr() {
  return toLogicalDateStr(new Date());
}

/**
 * Converts a timestamp (ms since epoch) to a logical-day date string.
 */
export function dateStr(timestamp) {
  return toLogicalDateStr(new Date(timestamp));
}
