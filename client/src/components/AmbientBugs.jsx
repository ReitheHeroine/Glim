// -----------------------------------------------------------------------------
// Title:       AmbientBugs.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Renders 5 glowing ambient bugs that fly independent paths
//              around the screen. The chased bug (if any) glows brighter and
//              scales up to indicate Glim is pursuing it.
// Inputs:      hue (number), chasedBugId (number|null) props
// Outputs:     Absolutely positioned overlay layer (zIndex 5)
// -----------------------------------------------------------------------------

import { useRef } from 'react';

export default function AmbientBugs({ hue, chasedBugId }) {
  const bugs = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      dur: Math.random() * 8 + 10,
      delay: Math.random() * 5,
      size: Math.random() * 2 + 3,
      pathIndex: i % 5,
    }))
  ).current;

  const bugHue = (hue + 90) % 360;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {bugs.map((b) => (
        <div key={b.id} className="absolute" style={{
          width: b.size, height: b.size, borderRadius: "50%",
          backgroundColor: `hsla(${bugHue + b.id * 15}, 70%, 75%, ${chasedBugId === b.id ? 1 : 0.7})`,
          boxShadow: `0 0 ${b.size * 2}px hsla(${bugHue + b.id * 15}, 70%, 70%, ${chasedBugId === b.id ? 0.8 : 0.4})`,
          animation: `bugPath${b.pathIndex} ${b.dur}s ease-in-out ${b.delay}s infinite`,
          transition: "opacity 0.3s ease",
          opacity: chasedBugId === b.id ? 1 : 0.8,
          transform: chasedBugId === b.id ? "scale(1.5)" : "scale(1)",
        }} />
      ))}
    </div>
  );
}
