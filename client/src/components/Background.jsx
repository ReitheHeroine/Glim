// -----------------------------------------------------------------------------
// Title:       Background.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-30
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
      id: i, x: Math.random() * 100, y: Math.random() * 88,
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
      <div className="absolute" style={{
        left: "15%", top: "55%", width: "50%", height: "25%",
        borderRadius: "50%",
        background: `radial-gradient(ellipse, hsla(${h2}, ${s}%, 45%, 0.10) 0%, hsla(${h2}, ${s}%, 35%, 0.03) 50%, transparent 70%)`,
        animation: "nebulaFloat2 28s ease-in-out infinite",
        filter: "blur(40px)",
      }} />

      {/* ===== LANDSCAPE SILHOUETTE ===== */}
      {/* Two independent SVGs: mobile and desktop can be tweaked separately.
          preserveAspectRatio="xMidYMax slice": uniform scale, anchored to
          bottom-center, crops overflow. */}
      {isMobile ? (

        // ----- MOBILE landscape -----
        // viewBox 800x400. height: 28vh. bottom: 0 (overlaps ground div).
        // Ground line: y=320. All content shifted +25 from y=295 baseline.
        // Trees shifted -16 total from original (-41+25). Far peaks at y=243.
        <svg className="absolute bottom-0 w-full" viewBox="0 200 800 200"
          preserveAspectRatio="xMidYMax slice" style={{ height: '200px' }}>

          {/* Far mountains — interior y values: original -30 then +25 = net -5 */}
          <path d="M0,349 L35,313 L70,331 L105,289 L140,316 L175,270 L209,305 L244,255 L279,297 L314,248 L349,293 L400,243 L453,293 L488,248 L522,297 L557,255 L592,305 L627,270 L662,316 L697,289 L732,331 L766,313 L800,349 L800,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

          {/* Near mountains — valleys at y=320, peaks unchanged */}
          <path d="M0,320 L50,320 L100,320 L150,320 L200,320 L250,288 L300,320 L350,276 L400,320 L450,272 L500,320 L550,277 L600,320 L650,291 L700,320 L750,320 L800,320 L800,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Cluster 1 — left edge */}
          <path d="M55,293 L50.5,320 L59.5,320 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M68,281 L62,320 L74,320 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M60,269 L54,320 L67.5,320 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M74,257 L66.5,320 L83,320 Z"  fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Lone trees 1–2 */}
          <path d="M136,290 L133,320 L140.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M161,296 L158,320 L164,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 2 */}
          <path d="M225,287 L220.5,320 L229.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M236,272 L230,320 L243.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M230,260 L222.5,320 L239,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M243,248 L232.5,320 L252,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 2–3 */}
          <path d="M304,284 L298,320 L310,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M328,293 L323.5,320 L332.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 3 — center */}
          <path d="M392,284 L386,320 L396.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path d="M410,269 L404,320 L417.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M398,254 L389,320 L407,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
          <path d="M404,248 L395,320 L414.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

          {/* Lone trees 3–4 */}
          <path d="M472,284 L467.5,320 L478,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M496,293 L493,320 L500.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 4 */}
          <path d="M559,287 L554.5,320 L563.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M571,272 L565,320 L578.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M565,260 L557.5,320 L574,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M578,248 L567.5,320 L587,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees 4–5 */}
          <path d="M639,290 L636,320 L643.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M666,296 L663,320 L669,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 5 — right edge */}
          <path d="M729,293 L726,320 L733.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M740,281 L735.5,320 L746,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M734,269 L728,320 L741.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M746,257 L738.5,320 L755,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

        </svg>

      ) : (

        // ----- DESKTOP landscape -----
        // viewBox 3200x400. Fixed 3200px wide, 300px tall, centered with translateX(-50%).
        // Parent overflow:hidden crops the edges; nothing moves on window resize.
        // Existing content shifted +800 (original x=0..1600 → x=800..2400).
        // Left/right extensions (x=0..800 and x=2400..3200) taper toward edges.
        // Ground line: y=320. Far peaks at y=243 (center). Mobile SVG unchanged.
        <svg className="absolute bottom-0" viewBox="0 0 3200 400"
          preserveAspectRatio="xMidYMax slice" style={{
            width: '3200px',
            height: '300px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>

          {/* Far mountains — existing content shifted +800; extensions taper lower at edges */}
          <path d="M0,348 L90,318 L175,330 L260,306 L350,322 L440,294 L520,316 L610,309 L700,324 L800,349 L870,313 L939,331 L1009,289 L1078,316 L1148,270 L1217,305 L1287,255 L1357,297 L1426,248 L1496,293 L1600,243 L1704,293 L1774,248 L1843,297 L1913,255 L1983,305 L2052,270 L2122,316 L2191,289 L2261,331 L2330,313 L2400,349 L2490,319 L2580,331 L2670,312 L2760,327 L2850,319 L2940,334 L3030,322 L3200,350 L3200,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

          {/* Near mountains — existing content shifted +800; extensions at y=290-315 range */}
          <path d="M0,320 L100,320 L200,307 L300,320 L400,313 L500,320 L600,298 L700,320 L800,320 L900,320 L1000,320 L1100,320 L1200,320 L1300,280 L1400,320 L1500,265 L1600,320 L1700,262 L1800,320 L1900,265 L2000,320 L2100,278 L2200,320 L2300,320 L2400,320 L2500,320 L2600,305 L2700,320 L2800,310 L2900,320 L3000,316 L3100,320 L3200,320 L3200,400 L0,400 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Trees — existing content shifted +800 */}

          {/* Cluster 1 (x≈910-960) */}
          <path d="M910,303.5 L902.5,320 L917.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M935,296 L924.5,320 L945.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M920,290 L906.5,320 L933.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M948,282.5 L930,320 L966,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Lone trees (x≈1072, 1122) */}
          <path d="M1072,302 L1063,320 L1081,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M1122,305 L1114.5,320 L1129.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 2 (x≈1250-1285) */}
          <path d="M1250,300.5 L1241,320 L1259,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M1272,291.5 L1258.5,320 L1285.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M1260,284 L1243.5,320 L1276.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M1285,278 L1265.5,320 L1304.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees (x≈1408, 1456) */}
          <path d="M1408,299 L1399,320 L1417,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M1456,303.5 L1448.5,320 L1463.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 3 — center (x≈1583-1620) */}
          <path d="M1583,299 L1574,320 L1592,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path d="M1620,290 L1606.5,320 L1633.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M1595,281 L1577,320 L1613,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.95)`} />
          <path d="M1608,278 L1588.5,320 L1627.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 1.00)`} />

          {/* Lone trees (x≈1744, 1792) */}
          <path d="M1744,299 L1735,320 L1753,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M1792,303.5 L1784.5,320 L1799.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />

          {/* Cluster 4 (x≈1918-1955) */}
          <path d="M1918,300.5 L1909,320 L1927,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.70)`} />
          <path d="M1942,291.5 L1928.5,320 L1955.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.80)`} />
          <path d="M1930,284 L1913.5,320 L1946.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path d="M1955,278 L1935.5,320 L1974.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.90)`} />

          {/* Lone trees (x≈2078, 2132) */}
          <path d="M2078,302 L2069,320 L2087,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M2132,305 L2124.5,320 L2139.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />

          {/* Cluster 5 (x≈2258-2292) */}
          <path d="M2258,303.5 L2250.5,320 L2265.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M2280,296 L2269.5,320 L2290.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.55)`} />
          <path d="M2268,290 L2254.5,320 L2281.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.60)`} />
          <path d="M2292,282.5 L2274,320 L2310,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.65)`} />

          {/* Left extension trees (x=0..800) — smaller, more transparent */}

          {/* Cluster A (x≈110-155) */}
          <path d="M110,306.5 L104,320 L116,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />
          <path d="M135,297.5 L126,320 L144,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.45)`} />
          <path d="M122,288.5 L111.5,320 L134,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M148,302 L140.5,320 L155.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.38)`} />

          {/* Lone trees (x≈275, 380) */}
          <path d="M275,303.5 L269,320 L281,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.38)`} />
          <path d="M380,308 L375.5,320 L384.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.35)`} />

          {/* Cluster B (x≈535-565) */}
          <path d="M535,302 L529,320 L541,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.42)`} />
          <path d="M558,293 L547.5,320 L568.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.48)`} />
          <path d="M546,284 L534,320 L559.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.52)`} />

          {/* Lone trees (x≈680, 745) */}
          <path d="M680,305 L674,320 L686,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />
          <path d="M745,299 L739,320 L751,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.37)`} />

          {/* Right extension trees (x=2400..3200) — smaller, more transparent */}

          {/* Cluster C (x≈2490-2515) */}
          <path d="M2490,305 L2484,320 L2496,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.42)`} />
          <path d="M2512,296 L2503,320 L2521,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.48)`} />
          <path d="M2500,287 L2488,320 L2512,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.52)`} />

          {/* Lone trees (x≈2630, 2730) */}
          <path d="M2630,306.5 L2624,320 L2636,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.36)`} />
          <path d="M2730,302 L2724,320 L2736,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.39)`} />

          {/* Cluster D (x≈2862-2910) */}
          <path d="M2862,303.5 L2854.5,320 L2869.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.40)`} />
          <path d="M2885,293 L2874.5,320 L2895.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.46)`} />
          <path d="M2873,284 L2861,320 L2886.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.50)`} />
          <path d="M2905,302 L2897.5,320 L2912.5,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.38)`} />

          {/* Lone trees (x≈3050, 3130) */}
          <path d="M3050,305 L3044,320 L3056,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.37)`} />
          <path d="M3130,300.5 L3124,320 L3142,320 Z" fill={`hsla(${h}, ${s - 15}%, 5%, 0.35)`} />

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
