// -----------------------------------------------------------------------------
// Title:       SettingsPanel.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Renders the settings gear button and settings panel. Manages
//              its own open/close toggle. Reads interval settings from
//              useSettingsStore and writes back on slider change. Sign out
//              button calls Firebase Auth signOut.
// Inputs:      Reads from useCreatureStore (hue, sat), useSettingsStore
//              (intervals + setters), useUIStore (showSettings, setShowSettings,
//              setShowJournal). No props required.
// Outputs:     Gear icon button (top-right) + conditionally rendered panel
// -----------------------------------------------------------------------------

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useCreatureStore } from '../stores/useCreatureStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useUIStore } from '../stores/useUIStore';

export default function SettingsPanel() {
  const { hue, sat } = useCreatureStore();
  const { wellnessInterval, moveInterval, eyesInterval,
    setWellnessInterval, setMoveInterval, setEyesInterval,
  } = useSettingsStore();
  const { showSettings, setShowSettings, setShowJournal } = useUIStore();

  return (
    <>
      {/* ===== SETTINGS GEAR BUTTON ===== */}
      <button onClick={() => { setShowSettings(!showSettings); setShowJournal(false); }}
        className="absolute cursor-pointer" style={{
          top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 16, zIndex: 50, width: 32, height: 32,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.4)", fontSize: 16, transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
      >&#9881;</button>

      {/* ===== SETTINGS PANEL ===== */}
      {showSettings && (
        <div className="absolute" style={{
          top: "calc(env(safe-area-inset-top, 0px) + 56px)", right: 16, zIndex: 50, padding: "16px 20px", borderRadius: 16,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.12)",
          fontFamily: "'Courier New', monospace", color: "rgba(255,255,255,0.85)",
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

          <button onClick={() => signOut(auth)} style={{
            marginTop: 14, width: "100%", padding: "6px 0", borderRadius: 8, cursor: "pointer",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)", fontFamily: "'Courier New', monospace", fontSize: 11,
            letterSpacing: "0.5px", transition: "all 0.2s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >sign out</button>
        </div>
      )}
    </>
  );
}
