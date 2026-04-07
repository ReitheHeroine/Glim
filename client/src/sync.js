// -----------------------------------------------------------------------------
// Title:       sync.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-26
// Last Modified: 2026-04-07
// Purpose:     Background sync service. Pushes localStorage data to Firestore
//              and pulls remote changes back into localStorage so data stays
//              in sync across devices. localStorage remains the primary
//              read/write layer - the app never waits on Firebase.
//
//              Sync triggers: startup (immediate pull), every 60 seconds
//              (push + pull), and on tab focus (visibilitychange pull).
//
//              After a pull that changes localStorage, fires a
//              'glim-data-updated' CustomEvent so DesktopPet can reload.
//
// Inputs:      Firebase db and auth from firebase.js
// Outputs:     CustomEvent('glim-data-updated', { detail: { domains: [...] } })
// Usage:       import { startSync, stopSync } from './sync'
//              startSync(uid)   // call after auth
//              stopSync()       // call on sign-out
// -----------------------------------------------------------------------------

import { db } from './firebase';
import {
  collection, doc, getDocs, setDoc, getDoc,
} from 'firebase/firestore';

// --- Internal state ---

let syncInterval = null;
let visibilityHandler = null;
let currentUid = null;

// --- localStorage helpers ---

function localGet(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

function localSetRaw(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('[glim sync] localStorage write failed:', e);
  }
}

function localSet(key, data) {
  localSetRaw(key, JSON.stringify(data));
}

// --- Sync metadata (tracks last push time per domain) ---

function getSyncMeta() {
  return localGet('glim-sync-meta') ?? {};
}

function setSyncMeta(updates) {
  localSet('glim-sync-meta', { ...getSyncMeta(), ...updates });
}

// --- Notify React components that localStorage has changed ---

function notify(domains) {
  window.dispatchEvent(new CustomEvent('glim-data-updated', { detail: { domains } }));
}

// =============================================================================
//  Journal sync
//  Strategy: event-log merge. One Firestore doc per entry.
//  Firestore path: users/{uid}/journal/{entryId}
//  Push: entries created/soft-deleted after lastPushedAt
//  Pull: entries in Firestore not present in localStorage
// =============================================================================

