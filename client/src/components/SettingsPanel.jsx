// -----------------------------------------------------------------------------
// Title:       SettingsPanel.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-29
// Purpose:     Renders the settings gear button and settings panel. Manages
//              its own open/close toggle. Reads interval settings from
//              useSettingsStore and writes back on slider change. Sign out
//              button calls Firebase Auth signOut. Reset All Data button
//              clears localStorage and Firestore after typed confirmation.
// Inputs:      Reads from useCreatureStore (hue, sat), useSettingsStore
//              (intervals + setters), useUIStore (showSettings, setShowSettings,
//              setShowJournal). No props required.
// Outputs:     Gear icon button (top-right) + conditionally rendered panel
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { deleteDoc, getDocs, collection, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useCreatureStore } from '../stores/useCreatureStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useUIStore } from '../stores/useUIStore';

// All known localStorage keys owned by Glim
const LOCAL_KEYS = ['glim-water', 'glim-journal', 'glim-pokes', 'glim-settings', 'glim-sync-meta'];

// Firestore collections/singletons to delete (best-effort)
async function deleteFirestoreData(uid) {
  // Event-log collections: delete every document
  for (const col of ['journal', 'water']) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, col));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    } catch { /* ignore */ }
  }
  // Singleton documents
  const singletons = [
    ['pokes', 'counters'],
    ['settings', 'current'],
    ['water-config', 'current'],
  ];
  for (const [col, id] of singletons) {
    try {
      await deleteDoc(doc(db, 'users', uid, col, id));
    } catch { /* ignore */ }
  }
}

export default function SettingsPanel() {
  const { hue, sat } = useCreatureStore();
  const { wellnessInterval, moveInterval, eyesInterval,
    setWellnessInterval, setMoveInterval, setEyesInterval,
  } = useSettingsStore();
  const { showSettings, setShowSettings, setShowJournal } = useUIStore();

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim().toLowerCase() === 'delete';

  const handleReset = async () => {
    if (!canDelete || deleting) return;
    setDeleting(true);

    // Clear localStorage
    LOCAL_KEYS.forEach(k => localStorage.removeItem(k));

    // Clear Firestore (best effort - don't block reload on failure)
    const uid = auth.currentUser?.uid;
    if (uid) await deleteFirestoreData(uid).catch(() => {});

    // Reload to reset all Zustand store state
    window.location.reload();
  };

  const cancelConfirm = () => {
    setShowConfirm(false);
    setConfirmText('');
  };

  const mono = { fontFamily: "'Courier New', monospace" };

  return (
    <>
      {/* ===== SETTINGS GEAR BUTTON ===== */}
      <button onClick={() => { setShowSettings(!showSettings); setShowJournal(false); cancelConfirm(); }}
        className="absolute cursor-pointer" style={{
          top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 16, zIndex: 50, width: 32, height: 32,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.4)", fontSize: 16, transition: "all 0.2s ease",
        }}
        onPointerEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        onPointerLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
      >&#9881;</button>

      {/* ===== SETTINGS PANEL ===== */}
      {showSettings && (
        <div className="absolute" style={{
          top: "calc(env(safe-area-inset-top, 0px) + 56px)", right: 16, zIndex: 50, padding: "16px 20px", borderRadius: 16,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.12)",
          ...mono, color: "rgba(255,255,255,0.85)",
          fontSize: 12, minWidth: 240,
        }}>
          <div style={{ marginBottom: 14, fontSize: 13, letterSpacing: "1px", opacity: 0.6 }}>settings</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span>wellness reminders</span>
              <span style={{ opacity: 0.5 }}>{wellnessInterval} min</span>
            </div>
            <input type="range" min="10" max="60" value={wellnessInterval}
              onChange={(e) => setWellnessInterval(Number(e.target.value))}
              style={{ width: "100%", accentColor: `hsl(${hue}, ${sat}%, 65%)` }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span>move reminders</span>
              <span style={{ opacity: 0.5 }}>{moveInterval} min</span>
            </div>
            <input type="range" min="15" max="90" value={moveInterval}
              onChange={(e) => setMoveInterval(Number(e.target.value))}
              style={{ width: "100%", accentColor: `hsl(${hue}, ${sat}%, 65%)` }} />
          </div>

          <div style={{ marginBottom: 4 }}>
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span>eye break reminders</span>
              <span style={{ opacity: 0.5 }}>{eyesInterval} min</span>
            </div>
            <input type="range" min="10" max="60" value={eyesInterval}
              onChange={(e) => setEyesInterval(Number(e.target.value))}
              style={{ width: "100%", accentColor: `hsl(${hue}, ${sat}%, 65%)` }} />
          </div>

          {/* Sign out */}
          <button onClick={() => signOut(auth)} style={{
            marginTop: 14, width: "100%", padding: "6px 0", borderRadius: 8, cursor: "pointer",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)", ...mono, fontSize: 11,
            letterSpacing: "0.5px", transition: "all 0.2s ease",
          }}
            onPointerEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            onPointerLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >sign out</button>

          {/* Divider */}
          <div style={{ margin: "14px 0 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }} />

          {/* Reset All Data */}
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                width: "100%", padding: "6px 0", borderRadius: 8, cursor: "pointer",
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "rgba(239,68,68,0.5)", ...mono, fontSize: 11,
                letterSpacing: "0.5px", transition: "all 0.2s ease",
              }}
              onPointerEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "rgba(239,68,68,0.8)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
              onPointerLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "rgba(239,68,68,0.5)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
            >reset all data</button>
          ) : (
            <div>
              <p style={{ margin: "0 0 10px", fontSize: 11, color: "rgba(239,68,68,0.75)", lineHeight: 1.5 }}>
                this will permanently delete your journal, water logs, pokes, and settings on all devices. this cannot be undone.
              </p>
              <input
                autoFocus
                type="text"
                placeholder='type "delete" to confirm'
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') cancelConfirm(); if (e.key === 'Enter') handleReset(); }}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "6px 8px", borderRadius: 6, marginBottom: 8,
                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)",
                  color: "rgba(255,255,255,0.7)", ...mono, fontSize: 11,
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={cancelConfirm}
                  style={{
                    flex: 1, padding: "6px 0", borderRadius: 8, cursor: "pointer",
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)", ...mono, fontSize: 11,
                  }}
                >cancel</button>
                <button
                  onClick={handleReset}
                  disabled={!canDelete || deleting}
                  style={{
                    flex: 1, padding: "6px 0", borderRadius: 8,
                    cursor: canDelete && !deleting ? "pointer" : "not-allowed",
                    background: canDelete ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.05)",
                    border: `1px solid ${canDelete ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.15)"}`,
                    color: canDelete ? "rgba(239,68,68,0.9)" : "rgba(239,68,68,0.25)",
                    ...mono, fontSize: 11,
                    transition: "all 0.15s ease",
                  }}
                >{deleting ? "deleting..." : "delete everything"}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
