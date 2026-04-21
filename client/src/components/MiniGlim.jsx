// -----------------------------------------------------------------------------
// Title:       MiniGlim.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-04-20
// Last Modified: 2026-04-20
// Purpose:     Face-only SVG rendition of Glim for the focus-mode header.
//              Standalone SVG (not a scaled-down OwlMoth): face disc, eyes,
//              pupils, highlights, nose, blushes, and antennae (with bobble
//              glow). No body, wings, tail, or Zzz. Pupil tracking and blink
//              match the full creature; colors are derived from hue/sat so
//              mini-Glim shares the palette with the full creature.
// Inputs:      hue, sat, pupilOffset, isBlinking, isSleeping, antennaPerk,
//              size (default 48).
// Outputs:     <svg> element sized `size` x `size` pixels.
// -----------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';

export default function MiniGlim({
  hue,
  sat,
  pupilOffset = { x: 0, y: 0 },
  isBlinking = false,
  isSleeping = false,
  antennaPerk = false,
  size = 48,
}) {
  // --- Internal blink timer (every 4-8s, skipped during sleep) ---
  const [internalBlink, setInternalBlink] = useState(false);
  const blinkTimerRef = useRef(null);
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 4000 + Math.random() * 4000;
      blinkTimerRef.current = setTimeout(() => {
        if (!isSleeping) {
          setInternalBlink(true);
          setTimeout(() => setInternalBlink(false), 180);
        }
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); };
  }, [isSleeping]);

  // --- Derived colors (must match OwlMoth exactly) ---
  const h2 = (hue + 30) % 360;
  const h3 = (hue + 60) % 360;

  const faceFill    = `hsla(${h2}, ${sat - 15}%, 88%, 0.35)`;
  const pupilFill   = `hsl(${(hue + 40) % 360}, 40%, 15%)`;
  const noseFill    = `hsla(${(hue + 30) % 360}, ${sat - 20}%, 65%, 0.8)`;
  const blushFill   = `hsla(${h3}, 60%, 72%, 0.3)`;
  const stalkStroke = `hsla(${hue}, ${sat}%, 70%, 0.6)`;
  const bobbleFill  = `hsla(${h2}, ${sat + 5}%, 78%, 0.85)`;
  const bobbleGlow  = `hsla(${h2}, ${sat}%, 80%, 0.15)`;

  // --- Eye state ---
  // Blinking or sleeping squishes eyes to a line; pupils hidden in both cases.
  const blinkActive = isBlinking || internalBlink;
  const eyesClosed  = blinkActive || isSleeping;
  const eyeRy       = eyesClosed ? 2 : 10;
  const showPupils  = !eyesClosed;

  // --- Pupil tracking (same math as OwlMoth, scaled to 100x100 viewBox) ---
  const px = (pupilOffset?.x ?? 0) * 3.5;
  const py = (pupilOffset?.y ?? 0) * 2.5;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{
        display:   'block',
        overflow:  'visible',
        animation: 'miniGlimFloat 5s ease-in-out infinite',
      }}
    >
      {/* Face disc */}
      <ellipse cx={50} cy={55} rx={34} ry={30} fill={faceFill} />

      {/* Blushes */}
      <ellipse cx={27} cy={59} rx={5} ry={2.5} fill={blushFill} />
      <ellipse cx={73} cy={59} rx={5} ry={2.5} fill={blushFill} />

      {/* Left eye */}
      <ellipse cx={38} cy={52} rx={10} ry={eyeRy} fill="rgba(255,255,255,0.95)"
        style={{ transition: 'ry 180ms ease' }} />
      {showPupils && (
        <>
          <circle cx={38 + px} cy={52 + py} r={6} fill={pupilFill} />
          <circle cx={40} cy={49} r={2} fill="rgba(255,255,255,0.85)" />
        </>
      )}

      {/* Right eye */}
      <ellipse cx={62} cy={52} rx={10} ry={eyeRy} fill="rgba(255,255,255,0.95)"
        style={{ transition: 'ry 180ms ease' }} />
      {showPupils && (
        <>
          <circle cx={62 + px} cy={52 + py} r={6} fill={pupilFill} />
          <circle cx={64} cy={49} r={2} fill="rgba(255,255,255,0.85)" />
        </>
      )}

      {/* Nose */}
      <path d="M48,60 L50,64 L52,60" fill="none" stroke={noseFill}
        strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Left antenna */}
      <g style={{
        transformOrigin: '38px 30px',
        animation: antennaPerk ? 'antennaPerkL 500ms ease' : 'none',
      }}>
        <path d="M38,30 Q32,16 28,8" fill="none" stroke={stalkStroke}
          strokeWidth={2} strokeLinecap="round" />
        <circle cx={28} cy={8} r={7.5} fill={bobbleGlow}
          style={{ animation: 'softPulse 3s ease-in-out infinite' }} />
        <circle cx={28} cy={8} r={5} fill={bobbleFill} />
      </g>

      {/* Right antenna */}
      <g style={{
        transformOrigin: '62px 30px',
        animation: antennaPerk ? 'antennaPerkR 500ms ease' : 'none',
      }}>
        <path d="M62,30 Q68,16 72,8" fill="none" stroke={stalkStroke}
          strokeWidth={2} strokeLinecap="round" />
        <circle cx={72} cy={8} r={7.5} fill={bobbleGlow}
          style={{ animation: 'softPulse 3s ease-in-out infinite' }} />
        <circle cx={72} cy={8} r={5} fill={bobbleFill} />
      </g>
    </svg>
  );
}
