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
      {isMobile ? (
        /* -- Mobile: 800-unit canvas, trees scaled wide for narrow screens -- */
        <svg className="absolute bottom-0 w-full" viewBox="0 0 800 200" preserveAspectRatio="none"
          style={{ height: "34%" }}>
          {/* Far mountains */}
          <path d="M0,90 L80,80 L140,120 L220,60 L300,110 L380,70 L440,100 L520,50 L600,90 L680,65 L750,100 L800,80 L800,200 L0,200 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />
          {/* Near mountains */}
          <path d="M0,120 L60,120 L120,145 L200,95 L280,130 L360,100 L420,140 L500,110 L580,135 L660,105 L740,130 L800,115 L800,200 L0,200 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Tree line -- left cluster */}
          <path transform="translate(29,175) scale(1.5,0.65) translate(-29,-175)"
            d="M28,175 L28,165 L18,165 L23,155 L15,155 L23,143 L17,143 L30,125 L43,143 L37,143 L45,155 L37,155 L42,165 L32,165 L32,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(60,175) scale(1.5,0.65) translate(-60,-175)"
            d="M58,175 L58,163 L48,163 L53,152 L45,152 L52,140 L46,140 L53,128 L47,128 L60,108 L73,128 L67,128 L74,140 L68,140 L75,152 L67,152 L72,163 L62,163 L62,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(97,175) scale(1.5,0.65) translate(-97,-175)"
            d="M95,175 L95,166 L87,166 L91,157 L85,157 L97,142 L109,157 L103,157 L107,166 L99,166 L99,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(125,175) scale(1.5,0.65) translate(-125,-175)"
            d="M122,175 L122,164 L114,164 L118,154 L112,154 L120,140 L114,140 L125,122 L136,140 L130,140 L138,154 L132,154 L136,164 L128,164 L128,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />

          {/* Tree line -- right cluster */}
          <path transform="translate(682,175) scale(1.5,0.65) translate(-682,-175)"
            d="M680,175 L680,163 L670,163 L675,152 L667,152 L674,140 L668,140 L675,128 L669,128 L682,108 L695,128 L689,128 L696,140 L690,140 L697,152 L689,152 L694,163 L684,163 L684,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(713,175) scale(1.5,0.65) translate(-713,-175)"
            d="M710,175 L710,164 L702,164 L706,154 L700,154 L708,140 L702,140 L713,122 L724,140 L718,140 L726,154 L720,154 L724,164 L716,164 L716,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(743,175) scale(1.5,0.65) translate(-743,-175)"
            d="M740,175 L740,166 L733,166 L737,157 L731,157 L743,142 L755,157 L749,157 L753,166 L746,166 L746,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(773,175) scale(1.5,0.65) translate(-773,-175)"
            d="M770,175 L770,165 L762,165 L766,155 L760,155 L768,142 L762,142 L773,125 L784,142 L778,142 L786,155 L780,155 L784,165 L776,165 L776,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />

          {/* Scattered single pines */}
          <path transform="translate(195,175) scale(1.5,0.65) translate(-195,-175)"
            d="M192,175 L192,166 L185,166 L189,157 L183,157 L195,142 L207,157 L201,157 L205,166 L198,166 L198,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path transform="translate(313,175) scale(1.5,0.65) translate(-313,-175)"
            d="M310,175 L310,165 L303,165 L307,155 L301,155 L308,143 L302,143 L313,126 L324,143 L318,143 L325,155 L319,155 L323,165 L316,165 L316,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path transform="translate(453,175) scale(1.5,0.65) translate(-453,-175)"
            d="M450,175 L450,167 L445,167 L453,155 L461,167 L456,167 L456,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.7)`} />
          <path transform="translate(568,175) scale(1.5,0.65) translate(-568,-175)"
            d="M565,175 L565,166 L558,166 L562,157 L556,157 L568,142 L580,157 L574,157 L578,166 L571,166 L571,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.8)`} />

          {/* Ground */}
          <path d="M0,165 Q200,160 400,165 Q600,170 800,162 L800,200 L0,200 Z"
            fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
        </svg>
      ) : (
        /* -- Desktop: 1600-unit canvas, same style extended across wider screen -- */
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1600 200" preserveAspectRatio="none"
          style={{ height: "34%" }}>
          {/* Far mountains -- continuous range across full width */}
          <path d="M0,90 L80,80 L140,120 L220,60 L300,110 L380,70 L440,100 L520,50 L600,90 L680,65 L750,100 L800,80 L870,95 L940,65 L1020,85 L1100,55 L1180,80 L1260,70 L1340,95 L1420,60 L1500,85 L1560,75 L1600,90 L1600,200 L0,200 Z"
            fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />
          {/* Near mountains */}
          <path d="M0,120 L60,120 L120,145 L200,95 L280,130 L360,100 L420,140 L500,110 L580,135 L660,105 L740,130 L800,115 L860,140 L940,110 L1020,135 L1100,100 L1180,130 L1260,115 L1340,140 L1420,105 L1500,125 L1560,140 L1600,120 L1600,200 L0,200 Z"
            fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

          {/* Tree line -- left cluster (same positions as mobile) */}
          <path transform="translate(29,175) scale(1.5,0.65) translate(-29,-175)"
            d="M28,175 L28,165 L18,165 L23,155 L15,155 L23,143 L17,143 L30,125 L43,143 L37,143 L45,155 L37,155 L42,165 L32,165 L32,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(60,175) scale(1.5,0.65) translate(-60,-175)"
            d="M58,175 L58,163 L48,163 L53,152 L45,152 L52,140 L46,140 L53,128 L47,128 L60,108 L73,128 L67,128 L74,140 L68,140 L75,152 L67,152 L72,163 L62,163 L62,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(97,175) scale(1.5,0.65) translate(-97,-175)"
            d="M95,175 L95,166 L87,166 L91,157 L85,157 L97,142 L109,157 L103,157 L107,166 L99,166 L99,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(125,175) scale(1.5,0.65) translate(-125,-175)"
            d="M122,175 L122,164 L114,164 L118,154 L112,154 L120,140 L114,140 L125,122 L136,140 L130,140 L138,154 L132,154 L136,164 L128,164 L128,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />

          {/* Tree line -- right cluster (mirrored at right edge of 1600-unit canvas) */}
          <path transform="translate(1482,175) scale(1.5,0.65) translate(-1482,-175)"
            d="M1480,175 L1480,163 L1470,163 L1475,152 L1467,152 L1474,140 L1468,140 L1475,128 L1469,128 L1482,108 L1495,128 L1489,128 L1496,140 L1490,140 L1497,152 L1489,152 L1494,163 L1484,163 L1484,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(1513,175) scale(1.5,0.65) translate(-1513,-175)"
            d="M1510,175 L1510,164 L1502,164 L1506,154 L1500,154 L1508,140 L1502,140 L1513,122 L1524,140 L1518,140 L1526,154 L1520,154 L1524,164 L1516,164 L1516,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(1543,175) scale(1.5,0.65) translate(-1543,-175)"
            d="M1540,175 L1540,166 L1533,166 L1537,157 L1531,157 L1543,142 L1555,157 L1549,157 L1553,166 L1546,166 L1546,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
          <path transform="translate(1573,175) scale(1.5,0.65) translate(-1573,-175)"
            d="M1570,175 L1570,165 L1562,165 L1566,155 L1560,155 L1568,142 L1562,142 L1573,125 L1584,142 L1578,142 L1586,155 L1580,155 L1584,165 L1576,165 L1576,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />

          {/* Scattered single pines -- left half (same as mobile) */}
          <path transform="translate(195,175) scale(1.5,0.65) translate(-195,-175)"
            d="M192,175 L192,166 L185,166 L189,157 L183,157 L195,142 L207,157 L201,157 L205,166 L198,166 L198,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path transform="translate(313,175) scale(1.5,0.65) translate(-313,-175)"
            d="M310,175 L310,165 L303,165 L307,155 L301,155 L308,143 L302,143 L313,126 L324,143 L318,143 L325,155 L319,155 L323,165 L316,165 L316,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path transform="translate(453,175) scale(1.5,0.65) translate(-453,-175)"
            d="M450,175 L450,167 L445,167 L453,155 L461,167 L456,167 L456,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.7)`} />
          <path transform="translate(568,175) scale(1.5,0.65) translate(-568,-175)"
            d="M565,175 L565,166 L558,166 L562,157 L556,157 L568,142 L580,157 L574,157 L578,166 L571,166 L571,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.8)`} />

          {/* Scattered single pines -- right half (mirrored positions: x + 800) */}
          <path transform="translate(995,175) scale(1.5,0.65) translate(-995,-175)"
            d="M992,175 L992,166 L985,166 L989,157 L983,157 L995,142 L1007,157 L1001,157 L1005,166 L998,166 L998,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
          <path transform="translate(1113,175) scale(1.5,0.65) translate(-1113,-175)"
            d="M1110,175 L1110,165 L1103,165 L1107,155 L1101,155 L1108,143 L1102,143 L1113,126 L1124,143 L1118,143 L1125,155 L1119,155 L1123,165 L1116,165 L1116,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
          <path transform="translate(1253,175) scale(1.5,0.65) translate(-1253,-175)"
            d="M1250,175 L1250,167 L1245,167 L1253,155 L1261,167 L1256,167 L1256,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.7)`} />
          <path transform="translate(1368,175) scale(1.5,0.65) translate(-1368,-175)"
            d="M1365,175 L1365,166 L1358,166 L1362,157 L1356,157 L1368,142 L1380,157 L1374,157 L1378,166 L1371,166 L1371,175 Z"
            fill={`hsla(${h}, ${s - 15}%, 5%, 0.8)`} />

          {/* Ground */}
          <path d="M0,165 Q400,160 800,165 Q1200,170 1600,162 L1600,200 L0,200 Z"
            fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
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
