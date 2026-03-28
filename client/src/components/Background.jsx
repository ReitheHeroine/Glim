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

export default function Background({ hue, sat, mood, isMobile }) {
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
      {/* Two independent SVGs: mobile and desktop can be tweaked separately.
          Both use preserveAspectRatio="xMidYMax slice" (uniform scale, no
          distortion, anchored to bottom-center). Heights differ per device. */}
      {isMobile ? (

        // ----- MOBILE landscape -----
        // viewBox 800x400. height: 28vh.
        // Edit this SVG to change mobile only.
        <svg className="absolute bottom-0 w-full" viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMax slice" style={{ height: '28vh' }}>

          {/* Far mountains */}
          <path d="M0,354 L35,318 L70,336 L105,294 L140,321 L175,275 L209,310 L244,260 L279,302 L314,253 L349,298 L383,248 L418,248 L453,298 L488,253 L522,302 L557,260 L592,310 L627,275 L662,321 L697,294 L732,336 L766,318 L800,354 L800,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

          {/* Near mountains */}
          <path d="M0,390 L50,339 L100,388 L150,309 L200,385 L250,288 L300,383 L350,276 L400,380 L450,272 L500,380 L550,277 L600,383 L650,291 L700,385 L750,314 L800,390 L800,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Cluster 1 — left edge */}
          <path d="M55,318 L52,336 L58,336 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M68,310 L64,336 L72,336 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M60,302 L56,336 L65,336 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M74,294 L69,336 L80,336 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Lone trees 1–2 */}
          <path d="M136,316 L134,336 L139,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M161,320 L159,336 L163,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 2 */}
          <path d="M225,314 L222,336 L228,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M236,304 L232,336 L241,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M230,296 L225,336 L236,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M243,288 L236,336 L249,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 2–3 */}
          <path d="M304,312 L300,336 L308,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M328,318 L325,336 L331,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 3 — center */}
          <path d="M392,312 L388,336 L395,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path d="M410,302 L406,336 L415,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M398,292 L392,336 L404,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
          <path d="M404,288 L398,336 L411,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

          {/* Lone trees 3–4 */}
          <path d="M472,312 L469,336 L476,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M496,318 L494,336 L499,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 4 */}
          <path d="M559,314 L556,336 L562,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M571,304 L567,336 L576,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M565,296 L560,336 L571,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M578,288 L571,336 L584,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 4–5 */}
          <path d="M639,316 L637,336 L642,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M666,320 L664,336 L668,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 5 — right edge */}
          <path d="M729,318 L727,336 L732,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M740,310 L737,336 L744,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M734,302 L730,336 L739,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M746,294 L741,336 L752,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          <rect x="0" y="336" width="800" height="64" fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
        </svg>

      ) : (

        // ----- DESKTOP landscape -----
        // viewBox 1600x400. height: 28vh.
        // Edit this SVG to change desktop only.
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1600 400"
          preserveAspectRatio="xMidYMax slice" style={{ height: '28vh' }}>

          {/* Far mountains */}
          <path d="M0,354 L70,318 L139,336 L209,294 L278,321 L348,275 L417,310 L487,260 L557,302 L626,253 L696,298 L765,248 L835,248 L904,298 L974,253 L1043,302 L1113,260 L1183,310 L1252,275 L1322,321 L1391,294 L1461,336 L1530,318 L1600,354 L1600,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

          {/* Near mountains — valleys raised to y=336-342 so they sit on the
              ground rather than being cut through by it */}
          <path d="M0,342 L100,320 L200,340 L300,296 L400,338 L500,280 L600,337 L700,265 L800,336 L900,262 L1000,336 L1100,265 L1200,337 L1300,278 L1400,338 L1500,302 L1600,342 L1600,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Trees — heights scaled to ~60% of original (max 28u, was 48u).
              Base at y=336. */}

          {/* Cluster 1 — left edge */}
          <path d="M110,325 L105,336 L115,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M135,320 L128,336 L142,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M120,316 L111,336 L129,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M148,311 L136,336 L160,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Lone trees 1–2 */}
          <path d="M272,324 L266,336 L278,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M322,326 L317,336 L327,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 2 */}
          <path d="M450,323 L444,336 L456,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M472,317 L463,336 L481,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M460,312 L449,336 L471,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M485,308 L472,336 L498,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 2–3 */}
          <path d="M608,322 L602,336 L614,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M656,325 L651,336 L661,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 3 — center */}
          <path d="M783,322 L777,336 L789,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path d="M820,316 L811,336 L829,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M795,310 L783,336 L807,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
          <path d="M808,308 L795,336 L821,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

          {/* Lone trees 3–4 */}
          <path d="M944,322 L938,336 L950,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M992,325 L987,336 L997,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 4 */}
          <path d="M1118,323 L1112,336 L1124,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M1142,317 L1133,336 L1151,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M1130,312 L1119,336 L1141,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M1155,308 L1142,336 L1168,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 4–5 */}
          <path d="M1278,324 L1272,336 L1284,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M1332,326 L1327,336 L1337,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 5 — right edge */}
          <path d="M1458,325 L1453,336 L1463,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M1480,320 L1473,336 L1487,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M1468,316 L1459,336 L1477,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M1492,311 L1480,336 L1504,336 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          <rect x="0" y="336" width="1600" height="64" fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
        </svg>

      )}

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
