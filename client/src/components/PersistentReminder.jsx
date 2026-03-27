// -----------------------------------------------------------------------------
// Title:       PersistentReminder.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Renders the persistent move or eye-break reminder bar with a
//              "done!" dismiss button. Orange tint for move reminders, blue
//              tint for eye reminders.
// Inputs:      text (string), type ("move"|"eyes"), onDismiss (handler) props
// Outputs:     Flex row reminder bar
// -----------------------------------------------------------------------------

export default function PersistentReminder({ text, type, onDismiss }) {
  const bg = type === "move" ? "rgba(255, 180, 100, 0.15)" : "rgba(130, 180, 255, 0.15)";
  const border = type === "move" ? "rgba(255, 180, 100, 0.35)" : "rgba(130, 180, 255, 0.35)";
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{
      background: bg, border: `1px solid ${border}`, backdropFilter: "blur(10px)",
      fontFamily: "'Courier New', monospace", fontSize: "13px", color: "rgba(255,255,255,0.9)",
      animation: "reminderPulse 3s ease-in-out infinite", maxWidth: 560,
    }}>
      <div className="flex-1" style={{ lineHeight: 1.4 }}>{text}</div>
      <button onClick={onDismiss} className="flex-shrink-0 px-3 py-1 rounded-xl cursor-pointer" style={{
        background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
        color: "rgba(255,255,255,0.9)", fontFamily: "'Courier New', monospace", fontSize: "12px",
        letterSpacing: "0.5px", transition: "all 0.2s ease",
      }}
        onPointerEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.25)"; }}
        onPointerLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.12)"; }}
      >done!</button>
    </div>
  );
}