async function syncJournal(uid) {
  const meta = getSyncMeta();
  const lastPushedAt = meta.journalPushedAt ? new Date(meta.journalPushedAt) : new Date(0);

  const rawEntries = localGet('glim-journal');
  const entries = Array.isArray(rawEntries) ? rawEntries : [];

  const journalRef = collection(db, 'users', uid, 'journal');

  // --- PUSH: entries that are new or newly soft-deleted since last push ---
  const toPush = entries.filter(e => {
    const created = new Date(e.createdAt || e.date || 0);
    const deleted = e.deletedAt ? new Date(e.deletedAt) : null;
    return created > lastPushedAt || (deleted && deleted > lastPushedAt);
  });

  for (const entry of toPush) {
    try {
      await setDoc(doc(journalRef, String(entry.id)), entry, { merge: true });
    } catch (e) {
      console.warn('[glim sync] journal push failed for entry:', entry.id, e);
    }
  }

  // --- PULL: Firestore entries not in localStorage ---
  let snapshot;
  try {
    snapshot = await getDocs(journalRef);
  } catch (e) {
    console.warn('[glim sync] journal pull failed:', e);
    return;
  }

  const localIdSet = new Set(entries.map(e => String(e.id)));
  const toAdd = [];

  snapshot.forEach(d => {
    if (!localIdSet.has(d.id)) {
      toAdd.push(d.data());
    }
  });

  if (toAdd.length > 0) {
    const merged = [...entries, ...toAdd].sort(
      (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
    );
    localSet('glim-journal', merged);
    notify(['journal']);
  }

  // Always advance pushedAt, even when there was nothing to push locally.
  // A device that only pulled remote entries would otherwise keep lastPushedAt
  // at epoch and re-push all pulled entries on the next cycle.
  setSyncMeta({ journalPushedAt: new Date().toISOString() });
}

// =============================================================================
//  Pokes sync
//  Strategy: take the max of local and remote (pokes only ever increase).
//  Firestore path: users/{uid}/pokes/counters
// =============================================================================

async function syncPokes(uid) {
  const localRaw = localStorage.getItem('glim-pokes');
  const localTotal = localRaw ? (parseInt(localRaw, 10) || 0) : 0;

  const pokesRef = doc(db, 'users', uid, 'pokes', 'counters');

  try {
    const snap = await getDoc(pokesRef);
    const remoteTotal = snap.exists() ? (snap.data().total ?? 0) : 0;

    if (localTotal >= remoteTotal) {
      // Local has more pokes (or same): push to Firestore
      await setDoc(pokesRef, {
        total: localTotal,
        lastModified: new Date().toISOString(),
      }, { merge: true });
    } else {
      // Remote has more pokes: update local
      localSetRaw('glim-pokes', String(remoteTotal));
      notify(['pokes']);
    }
  } catch (e) {
    console.warn('[glim sync] pokes sync failed:', e);
  }
}

// =============================================================================
//  Settings sync
//  Strategy: last-write-wins by lastModified timestamp.
//  Firestore path: users/{uid}/settings/current
// =============================================================================

async function syncSettings(uid) {
  let localSettings = null;
  try {
    const val = localStorage.getItem('glim-settings');
    localSettings = val ? JSON.parse(val) : null;
  } catch { /* ignore */ }

  const settingsRef = doc(db, 'users', uid, 'settings', 'current');

  try {
    const snap = await getDoc(settingsRef);
    const remoteSettings = snap.exists() ? snap.data() : null;

    const localTime = localSettings?.lastModified ? new Date(localSettings.lastModified) : new Date(0);
    const remoteTime = remoteSettings?.lastModified ? new Date(remoteSettings.lastModified) : new Date(0);

    if (!remoteSettings || localTime >= remoteTime) {
      // Local is newer (or no remote yet): push to Firestore
      if (localSettings) {
        await setDoc(settingsRef, localSettings, { merge: true });
      }
    } else {
      // Remote is newer: update local
      localSet('glim-settings', remoteSettings);
      notify(['settings']);
    }
  } catch (e) {
    console.warn('[glim sync] settings sync failed:', e);
  }
}

// =============================================================================
//  Water sync
//  Entries strategy: additive merge. One Firestore doc per entry.
//  Firestore path: users/{uid}/water/{entryId}
//  Push: entries created after waterPushedAt
//  Pull: entries in Firestore not present in localStorage
//
//  Config strategy: last-write-wins by configUpdatedAt.
//  Firestore path: users/{uid}/water-config/current
// =============================================================================

async function syncWater(uid) {
  const meta         = getSyncMeta();
  const lastPushedAt = meta.waterPushedAt ? new Date(meta.waterPushedAt) : new Date(0);

  let local;
  try {
    const raw = localStorage.getItem('glim-water');
    local = raw ? JSON.parse(raw) : { entries: [], bottleOz: 24, goal: 6, configUpdatedAt: new Date(0).toISOString() };
  } catch {
    return;
  }

  const entries    = Array.isArray(local.entries) ? local.entries : [];
  const entriesRef = collection(db, 'users', uid, 'water');

  // --- PUSH: entries created since last push ---
  const toPush = entries.filter(e => new Date(e.timestamp) > lastPushedAt);

  for (const entry of toPush) {
    try {
      await setDoc(doc(entriesRef, String(entry.id)), entry, { merge: true });
    } catch (e) {
      console.warn('[glim sync] water entry push failed:', entry.id, e);
    }
  }

  // --- PULL: Firestore entries not in local ---
  let snapshot;
  try {
    snapshot = await getDocs(entriesRef);
  } catch (e) {
    console.warn('[glim sync] water pull failed:', e);
    return;
  }

  const localIdSet = new Set(entries.map(e => String(e.id)));
  const toAdd = [];
  snapshot.forEach(d => {
    if (!localIdSet.has(d.id)) toAdd.push(d.data());
  });

  let changed = false;
  if (toAdd.length > 0) {
    const merged = [...entries, ...toAdd].sort((a, b) => a.timestamp - b.timestamp);
    local = { ...local, entries: merged };
    changed = true;
  }

  // --- CONFIG: last-write-wins by configUpdatedAt ---
  const configRef    = doc(db, 'users', uid, 'water-config', 'current');
  const localConfig  = { bottleOz: local.bottleOz, goal: local.goal, configUpdatedAt: local.configUpdatedAt ?? new Date(0).toISOString() };

  try {
    const configSnap   = await getDoc(configRef);
    const remoteConfig = configSnap.exists() ? configSnap.data() : null;
    const localTime    = localConfig.configUpdatedAt ? new Date(localConfig.configUpdatedAt) : new Date(0);
    const remoteTime   = remoteConfig?.configUpdatedAt ? new Date(remoteConfig.configUpdatedAt) : new Date(0);

    if (!remoteConfig || localTime >= remoteTime) {
      await setDoc(configRef, localConfig, { merge: true });
    } else {
      local   = { ...local, bottleOz: remoteConfig.bottleOz, goal: remoteConfig.goal, configUpdatedAt: remoteConfig.configUpdatedAt };
      changed = true;
    }
  } catch (e) {
    console.warn('[glim sync] water config sync failed:', e);
  }

  if (changed) {
    localSet('glim-water', local);
    notify(['water']);
  }

  // Always advance pushedAt, even when there was nothing to push locally.
  // A device that only pulled remote entries would otherwise keep lastPushedAt
  // at epoch and re-push all pulled entries on the next cycle.
  setSyncMeta({ waterPushedAt: new Date().toISOString() });
}

// =============================================================================
//  Steps sync
//  Entries strategy: additive merge. One Firestore doc per entry.
//  Firestore path: users/{uid}/steps/{entryId}
//  Push: entries created after stepsPushedAt
//  Pull: entries in Firestore not present in localStorage
//
//  Replace-style resolution (latest entry per date wins) happens in the store's
//  derived value layer (countForDate), not here. The sync layer is purely
//  additive - it only adds missing entries, never removes or overwrites.
// =============================================================================

async function syncSteps(uid) {
  const meta         = getSyncMeta();
  const lastPushedAt = meta.stepsPushedAt ? new Date(meta.stepsPushedAt) : new Date(0);

  let local;
  try {
    const raw = localStorage.getItem('glim-steps');
    local = raw ? JSON.parse(raw) : { entries: [] };
  } catch {
    return;
  }

  const entries    = Array.isArray(local.entries) ? local.entries : [];
  const entriesRef = collection(db, 'users', uid, 'steps');

  // --- PUSH: entries created since last push ---
  const toPush = entries.filter(e => new Date(e.timestamp) > lastPushedAt);

  for (const entry of toPush) {
    try {
      await setDoc(doc(entriesRef, String(entry.id)), entry, { merge: true });
    } catch (e) {
      console.warn('[glim sync] steps entry push failed:', entry.id, e);
    }
  }

  if (toPush.length > 0) {
    setSyncMeta({ stepsPushedAt: new Date().toISOString() });
  }

  // --- PULL: Firestore entries not in local ---
  let snapshot;
  try {
    snapshot = await getDocs(entriesRef);
  } catch (e) {
    console.warn('[glim sync] steps pull failed:', e);
    return;
  }

  const localIdSet = new Set(entries.map(e => String(e.id)));
  const toAdd = [];
  snapshot.forEach(d => {
    if (!localIdSet.has(d.id)) toAdd.push(d.data());
  });

  if (toAdd.length > 0) {
    const merged = [...entries, ...toAdd].sort((a, b) => a.timestamp - b.timestamp);
    local = { ...local, entries: merged };
    localStorage.setItem('glim-steps', JSON.stringify(local));
    notify(['steps']);
  }
}

// =============================================================================
//  Nutrition logs sync
//  Strategy: additive merge + soft-delete propagation (same as journal).
//  Firestore path: users/{uid}/nutrition/{entryId}
//  Push: entries with createdAt or deletedAt newer than nutritionPushedAt
//  Pull: entries not present locally, or remote deletedAt newer than local
// =============================================================================

async function syncNutritionLogs(uid) {
  const meta         = getSyncMeta();
  const lastPushedAt = meta.nutritionPushedAt ? new Date(meta.nutritionPushedAt) : new Date(0);

  let local;
  try {
    const raw = localStorage.getItem('glim-nutrition');
    local = raw ? JSON.parse(raw) : { logs: [], goals: {}, configUpdatedAt: null };
  } catch {
    return;
  }

  const logs      = Array.isArray(local.logs) ? local.logs : [];
  const logsRef   = collection(db, 'users', uid, 'nutrition');

  // --- PUSH: entries created or soft-deleted since last push ---
  const toPush = logs.filter(e => {
    const created = new Date(e.createdAt || 0);
    const deleted = e.deletedAt ? new Date(e.deletedAt) : null;
    return created > lastPushedAt || (deleted && deleted > lastPushedAt);
  });

  for (const entry of toPush) {
    try {
      await setDoc(doc(logsRef, String(entry.id)), entry, { merge: true });
    } catch (e) {
      console.warn('[glim sync] nutrition log push failed:', entry.id, e);
    }
  }

  // --- PULL: Firestore entries not in localStorage, or with newer deletedAt ---
  let snapshot;
  try {
    snapshot = await getDocs(logsRef);
  } catch (e) {
    console.warn('[glim sync] nutrition log pull failed:', e);
    return;
  }

  const localById = new Map(logs.map(e => [String(e.id), e]));
  const toAdd     = [];
  let updated     = false;

  snapshot.forEach(d => {
    const remote  = d.data();
    const localE  = localById.get(d.id);
    if (!localE) {
      toAdd.push(remote);
    } else if (remote.deletedAt && (!localE.deletedAt || new Date(remote.deletedAt) > new Date(localE.deletedAt))) {
      // Remote has a newer soft-delete - propagate it
      localE.deletedAt = remote.deletedAt;
      updated = true;
    }
  });

  if (toAdd.length > 0 || updated) {
    const merged = [...logs, ...toAdd].sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );
    local = { ...local, logs: merged };
    localSet('glim-nutrition', local);
    notify(['nutrition']);
  }

  setSyncMeta({ nutritionPushedAt: new Date().toISOString() });
}

