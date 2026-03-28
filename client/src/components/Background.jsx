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
      {/* viewBox 1600x400 panorama. preserveAspectRatio="xMidYMax slice" scales
          uniformly anchored to bottom-center. Mobile sees a center crop (~390/1600
          units); desktop sees most of the canvas. No distortion on either.
          height: 28vh scales with viewport so proportion stays consistent.
          Main peaks and feature trees are in the center 60% (x 320-1280).
          Edge trees (x<320, x>1280) are intentionally expendable -- they crop
          gracefully on narrow screens. No transform hacks on tree paths. */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1600 400"
        preserveAspectRatio="xMidYMax slice" style={{ height: '28vh' }}>

        {/* Far mountains -- tallest peaks in center 60%, flatten toward edges */}
        <path d="M0,220 L100,200 L220,185 L340,165 L440,140 L540,108 L640,78 L720,55 L800,42 L880,58 L960,80 L1060,108 L1160,138 L1260,162 L1380,182 L1500,198 L1600,212 L1600,400 L0,400 Z"
          fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />

        {/* Near mountains -- second layer, lower than far */}
        <path d="M0,285 L120,268 L260,252 L380,232 L460,202 L560,175 L660,188 L760,172 L860,182 L960,168 L1060,180 L1160,198 L1260,222 L1380,248 L1500,264 L1600,278 L1600,400 L0,400 Z"
          fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

        {/* ---- Trees ----
             All paths written natively for this 400-tall viewBox.
             Ground at y≈335; trunks extend to y=350 (buried by ground fill).
             3-tier pine silhouette: trunk + bottom tier + mid tier + top spike.
             Tall trees: top ~y=205  Medium: top ~y=240  Short: top ~y=278 */}

        {/* EXPENDABLE LEFT EDGE (x < 320) */}
        {/* Short pine x=65 */}
        <path d="M62,350 L62,340 L54,340 L58,326 L50,326 L65,278 L80,326 L72,326 L76,340 L68,340 L68,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
        {/* Medium pine x=160 */}
        <path d="M156,350 L156,335 L146,335 L152,318 L142,318 L148,298 L138,298 L160,240 L182,298 L172,298 L178,318 L168,318 L174,335 L164,335 L164,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.8)`} />
        {/* Short pine x=255 */}
        <path d="M252,350 L252,340 L244,340 L248,326 L240,326 L255,278 L270,326 L262,326 L266,340 L258,340 L258,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />

        {/* CENTER 60% FEATURE TREES (x 320-1280) -- these are important, never cropped on mobile */}
        {/* Tall pine x=390 */}
        <path d="M386,350 L386,335 L374,335 L381,316 L370,316 L378,295 L366,295 L376,272 L390,205 L404,272 L414,295 L402,295 L410,316 L399,316 L406,335 L394,335 L394,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.9)`} />
        {/* Medium pine x=510 */}
        <path d="M506,350 L506,335 L496,335 L502,318 L492,318 L498,298 L488,298 L510,240 L532,298 L522,298 L528,318 L518,318 L524,335 L514,335 L514,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Tall pine x=640 */}
        <path d="M636,350 L636,335 L624,335 L631,316 L620,316 L628,295 L616,295 L626,272 L640,205 L654,272 L664,295 L652,295 L660,316 L649,316 L656,335 L644,335 L644,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Tall pine x=780 -- center focal */}
        <path d="M776,350 L776,335 L764,335 L771,316 L760,316 L768,295 L756,295 L766,272 L780,205 L794,272 L804,295 L792,295 L800,316 L789,316 L796,335 L784,335 L784,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Short pine x=870 */}
        <path d="M867,350 L867,340 L859,340 L863,326 L855,326 L870,278 L885,326 L877,326 L881,340 L873,340 L873,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
        {/* Tall pine x=960 */}
        <path d="M956,350 L956,335 L944,335 L951,316 L940,316 L948,295 L936,295 L946,272 L960,205 L974,272 L984,295 L972,295 L980,316 L969,316 L976,335 L964,335 L964,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Medium pine x=1085 */}
        <path d="M1081,350 L1081,335 L1071,335 L1077,318 L1067,318 L1073,298 L1063,298 L1085,240 L1107,298 L1097,298 L1103,318 L1093,318 L1099,335 L1089,335 L1089,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Tall pine x=1210 */}
        <path d="M1206,350 L1206,335 L1194,335 L1201,316 L1190,316 L1198,295 L1186,295 L1196,272 L1210,205 L1224,272 L1234,295 L1222,295 L1230,316 L1219,316 L1226,335 L1214,335 L1214,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.9)`} />

        {/* EXPENDABLE RIGHT EDGE (x > 1280) */}
        {/* Short pine x=1345 */}
        <path d="M1342,350 L1342,340 L1334,340 L1338,326 L1330,326 L1345,278 L1360,326 L1352,326 L1356,340 L1348,340 L1348,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
        {/* Medium pine x=1445 */}
        <path d="M1441,350 L1441,335 L1431,335 L1437,318 L1427,318 L1433,298 L1423,298 L1445,240 L1467,298 L1457,298 L1463,318 L1453,318 L1459,335 L1449,335 L1449,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.8)`} />
        {/* Short pine x=1535 */}
        <path d="M1532,350 L1532,340 L1524,340 L1528,326 L1520,326 L1535,278 L1550,326 L1542,326 L1546,340 L1538,340 L1538,350 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.7)`} />

        {/* Ground -- covers tree trunks, matches safe-area fill color */}
        <path d="M0,335 Q400,325 800,335 Q1200,345 1600,330 L1600,400 L0,400 Z"
          fill={`hsla(${h}, ${s - 15}%, 4%, 1)`} />
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
