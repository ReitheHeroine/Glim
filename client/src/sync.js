// -----------------------------------------------------------------------------
// Title:       sync.js
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-26
// Last Modified: 2026-03-26
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

  if (toPush.length > 0) {
    setSyncMeta({ journalPushedAt: new Date().toISOString() });
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
//  Sync orchestrator
// =============================================================================

async function syncAll() {
  if (!currentUid) return;
  try {
    await Promise.all([
      syncJournal(currentUid),
      syncPokes(currentUid),
      syncSettings(currentUid),
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