// =============================================================================
//  Nutrition config sync
//  Strategy: last-write-wins by configUpdatedAt (same as water config).
//  Firestore path: users/{uid}/nutrition-config/current
// =============================================================================

async function syncNutritionConfig(uid) {
  let local;
  try {
    const raw = localStorage.getItem('glim-nutrition');
    local = raw ? JSON.parse(raw) : null;
  } catch {
    return;
  }
  if (!local) return;

  const localGoals           = local.goals ?? {};
  const localConfigUpdatedAt = local.configUpdatedAt ?? new Date(0).toISOString();
  const configRef            = doc(db, 'users', uid, 'nutrition-config', 'current');

  try {
    const snap         = await getDoc(configRef);
    const remoteConfig = snap.exists() ? snap.data() : null;
    const localTime    = new Date(localConfigUpdatedAt);
    const remoteTime   = remoteConfig?.configUpdatedAt ? new Date(remoteConfig.configUpdatedAt) : new Date(0);

    if (!remoteConfig || localTime >= remoteTime) {
      // Local is newer (or no remote): push
      await setDoc(configRef, { goals: localGoals, configUpdatedAt: localConfigUpdatedAt }, { merge: true });
    } else {
      // Remote is newer: pull
      local = { ...local, goals: remoteConfig.goals, configUpdatedAt: remoteConfig.configUpdatedAt };
      localSet('glim-nutrition', local);
      notify(['nutrition']);
    }
  } catch (e) {
    console.warn('[glim sync] nutrition config sync failed:', e);
  }
}

