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
      {/* Ground div — plain HTML, always covers NavBar (~58px) + visible ground
          above it. 120px is predictable across screen sizes unlike the SVG
          ground rect which depends on viewBox/slice math. */}
      <div className="absolute bottom-0 left-0 right-0" style={{
        height: 120,
        backgroundColor: `hsla(${h}, ${s - 15}%, 4%, 1)`,
        zIndex: 0,
      }} />

      {/* Two independent SVGs overlapping the ground div (both at bottom: 0).
          preserveAspectRatio="xMidYMax slice": uniform scale, anchored to
          bottom-center, crops overflow. SVG ground rect (y=295) blends into the
          div below it as a fallback but no longer needs to be precisely sized. */}
      {isMobile ? (

        // ----- MOBILE landscape -----
        // viewBox 800x400. height: 28vh. bottom: 0 (overlaps ground div).
        // Ground line: y=320. All content shifted +25 from y=295 baseline.
        // Trees shifted -16 total from original (-41+25). Far peaks at y=243.
        <svg className="absolute bottom-0 w-full" viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMax slice" style={{ height: '28vh' }}>

          {/* Far mountains — interior y values: original -30 then +25 = net -5 */}
          <path d="M0,349 L35,313 L70,331 L105,289 L140,316 L175,270 L209,305 L244,255 L279,297 L314,248 L349,293 L383,243 L418,243 L453,293 L488,248 L522,297 L557,255 L592,305 L627,270 L662,316 L697,289 L732,331 L766,313 L800,349 L800,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

          {/* Near mountains — valleys at y=320, peaks unchanged */}
          <path d="M0,320 L50,320 L100,320 L150,320 L200,320 L250,288 L300,320 L350,276 L400,320 L450,272 L500,320 L550,277 L600,320 L650,291 L700,320 L750,320 L800,320 L800,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Cluster 1 — left edge */}
          <path d="M55,302 L52,320 L58,320 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M68,294 L64,320 L72,320 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M60,286 L56,320 L65,320 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M74,278 L69,320 L80,320 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Lone trees 1–2 */}
          <path d="M136,300 L134,320 L139,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M161,304 L159,320 L163,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 2 */}
          <path d="M225,298 L222,320 L228,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M236,288 L232,320 L241,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M230,280 L225,320 L236,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M243,272 L236,320 L249,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 2–3 */}
          <path d="M304,296 L300,320 L308,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M328,302 L325,320 L331,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 3 — center */}
          <path d="M392,296 L388,320 L395,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path d="M410,286 L406,320 L415,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M398,276 L392,320 L404,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
          <path d="M404,272 L398,320 L411,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

          {/* Lone trees 3–4 */}
          <path d="M472,296 L469,320 L476,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M496,302 L494,320 L499,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 4 */}
          <path d="M559,298 L556,320 L562,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M571,288 L567,320 L576,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M565,280 L560,320 L571,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M578,272 L571,320 L584,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 4–5 */}
          <path d="M639,300 L637,320 L642,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M666,304 L664,320 L668,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 5 — right edge */}
          <path d="M729,302 L727,320 L732,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M740,294 L737,320 L744,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M734,286 L730,320 L739,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M746,278 L741,320 L752,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          <rect x="0" y="320" width="800" height="80" fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
        </svg>

      ) : (

        // ----- DESKTOP landscape -----
        // viewBox 1600x400. height: 28vh. bottom: 0 (overlaps ground div).
        // Ground line: y=320. All content shifted +25 from y=295 baseline.
        // Trees shifted -16 total from original (-41+25). Far peaks at y=243.
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1600 400"
          preserveAspectRatio="xMidYMax slice" style={{ height: '28vh' }}>

          {/* Far mountains — interior y values: original -30 then +25 = net -5 */}
          <path d="M0,349 L70,313 L139,331 L209,289 L278,316 L348,270 L417,305 L487,255 L557,297 L626,248 L696,293 L765,243 L835,243 L904,293 L974,248 L1043,297 L1113,255 L1183,305 L1252,270 L1322,316 L1391,289 L1461,331 L1530,313 L1600,349 L1600,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

          {/* Near mountains — valleys at y=320, peaks unchanged */}
          <path d="M0,320 L100,320 L200,320 L300,320 L400,320 L500,280 L600,320 L700,265 L800,320 L900,262 L1000,320 L1100,265 L1200,320 L1300,278 L1400,320 L1500,320 L1600,320 L1600,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Trees — base at y=320, all y +25 from previous (net -16 from original) */}

          {/* Cluster 1 — left edge */}
          <path d="M110,309 L105,320 L115,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M135,304 L128,320 L142,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M120,300 L111,320 L129,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M148,295 L136,320 L160,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Lone trees 1–2 */}
          <path d="M272,308 L266,320 L278,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M322,310 L317,320 L327,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 2 */}
          <path d="M450,307 L444,320 L456,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M472,301 L463,320 L481,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M460,296 L449,320 L471,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M485,292 L472,320 L498,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 2–3 */}
          <path d="M608,306 L602,320 L614,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M656,309 L651,320 L661,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 3 — center */}
          <path d="M783,306 L777,320 L789,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path d="M820,300 L811,320 L829,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M795,294 L783,320 L807,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
          <path d="M808,292 L795,320 L821,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

          {/* Lone trees 3–4 */}
          <path d="M944,306 L938,320 L950,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M992,309 L987,320 L997,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 4 */}
          <path d="M1118,307 L1112,320 L1124,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M1142,301 L1133,320 L1151,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M1130,296 L1119,320 L1141,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M1155,292 L1142,320 L1168,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 4–5 */}
          <path d="M1278,308 L1272,320 L1284,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M1332,310 L1327,320 L1337,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 5 — right edge */}
          <path d="M1458,309 L1453,320 L1463,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M1480,304 L1473,320 L1487,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M1468,300 L1459,320 L1477,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M1492,295 L1480,320 L1504,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          <rect x="0" y="320" width="1600" height="80" fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
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
