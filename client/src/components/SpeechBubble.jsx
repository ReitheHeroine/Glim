// -----------------------------------------------------------------------------
// Title:       SpeechBubble.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Renders Glim's speech bubble above the creature. Fades in/out
//              based on visibility prop. Wellness messages get a distinct
//              teal styling with a tilde prefix.
// Inputs:      text (string), visible (bool), isWellness (bool) props
// Outputs:     Absolutely positioned bubble anchored below the creature wrapper
// -----------------------------------------------------------------------------

export default function SpeechBubble({ text, visible, isWellness }) {
  return (
    <div className="absolute left-1/2 transition-all duration-500 pointer-events-none select-none"
      style={{
        bottom: "100%", marginBottom: "10px", transform: "translateX(-50%)",
        opacity: visible ? 1 : 0, scale: visible ? "1" : "0.8", width: "max-content",
      }}>
      <div className="relative px-6 py-2 rounded-2xl text-center" style={{
        maxWidth: 'calc(100vw - 40px)', width: "max-content", whiteSpace: "normal", lineHeight: 1.4,
        background: isWellness ? "rgba(100, 220, 180, 0.15)" : "rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        border: isWellness ? "1px solid rgba(100, 220, 180, 0.3)" : "1px solid rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.9)", fontFamily: "'Courier New', monospace",
        fontSize: 'var(--glim-text-base)', letterSpacing: "0.3px",
      }}>
        {isWellness && <span style={{ marginRight: 4, fontSize: 'var(--glim-text-sm)', opacity: 0.7 }}>~</span>}
        {text}
        <div className="absolute left-1/2 -bottom-1.5" style={{
          transform: "translateX(-50%) rotate(45deg)", width: 8, height: 8,
          background: isWellness ? "rgba(100, 220, 180, 0.15)" : "rgba(255,255,255,0.1)",
          border: isWellness ? "1px solid rgba(100, 220, 180, 0.3)" : "1px solid rgba(255,255,255,0.15)",
          borderTop: "none", borderLeft: "none",
        }} />
      </div>
    </div>
  );
}