// =============================================================================
//  Nutrition library sync
//  Strategy: additive merge + edit propagation + soft-delete propagation.
//  Firestore path: users/{uid}/nutrition-library/{itemId}
//  Push: items with createdAt or updatedAt newer than nutritionLibraryPushedAt
//  Pull: items not present locally (add), or remote updatedAt newer (update)
// =============================================================================

async function syncNutritionLibrary(uid) {
  const meta         = getSyncMeta();
  const lastPushedAt = meta.nutritionLibraryPushedAt ? new Date(meta.nutritionLibraryPushedAt) : new Date(0);

  let local;
  try {
    const raw = localStorage.getItem('glim-nutrition-library');
    local = raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return;
  }

  const items    = Array.isArray(local.items) ? local.items : [];
  const itemsRef = collection(db, 'users', uid, 'nutrition-library');

  // --- PUSH: items created or updated since last push ---
  const toPush = items.filter(e => {
    const created  = new Date(e.createdAt || 0);
    const modified = e.updatedAt ? new Date(e.updatedAt) : new Date(0);
    return created > lastPushedAt || modified > lastPushedAt;
  });

  for (const item of toPush) {
    try {
      await setDoc(doc(itemsRef, String(item.id)), item, { merge: true });
    } catch (e) {
      console.warn('[glim sync] nutrition library push failed:', item.id, e);
    }
  }

  // --- PULL: items not in localStorage, or remote version is newer ---
  let snapshot;
  try {
    snapshot = await getDocs(itemsRef);
  } catch (e) {
    console.warn('[glim sync] nutrition library pull failed:', e);
    return;
  }

  const localById = new Map(items.map(item => [String(item.id), item]));
  const toAdd     = [];
  let updated     = false;

  snapshot.forEach(d => {
    const remote = d.data();
    const localItem = localById.get(d.id);

    if (!localItem) {
      // New item from another device
      toAdd.push(remote);
    } else {
      // Existing item - check if remote is newer
      const localTime  = localItem.updatedAt ? new Date(localItem.updatedAt) : new Date(0);
      const remoteTime = remote.updatedAt    ? new Date(remote.updatedAt)    : new Date(0);
      if (remoteTime > localTime) {
        // Remote wins: overwrite local fields
        Object.assign(localItem, remote);
        updated = true;
      }
    }
  });

  if (toAdd.length > 0 || updated) {
    const merged = [...items, ...toAdd];
    local = { ...local, items: merged };
    localSet('glim-nutrition-library', local);
    notify(['nutrition-library']);
  }

  setSyncMeta({ nutritionLibraryPushedAt: new Date().toISOString() });
}

// =============================================================================
//  Sync orchestrator
// =============================================================================

async function syncAll() {
  if (!currentUid) return;
  try {
    await Promise.all([
      syncJournal(currentUid),
      syncPokes(currentUid),
      syncSettings(currentUid),
      syncWater(currentUid),
      syncSteps(currentUid),
      syncNutritionLogs(currentUid),
      syncNutritionConfig(currentUid),
      syncNutritionLibrary(currentUid),
    ]);
  } catch (e) {
    console.warn('[glim sync] syncAll failed:', e);
  }
}

// =============================================================================
//  Public API
// =============================================================================

export function startSync(uid) {
  currentUid = uid;

  // Sync immediately on app load to pull cross-device data
  syncAll();

  // Periodic sync every 60 seconds
  syncInterval = setInterval(syncAll, 60_000);

  // Sync when tab regains focus (catches updates from other devices)
  visibilityHandler = () => {
    if (!document.hidden) syncAll();
  };
  document.addEventListener('visibilitychange', visibilityHandler);
}

export function stopSync() {
  currentUid = null;
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
}
