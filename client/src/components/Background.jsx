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
        // viewBox 800x400. height: 32vh.
        // Ground line: y=295. Far peaks raised -30. Near valleys clamped to 295.
        // Trees shifted -41 (apex and base together).
        <svg className="absolute bottom-0 w-full" viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMax slice" style={{ height: '32vh' }}>

          {/* Far mountains — all interior y values -30 from original */}
          <path d="M0,324 L35,288 L70,306 L105,264 L140,291 L175,245 L209,280 L244,230 L279,272 L314,223 L349,268 L383,218 L418,218 L453,268 L488,223 L522,272 L557,230 L592,280 L627,245 L662,291 L697,264 L732,306 L766,288 L800,324 L800,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

          {/* Near mountains — valleys clamped to y=295 (new ground line) */}
          <path d="M0,295 L50,295 L100,295 L150,295 L200,295 L250,288 L300,295 L350,276 L400,295 L450,272 L500,295 L550,277 L600,295 L650,291 L700,295 L750,295 L800,295 L800,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Cluster 1 — left edge (all y -41) */}
          <path d="M55,277 L52,295 L58,295 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M68,269 L64,295 L72,295 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M60,261 L56,295 L65,295 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M74,253 L69,295 L80,295 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Lone trees 1–2 */}
          <path d="M136,275 L134,295 L139,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M161,279 L159,295 L163,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 2 */}
          <path d="M225,273 L222,295 L228,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M236,263 L232,295 L241,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M230,255 L225,295 L236,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M243,247 L236,295 L249,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 2–3 */}
          <path d="M304,271 L300,295 L308,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M328,277 L325,295 L331,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 3 — center */}
          <path d="M392,271 L388,295 L395,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path d="M410,261 L406,295 L415,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M398,251 L392,295 L404,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
          <path d="M404,247 L398,295 L411,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

          {/* Lone trees 3–4 */}
          <path d="M472,271 L469,295 L476,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M496,277 L494,295 L499,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 4 */}
          <path d="M559,273 L556,295 L562,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M571,263 L567,295 L576,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M565,255 L560,295 L571,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M578,247 L571,295 L584,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 4–5 */}
          <path d="M639,275 L637,295 L642,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M666,279 L664,295 L668,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 5 — right edge */}
          <path d="M729,277 L727,295 L732,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M740,269 L737,295 L744,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M734,261 L730,295 L739,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M746,253 L741,295 L752,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          <rect x="0" y="295" width="800" height="105" fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
        </svg>

      ) : (

        // ----- DESKTOP landscape -----
        // viewBox 1600x400. height: 32vh.
        // Ground line: y=295. Far peaks raised -30. Near valleys clamped to 295.
        // Trees shifted -41 (apex and base together).
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1600 400"
          preserveAspectRatio="xMidYMax slice" style={{ height: '32vh' }}>

          {/* Far mountains — all interior y values -30 from original */}
          <path d="M0,324 L70,288 L139,306 L209,264 L278,291 L348,245 L417,280 L487,230 L557,272 L626,223 L696,268 L765,218 L835,218 L904,268 L974,223 L1043,272 L1113,230 L1183,280 L1252,245 L1322,291 L1391,264 L1461,306 L1530,288 L1600,324 L1600,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

          {/* Near mountains — valleys clamped to y=295 (new ground line) */}
          <path d="M0,295 L100,295 L200,295 L300,295 L400,295 L500,280 L600,295 L700,265 L800,295 L900,262 L1000,295 L1100,265 L1200,295 L1300,278 L1400,295 L1500,295 L1600,295 L1600,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Trees — base at y=295, all y shifted -41 from original. */}

          {/* Cluster 1 — left edge */}
          <path d="M110,284 L105,295 L115,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M135,279 L128,295 L142,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M120,275 L111,295 L129,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M148,270 L136,295 L160,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Lone trees 1–2 */}
          <path d="M272,283 L266,295 L278,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M322,285 L317,295 L327,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 2 */}
          <path d="M450,282 L444,295 L456,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M472,276 L463,295 L481,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M460,271 L449,295 L471,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M485,267 L472,295 L498,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 2–3 */}
          <path d="M608,281 L602,295 L614,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M656,284 L651,295 L661,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 3 — center */}
          <path d="M783,281 L777,295 L789,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path d="M820,275 L811,295 L829,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M795,269 L783,295 L807,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
          <path d="M808,267 L795,295 L821,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

          {/* Lone trees 3–4 */}
          <path d="M944,281 L938,295 L950,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M992,284 L987,295 L997,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 4 */}
          <path d="M1118,282 L1112,295 L1124,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M1142,276 L1133,295 L1151,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M1130,271 L1119,295 L1141,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M1155,267 L1142,295 L1168,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 4–5 */}
          <path d="M1278,283 L1272,295 L1284,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M1332,285 L1327,295 L1337,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 5 — right edge */}
          <path d="M1458,284 L1453,295 L1463,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M1480,279 L1473,295 L1487,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M1468,275 L1459,295 L1477,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M1492,270 L1480,295 L1504,295 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          <rect x="0" y="295" width="1600" height="105" fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
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
