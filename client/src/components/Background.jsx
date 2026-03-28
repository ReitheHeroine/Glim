// -----------------------------------------------------------------------------
// Title:       Background.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Renders Glim's world: sky gradients keyed to time of day,
//              twinkling stars, shooting star, nebula wisps, landscape
//              silhouette with pine trees, floating motes near Glim, and
//              safe-area gap fill for iPhone.
// Inputs:      hue, sat, mood props from DesktopPet (passed from creatureStore)
// Outputs:     Absolutely positioned full-viewport background layer (zIndex 1)
// -----------------------------------------------------------------------------

import { useState, useEffect, useRef } from 'react';

export default function Background({ hue, sat, mood }) {
  const h = hue, s = sat;
  const h2 = (h + 30) % 360;
  const h3 = (h + 60) % 360;

  // Sky gradients per time of day (perpetual twilight, no sun)
  const SKY_GRADIENTS = {
    earlyMorning: "linear-gradient(180deg, #1a1a3a 0%, #2a3a5a 30%, #3a4a5a 60%, #5a5a5a 80%, #7a6a5a 100%)",
    morning: "linear-gradient(180deg, #1a2a4a 0%, #2a4a6a 30%, #3a5a6a 55%, #4a6a6a 75%, #5a7a6a 100%)",
    afternoon: "linear-gradient(180deg, #1a2040 0%, #2a3a5a 30%, #3a4a6a 50%, #4a5a6a 68%, #5a6a70 82%, #6a7a78 100%)",
    evening: "linear-gradient(180deg, #1a1a3a 0%, #3a2a4a 25%, #5a3a4a 45%, #7a4a4a 65%, #8a5a4a 80%, #9a6a4a 100%)",
    lateNight: "linear-gradient(180deg, #08081a 0%, #0f0f2a 30%, #151530 60%, #1a1a3a 100%)",
  };

  const HORIZON_GLOWS = {
    earlyMorning: "rgba(180, 140, 100, 0.12)",
    morning: "rgba(120, 170, 140, 0.08)",
    afternoon: "rgba(150, 175, 190, 0.14)",
    evening: "rgba(200, 130, 90, 0.1)",
    lateNight: "rgba(80, 80, 120, 0.04)",
  };

  const STAR_BRIGHTNESS = {
    earlyMorning: 0.6,
    morning: 0.35,
    afternoon: 0.25,
    evening: 0.5,
    lateNight: 0.9,
  };

  const starBright = STAR_BRIGHTNESS[mood] || 0.5;

  // Stars -- bigger and brighter
  const stars = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 70,
      size: Math.random() > 0.85 ? Math.random() * 3 + 3 : Math.random() * 2 + 1.5,
      twinkleDur: Math.random() * 3 + 2,
      twinkleDelay: Math.random() * 5,
      brightness: Math.random() * 0.4 + 0.6,
    }))
  ).current;

  // Motes near Glim -- bigger and glowier
  const motes = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i, x: 30 + Math.random() * 40, y: 20 + Math.random() * 55,
      size: Math.random() * 4 + 2, dur: Math.random() * 7 + 5,
      delay: Math.random() * 6, opacity: Math.random() * 0.4 + 0.3,
    }))
  ).current;

  // Shooting star
  const [shootingStar, setShootingStar] = useState(null);
  useEffect(() => {
    const starTimer = { current: null };
    const schedule = () => {
      starTimer.current = setTimeout(() => {
        setShootingStar({
          id: Date.now(),
          startX: Math.random() * 50 + 5,
          startY: Math.random() * 25 + 3,
          dur: Math.random() * 0.6 + 0.5,
        });
        setTimeout(() => setShootingStar(null), 2000);
        schedule();
      }, Math.random() * 25000 + 12000);
    };
    schedule();
    return () => clearTimeout(starTimer.current);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>

      {/* ===== SKY CROSSFADE LAYERS ===== */}
      {Object.entries(SKY_GRADIENTS).map(([key, gradient]) => (
        <div key={key} className="absolute inset-0" style={{
          background: gradient,
          opacity: mood === key ? 1 : 0,
          transition: "opacity 120s ease",
        }} />
      ))}

      {/* ===== HORIZON GLOW ===== */}
      <div className="absolute" style={{
        bottom: "18%", left: 0, right: 0, height: "25%",
        background: `radial-gradient(ellipse at 50% 100%, ${HORIZON_GLOWS[mood]}, transparent 70%)`,
        transition: "background 120s ease",
      }} />

      {/* ===== MOON (late night only) ===== */}
      <div className="absolute" style={{
        left: "75%", top: "12%", width: 28, height: 28, borderRadius: "50%",
        backgroundColor: "#d0d8e8",
        boxShadow: "0 0 20px rgba(200,210,230,0.3), 0 0 50px rgba(200,210,230,0.15)",
        transform: "translate(-50%, -50%)",
        opacity: mood === "lateNight" ? 1 : 0,
        transition: "opacity 120s ease",
      }} />

      {/* ===== TWINKLING STARS ===== */}
      {stars.map((st) => (
        <div key={st.id} className="absolute rounded-full" style={{
          left: `${st.x}%`, top: `${st.y}%`,
          width: st.size, height: st.size,
          backgroundColor: `hsla(${(h + (st.id % 4) * 20) % 360}, ${s - 10}%, 90%, ${st.brightness * starBright})`,
          boxShadow: st.size > 3 ? `0 0 ${st.size * 2}px hsla(${(h + (st.id % 4) * 20) % 360}, ${s}%, 80%, ${0.4 * starBright})` : "none",
          animation: `twinkle ${st.twinkleDur}s ease-in-out ${st.twinkleDelay}s infinite`,
        }} />
      ))}

      {/* ===== SHOOTING STAR ===== */}
      {shootingStar && (
        <div key={shootingStar.id} className="absolute" style={{
          left: `${shootingStar.startX}%`, top: `${shootingStar.startY}%`,
          width: 4, height: 4, borderRadius: "50%",
          backgroundColor: `hsla(${h2}, ${s}%, 95%, 1)`,
          boxShadow: `0 0 6px 2px hsla(${h2}, ${s}%, 90%, 0.8), 0 0 15px hsla(${h2}, ${s}%, 85%, 0.5)`,
          animation: `shootingStar ${shootingStar.dur}s linear forwards`,
        }} />
      )}

      {/* ===== NEBULA WISPS ===== */}
      <div className="absolute" style={{
        left: "5%", top: "10%", width: "40%", height: "30%",
        borderRadius: "50%",
        background: `radial-gradient(ellipse, hsla(${h}, ${s}%, 50%, 0.18) 0%, hsla(${h}, ${s}%, 40%, 0.05) 50%, transparent 70%)`,
        animation: "nebulaFloat1 25s ease-in-out infinite",
        filter: "blur(40px)",
      }} />
      <div className="absolute" style={{
        right: "0%", top: "20%", width: "35%", height: "25%",
        borderRadius: "50%",
        background: `radial-gradient(ellipse, hsla(${h2}, ${s}%, 55%, 0.15) 0%, hsla(${h2}, ${s}%, 45%, 0.04) 50%, transparent 70%)`,
        animation: "nebulaFloat2 30s ease-in-out infinite",
        filter: "blur(45px)",
      }} />
      <div className="absolute" style={{
        left: "30%", top: "0%", width: "30%", height: "22%",
        borderRadius: "50%",
        background: `radial-gradient(ellipse, hsla(${h3}, ${s}%, 50%, 0.12) 0%, hsla(${h3}, ${s}%, 40%, 0.03) 50%, transparent 70%)`,
        animation: "nebulaFloat3 35s ease-in-out infinite",
        filter: "blur(35px)",
      }} />

      {/* ===== LANDSCAPE SILHOUETTE ===== */}
      {/* viewBox 1600x400. preserveAspectRatio="xMidYMax slice": uniform scale,
          anchored bottom-center, crops edges. height: 28vh scales with viewport.
          Mobile sees center crop; desktop sees full panorama. No distortion. */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1600 400"
        preserveAspectRatio="xMidYMax slice" style={{ height: '28vh' }}>

        {/* Far mountains — 24 vertices, sharp alpine ridgeline.
            Envelope: (1 - (dist/800)² × 0.55). Tallest peaks ~y=248 at center.
            Valley floor clamped to 68% of peak height (~y=297 at center). */}
        <path d="M0,354 L70,318 L139,336 L209,294 L278,321 L348,275 L417,310 L487,260 L557,302 L626,253 L696,298 L765,248 L835,248 L904,298 L974,253 L1043,302 L1113,260 L1183,310 L1252,275 L1322,321 L1391,294 L1461,336 L1530,318 L1600,354 L1600,400 L0,400 Z"
          fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

        {/* Near mountains — 17 vertices, center offset 5% right (x≈880).
            Tallest peak ~y=272 (25u above far valley floor y=297).
            Valleys ~y=380, hidden by ground rect. */}
        <path d="M0,390 L100,339 L200,388 L300,309 L400,385 L500,288 L600,383 L700,276 L800,380 L900,272 L1000,380 L1100,277 L1200,383 L1300,291 L1400,385 L1500,314 L1600,390 L1600,400 L0,400 Z"
          fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

        {/* Trees — 28 simple triangles. Base at y=336.
            Within each cluster: smallest drawn first (behind), largest last (front).
            Lone trees are smaller and more transparent. Edge clusters more transparent. */}

        {/* Cluster 1 — center x≈128, left edge (expendable) */}
        <path d="M110,318 L105,336 L115,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
        <path d="M135,310 L128,336 L142,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
        <path d="M120,302 L111,336 L129,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
        <path d="M148,294 L137,336 L159,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

        {/* Lone trees between clusters 1–2 */}
        <path d="M272,316 L267,336 L277,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
        <path d="M322,320 L318,336 L326,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

        {/* Cluster 2 — center x≈464 */}
        <path d="M450,314 L444,336 L456,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
        <path d="M472,304 L463,336 L481,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
        <path d="M460,296 L449,336 L471,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
        <path d="M485,288 L472,336 L498,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

        {/* Lone trees between clusters 2–3 */}
        <path d="M608,312 L601,336 L615,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
        <path d="M656,318 L651,336 L661,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

        {/* Cluster 3 — center x≈800, canvas center */}
        <path d="M783,312 L776,336 L790,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
        <path d="M820,302 L811,336 L829,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
        <path d="M795,292 L783,336 L807,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
        <path d="M808,288 L795,336 L821,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

        {/* Lone trees between clusters 3–4 */}
        <path d="M944,312 L937,336 L951,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
        <path d="M992,318 L987,336 L997,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

        {/* Cluster 4 — center x≈1136 */}
        <path d="M1118,314 L1112,336 L1124,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
        <path d="M1142,304 L1133,336 L1151,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
        <path d="M1130,296 L1119,336 L1141,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
        <path d="M1155,288 L1142,336 L1168,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

        {/* Lone trees between clusters 4–5 */}
        <path d="M1278,316 L1273,336 L1283,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
        <path d="M1332,320 L1328,336 L1336,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

        {/* Cluster 5 — center x≈1472, right edge (expendable) */}
        <path d="M1458,318 L1453,336 L1463,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
        <path d="M1480,310 L1473,336 L1487,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
        <path d="M1468,302 L1459,336 L1477,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
        <path d="M1492,294 L1481,336 L1503,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

        {/* Ground rect — covers tree bases and buried near-mountain valleys */}
        <rect x="0" y="336" width="1600" height="64" fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
      </svg>

      {/* Safe-area gap fill -- matches ground color so no strip shows on iPhone */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: "env(safe-area-inset-bottom, 0px)",
        backgroundColor: `hsla(${h}, ${s - 15}%, 4%, 1)`,
      }} />

      {/* ===== FLOATING MOTES (near Glim) ===== */}
      {motes.map((p) => (
        <div key={`m${p.id}`} className="absolute rounded-full" style={{
          left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
          backgroundColor: `hsla(${hue}, ${sat}%, 85%, ${p.opacity})`,
          boxShadow: `0 0 ${p.size * 2}px hsla(${hue}, ${sat}%, 80%, ${p.opacity * 0.5})`,
          animation: `particleDrift ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}
