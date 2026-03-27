// title: DesktopPet.jsx
// project: Glim
// author: Reina Hastings
// contact: reinahastings13@gmail.com
// date created: 2026-03-25
// last modified: 2026-03-25
//
// purpose:
//   Main Glim application component and all sub-components. Contains the
//   color system, Background, AmbientBugs, SpeechBubble, OwlMoth,
//   PersistentReminder, and DesktopPet components. Extracted from glim.html
//   during Vite migration.
//
// inputs:
//   - messages.js (all message pool arrays)
//   - storage.js (window.storage polyfill, side-effect import)
//
// outputs:
//   - Default export: DesktopPet component

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MESSAGES, MOVE_REMINDERS, EYES_REMINDERS, MOVE_DONE_RESPONSES,
  EYES_DONE_RESPONSES, MINDFULNESS, DISCOVERIES, JOURNAL_PROMPTS,
  JOURNAL_NUDGES, SCIENCE_FACTS
} from './messages.js';
import './storage.js';

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return "lateNight";
  if (h < 9) return "earlyMorning";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "lateNight";
}
function getColors() {
  const h = new Date().getHours();
  if (h < 6)  return { hue: 310, sat: 65 };
  if (h < 9)  return { hue: 150, sat: 60 };
  if (h < 12) return { hue: 175, sat: 65 };
  if (h < 17) return { hue: 220, sat: 65 };
  if (h < 21) return { hue: 270, sat: 60 };
  return { hue: 310, sat: 65 };
}
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ============================================================
//  Background -- Glim's world
// ============================================================
function Background({ hue, sat, mood }) {
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
      <svg className="absolute bottom-0 w-full" viewBox="0 0 800 200" preserveAspectRatio="none"
        style={{ height: "34%" }}>
        {/* Far mountains */}
        <path d="M0,90 L80,80 L140,120 L220,60 L300,110 L380,70 L440,100 L520,50 L600,90 L680,65 L750,100 L800,80 L800,200 L0,200 Z"
          fill={`hsla(${h}, ${s - 20}%, 12%, 0.8)`} />
        {/* Near mountains */}
        <path d="M0,120 L60,120 L120,145 L200,95 L280,130 L360,100 L420,140 L500,110 L580,135 L660,105 L740,130 L800,115 L800,200 L0,200 Z"
          fill={`hsla(${h}, ${s - 15}%, 8%, 0.9)`} />

        {/* Tree line -- left cluster (pines, grounded) */}
        {/* Each tree scaled 1.5x wider from its center so they read on narrow phone screens */}
        {/* Pine 1 - medium */}
        <path transform="translate(29,175) scale(1.5,0.65) translate(-29,-175)"
          d="M28,175 L28,165 L18,165 L23,155 L15,155 L23,143 L17,143 L30,125 L43,143 L37,143 L45,155 L37,155 L42,165 L32,165 L32,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Pine 2 - tall */}
        <path transform="translate(60,175) scale(1.5,0.65) translate(-60,-175)"
          d="M58,175 L58,163 L48,163 L53,152 L45,152 L52,140 L46,140 L53,128 L47,128 L60,108 L73,128 L67,128 L74,140 L68,140 L75,152 L67,152 L72,163 L62,163 L62,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Pine 3 - short */}
        <path transform="translate(97,175) scale(1.5,0.65) translate(-97,-175)"
          d="M95,175 L95,166 L87,166 L91,157 L85,157 L97,142 L109,157 L103,157 L107,166 L99,166 L99,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Pine 4 - medium */}
        <path transform="translate(125,175) scale(1.5,0.65) translate(-125,-175)"
          d="M122,175 L122,164 L114,164 L118,154 L112,154 L120,140 L114,140 L125,122 L136,140 L130,140 L138,154 L132,154 L136,164 L128,164 L128,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />

        {/* Tree line -- right cluster */}
        {/* Pine 5 - tall */}
        <path transform="translate(682,175) scale(1.5,0.65) translate(-682,-175)"
          d="M680,175 L680,163 L670,163 L675,152 L667,152 L674,140 L668,140 L675,128 L669,128 L682,108 L695,128 L689,128 L696,140 L690,140 L697,152 L689,152 L694,163 L684,163 L684,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Pine 6 - medium */}
        <path transform="translate(713,175) scale(1.5,0.65) translate(-713,-175)"
          d="M710,175 L710,164 L702,164 L706,154 L700,154 L708,140 L702,140 L713,122 L724,140 L718,140 L726,154 L720,154 L724,164 L716,164 L716,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Pine 7 - short */}
        <path transform="translate(743,175) scale(1.5,0.65) translate(-743,-175)"
          d="M740,175 L740,166 L733,166 L737,157 L731,157 L743,142 L755,157 L749,157 L753,166 L746,166 L746,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />
        {/* Pine 8 - medium */}
        <path transform="translate(773,175) scale(1.5,0.65) translate(-773,-175)"
          d="M770,175 L770,165 L762,165 L766,155 L760,155 L768,142 L762,142 L773,125 L784,142 L778,142 L786,155 L780,155 L784,165 L776,165 L776,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 1)`} />

        {/* Scattered single pines */}
        {/* Lone pine mid-left */}
        <path transform="translate(195,175) scale(1.5,0.65) translate(-195,-175)"
          d="M192,175 L192,166 L185,166 L189,157 L183,157 L195,142 L207,157 L201,157 L205,166 L198,166 L198,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.85)`} />
        {/* Tall pine center-left */}
        <path transform="translate(313,175) scale(1.5,0.65) translate(-313,-175)"
          d="M310,175 L310,165 L303,165 L307,155 L301,155 L308,143 L302,143 L313,126 L324,143 L318,143 L325,155 L319,155 L323,165 L316,165 L316,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.75)`} />
        {/* Small pine center */}
        <path transform="translate(453,175) scale(1.5,0.65) translate(-453,-175)"
          d="M450,175 L450,167 L445,167 L453,155 L461,167 L456,167 L456,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.7)`} />
        {/* Pine mid-right */}
        <path transform="translate(568,175) scale(1.5,0.65) translate(-568,-175)"
          d="M565,175 L565,166 L558,166 L562,157 L556,157 L568,142 L580,157 L574,157 L578,166 L571,166 L571,175 Z"
          fill={`hsla(${h}, ${s - 15}%, 5%, 0.8)`} />

        {/* Ground - starts high enough to cover any gap below tree trunks */}
        <path d="M0,165 Q200,160 400,165 Q600,170 800,162 L800,200 L0,200 Z"
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

// ============================================================
//  Ambient bugs -- little glowing critters that fly around
// ============================================================
function AmbientBugs({ hue, chasedBugId }) {
  const bugs = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      dur: Math.random() * 8 + 10,
      delay: Math.random() * 5,
      size: Math.random() * 2 + 3,
      // Each bug gets a unique flight path via different animation
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

// ============================================================
//  Speech bubble
// ============================================================
function SpeechBubble({ text, visible, isWellness }) {
  return (
    <div className="absolute left-1/2 transition-all duration-500 pointer-events-none select-none"
      style={{
        bottom: "100%", marginBottom: "10px", transform: "translateX(-50%)",
        opacity: visible ? 1 : 0, scale: visible ? "1" : "0.8", width: "max-content",
      }}>
      <div className="relative px-4 py-2 rounded-2xl text-center" style={{
        maxWidth: 560, width: "max-content", whiteSpace: "normal", lineHeight: 1.4,
        background: isWellness ? "rgba(100, 220, 180, 0.15)" : "rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
        border: isWellness ? "1px solid rgba(100, 220, 180, 0.3)" : "1px solid rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.9)", fontFamily: "'Courier New', monospace",
        fontSize: "13px", letterSpacing: "0.3px",
      }}>
        {isWellness && <span style={{ marginRight: 4, fontSize: 11, opacity: 0.7 }}>~</span>}
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

// ============================================================
//  The Creature
// ============================================================
function OwlMoth({ onClick, onDoubleClick,
  squeezed, hue, sat, mood, isHappy, isPuffed, isPurring, isBlinking,
  specialAnim, antennaPerk, wingTwitchSide, pupilOffset }) {

  const sleepy = mood === "lateNight" || specialAnim === "sleep";
  const h = hue, s = sat;
  const h2 = (h + 30) % 360, h3 = (h + 60) % 360;

  const isFlying = specialAnim === "flyAttempt";
  const isChasing = specialAnim === "chaseBug";
  const isSleeping = specialAnim === "sleep";
  const isSecret = specialAnim === "secret";

  // Pupil position from eye tracking
  const px = pupilOffset.x * 3.5;
  const py = pupilOffset.y * 2.5;

  // Eye sizes - squish to line for sleep/purr/blink
  const eyesClosed = isSleeping || isPurring || isBlinking;
  const eyeRx = sleepy ? 8 : isHappy ? 14 : isPuffed ? 14 : 12;
  const eyeRy = eyesClosed ? 1.5 : sleepy ? 8 : isHappy ? 14 : isPuffed ? 14 : 12;
  const pupilRy = eyesClosed ? 0 : sleepy ? 3 : isPuffed ? 8 : 7;

  // Body scale
  let bodyTransform = "scale(1,1)";
  let bodyAnim = "owlFloat 4s ease-in-out infinite";
  if (squeezed) { bodyTransform = "scale(1.12, 0.86)"; bodyAnim = "none"; }
  else if (isPuffed) { bodyTransform = "scale(1.18, 1.18)"; bodyAnim = "none"; }
  else if (isPurring) { bodyTransform = "scale(1.04, 0.97)"; bodyAnim = "purrRock 1.2s ease-in-out infinite"; }
  else if (isFlying) { bodyAnim = "flyAttempt 1.5s ease-in-out"; }
  else if (isChasing) { bodyAnim = "chaseBug 3s ease-in-out"; }
  else if (isSecret) { bodyAnim = "secretSpin 2s ease-in-out"; }
  else if (isHappy) { bodyAnim = "owlBounce 0.5s ease-in-out 3"; }

  return (
    <svg viewBox="0 0 220 240" width="360" height="390"
      onClick={onClick} onDoubleClick={onDoubleClick}
      className="cursor-pointer select-none"
      style={{
        filter: `drop-shadow(0 0 ${isPuffed ? 25 : isPurring ? 22 : 18}px hsla(${h}, ${s}%, 65%, ${isPuffed ? 0.7 : 0.5})) drop-shadow(0 0 40px hsla(${h}, ${s}%, 55%, 0.2))`,
        transition: "filter 0.5s ease",
      }}>
      <defs>
        <radialGradient id="bodyG" cx="50%" cy="42%" r="48%">
          <stop offset="0%" stopColor={`hsla(${h}, ${s}%, 82%, 0.95)`} />
          <stop offset="50%" stopColor={`hsla(${h}, ${s - 5}%, 65%, 0.8)`} />
          <stop offset="100%" stopColor={`hsla(${h}, ${s - 10}%, 48%, 0.6)`} />
        </radialGradient>
        <radialGradient id="glow" cx="50%" cy="38%" r="35%">
          <stop offset="0%" stopColor={`hsla(${h}, ${s + 10}%, 90%, 0.5)`} />
          <stop offset="100%" stopColor={`hsla(${h}, ${s}%, 80%, 0)`} />
        </radialGradient>
        <radialGradient id="belly" cx="50%" cy="55%" r="30%">
          <stop offset="0%" stopColor={`hsla(${h2}, ${s - 10}%, 88%, 0.6)`} />
          <stop offset="100%" stopColor={`hsla(${h2}, ${s - 10}%, 75%, 0)`} />
        </radialGradient>
        <radialGradient id="spec" cx="38%" cy="30%" r="22%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <g style={{
        transformOrigin: "110px 120px",
        transform: bodyTransform,
        transition: isPuffed || isPurring ? "transform 0.3s ease" : "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animation: bodyAnim,
      }}>
        {/* Tail */}
        <g style={{ animation: isPurring ? "tailPurr 0.8s ease-in-out infinite" : "tailCurl 3s ease-in-out infinite" }}>
          <path d="M110,185 Q115,200 125,208 Q140,218 148,210 Q155,200 145,195 Q135,192 132,198"
            stroke={`hsla(${h}, ${s - 5}%, 60%, 0.7)`} strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="132" cy="198" r="4" fill={`hsla(${h2}, ${s}%, 75%, 0.7)`}
            style={{ animation: "softPulse 2.5s ease-in-out infinite" }} />
        </g>

        {/* Wing-arms */}
        <g style={{
          transformOrigin: "70px 130px",
          animation: squeezed ? "wingFlapL 0.08s linear 8"
            : isFlying ? "wingFlapL 0.06s linear 25"
            : isHappy ? "wingFlapL 0.1s ease-in-out 12"
            : wingTwitchSide === "left" ? "wingTwitchL 0.3s ease-in-out"
            : "wingDriftL 4s ease-in-out infinite",
        }}>
          <ellipse cx="52" cy="125" rx="35" ry="22" fill={`hsla(${h}, ${s - 5}%, 62%, 0.55)`} transform="rotate(-10 52 125)" />
          <ellipse cx="52" cy="125" rx="35" ry="22" fill="url(#spec)" transform="rotate(-10 52 125)" opacity="0.3" />
          {/* Wing dots */}
          <circle cx="40" cy="120" r="2.5" fill={`hsla(${h2}, ${s}%, 80%, 0.4)`} />
          <circle cx="35" cy="127" r="1.8" fill={`hsla(${h3}, ${s}%, 78%, 0.3)`} />
          <circle cx="45" cy="130" r="2" fill={`hsla(${h2}, ${s}%, 75%, 0.35)`} />
          <circle cx="50" cy="118" r="3" fill={`hsla(${h3}, ${s}%, 80%, 0.25)`} />
          <circle cx="30" cy="124" r="1.5" fill={`hsla(${h2}, ${s}%, 82%, 0.3)`} />
        </g>
        <g style={{
          transformOrigin: "150px 130px",
          animation: squeezed ? "wingFlapR 0.08s linear 8"
            : isFlying ? "wingFlapR 0.06s linear 25"
            : isHappy ? "wingFlapR 0.1s ease-in-out 12"
            : wingTwitchSide === "right" ? "wingTwitchR 0.3s ease-in-out"
            : "wingDriftR 4s ease-in-out infinite",
        }}>
          <ellipse cx="168" cy="125" rx="35" ry="22" fill={`hsla(${h}, ${s - 5}%, 62%, 0.55)`} transform="rotate(10 168 125)" />
          <ellipse cx="168" cy="125" rx="35" ry="22" fill="url(#spec)" transform="rotate(10 168 125)" opacity="0.3" />
          {/* Wing dots */}
          <circle cx="180" cy="120" r="2.5" fill={`hsla(${h2}, ${s}%, 80%, 0.4)`} />
          <circle cx="185" cy="127" r="1.8" fill={`hsla(${h3}, ${s}%, 78%, 0.3)`} />
          <circle cx="175" cy="130" r="2" fill={`hsla(${h2}, ${s}%, 75%, 0.35)`} />
          <circle cx="170" cy="118" r="3" fill={`hsla(${h3}, ${s}%, 80%, 0.25)`} />
          <circle cx="190" cy="124" r="1.5" fill={`hsla(${h2}, ${s}%, 82%, 0.3)`} />
        </g>

        {/* Body */}
        <ellipse cx="110" cy="130" rx={isPuffed ? 52 : 48} ry={isPuffed ? 58 : 55} fill="url(#bodyG)"
          style={{ transition: "rx 0.3s ease, ry 0.3s ease" }} />
        <ellipse cx="110" cy="130" rx="48" ry="55" fill="url(#glow)" />
        <ellipse cx="110" cy="142" rx="28" ry="32" fill="url(#belly)" />

        {/* Body dots -- scattered like a fawn */}
        {/* Left side */}
        <circle cx="82" cy="115" r="2.5" fill={`hsla(${h2}, ${s}%, 82%, 0.35)`} />
        <circle cx="78" cy="128" r="1.8" fill={`hsla(${h3}, ${s}%, 80%, 0.25)`} />
        <circle cx="85" cy="138" r="2" fill={`hsla(${h2}, ${s}%, 78%, 0.3)`} />
        <circle cx="75" cy="142" r="1.5" fill={`hsla(${h3}, ${s}%, 82%, 0.2)`} />
        <circle cx="88" cy="122" r="1.5" fill={`hsla(${h2}, ${s}%, 85%, 0.2)`} />
        {/* Right side */}
        <circle cx="138" cy="115" r="2.5" fill={`hsla(${h2}, ${s}%, 82%, 0.35)`} />
        <circle cx="142" cy="128" r="1.8" fill={`hsla(${h3}, ${s}%, 80%, 0.25)`} />
        <circle cx="135" cy="138" r="2" fill={`hsla(${h2}, ${s}%, 78%, 0.3)`} />
        <circle cx="145" cy="142" r="1.5" fill={`hsla(${h3}, ${s}%, 82%, 0.2)`} />
        <circle cx="132" cy="122" r="1.5" fill={`hsla(${h2}, ${s}%, 85%, 0.2)`} />
        {/* Belly area */}
        <circle cx="102" cy="145" r="1.8" fill={`hsla(${h2}, ${s - 5}%, 88%, 0.25)`} />
        <circle cx="118" cy="143" r="2" fill={`hsla(${h3}, ${s}%, 85%, 0.2)`} />
        <circle cx="110" cy="155" r="1.5" fill={`hsla(${h2}, ${s - 5}%, 86%, 0.2)`} />
        <circle cx="105" cy="160" r="1.2" fill={`hsla(${h3}, ${s}%, 84%, 0.18)`} />
        <circle cx="115" cy="158" r="1.8" fill={`hsla(${h2}, ${s}%, 87%, 0.22)`} />
        {/* Upper body */}
        <circle cx="95" cy="108" r="1.5" fill={`hsla(${h3}, ${s}%, 83%, 0.2)`} />
        <circle cx="125" cy="108" r="1.5" fill={`hsla(${h3}, ${s}%, 83%, 0.2)`} />
        <circle cx="100" cy="168" r="1" fill={`hsla(${h2}, ${s}%, 85%, 0.15)`} />
        <circle cx="120" cy="166" r="1.2" fill={`hsla(${h3}, ${s}%, 84%, 0.15)`} />

        {/* Feet */}
        <ellipse cx="96" cy="182" rx="9" ry="5" fill={`hsla(${h}, ${s - 5}%, 70%, 0.7)`} />
        <ellipse cx="124" cy="182" rx="9" ry="5" fill={`hsla(${h}, ${s - 5}%, 70%, 0.7)`} />

        {/* Owl face disc */}
        <ellipse cx="110" cy="98" rx="32" ry="28" fill={`hsla(${h2}, ${s - 15}%, 88%, 0.35)`} />

        {/* Eyes with tracking */}
        <g>
          {/* Left eye */}
          <ellipse cx="97" cy="95" rx={eyeRx} ry={eyeRy} fill="rgba(255,255,255,0.95)"
            style={{ transition: "ry 0.25s ease, rx 0.3s ease" }} />
          {!eyesClosed && <circle cx={97 + px} cy={95 + py} r={pupilRy}
            fill={`hsl(${h + 40}, 40%, 15%)`}
            style={{ transition: "cx 0.1s ease, cy 0.1s ease, r 0.2s ease" }} />}
          {!eyesClosed && !isHappy && (
            <circle cx={99 + px * 0.3} cy={92 + py * 0.3} r="2.5" fill="rgba(255,255,255,0.9)" />
          )}

          {/* Right eye */}
          <ellipse cx="123" cy="95" rx={eyeRx} ry={eyeRy} fill="rgba(255,255,255,0.95)"
            style={{ transition: "ry 0.25s ease, rx 0.3s ease" }} />
          {!eyesClosed && <circle cx={123 + px} cy={95 + py} r={pupilRy}
            fill={`hsl(${h + 40}, 40%, 15%)`}
            style={{ transition: "cx 0.1s ease, cy 0.1s ease, r 0.2s ease" }} />}
          {!eyesClosed && !isHappy && (
            <circle cx={125 + px * 0.3} cy={92 + py * 0.3} r="2.5" fill="rgba(255,255,255,0.9)" />
          )}
        </g>

        {/* Zzz when sleeping */}
        {isSleeping && (
          <g style={{ animation: "zzzFloat 2s ease-in-out infinite" }}>
            <text x="145" y="75" fill={`hsla(${h}, ${s}%, 75%, 0.5)`} fontSize="14"
              fontFamily="'Courier New', monospace">z</text>
            <text x="155" y="60" fill={`hsla(${h}, ${s}%, 75%, 0.35)`} fontSize="11"
              fontFamily="'Courier New', monospace">z</text>
            <text x="162" y="48" fill={`hsla(${h}, ${s}%, 75%, 0.2)`} fontSize="9"
              fontFamily="'Courier New', monospace">z</text>
          </g>
        )}

        {/* Beak */}
        <path d={isHappy ? "M106,106 L110,112 L114,106" : "M108,105 L110,109 L112,105"}
          fill={`hsla(${h + 30}, ${s - 20}%, 65%, 0.8)`} style={{ transition: "d 0.3s ease" }} />

        {/* Blush */}
        <ellipse cx="85" cy="103" rx={isHappy || isPurring ? 8 : 6} ry={isHappy || isPurring ? 4 : 3}
          fill={`hsla(${h3}, 60%, 72%, ${isHappy || isPurring ? 0.5 : 0.3})`}
          style={{ transition: "all 0.3s ease" }} />
        <ellipse cx="135" cy="103" rx={isHappy || isPurring ? 8 : 6} ry={isHappy || isPurring ? 4 : 3}
          fill={`hsla(${h3}, 60%, 72%, ${isHappy || isPurring ? 0.5 : 0.3})`}
          style={{ transition: "all 0.3s ease" }} />

        {/* Antennae */}
        <g style={{
          animation: antennaPerk ? "antennaPerkL 0.4s ease-out" : "antennaL 3.5s ease-in-out infinite",
        }}>
          <path d="M98,75 Q92,55 88,42" stroke={`hsla(${h}, ${s}%, 70%, 0.6)`}
            strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="88" cy="42" r="6" fill={`hsla(${h2}, ${s + 5}%, 78%, 0.85)`}
            style={{ animation: "softPulse 2s ease-in-out infinite" }} />
          <circle cx="88" cy="42" r="9" fill={`hsla(${h2}, ${s}%, 80%, 0.15)`}
            style={{ animation: "softPulse 2s ease-in-out 0.3s infinite" }} />
        </g>
        <g style={{
          animation: antennaPerk ? "antennaPerkR 0.4s ease-out" : "antennaR 3.5s ease-in-out infinite",
        }}>
          <path d="M122,75 Q128,55 132,42" stroke={`hsla(${h}, ${s}%, 70%, 0.6)`}
            strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="132" cy="42" r="6" fill={`hsla(${h2}, ${s + 5}%, 78%, 0.85)`}
            style={{ animation: "softPulse 2s ease-in-out 0.5s infinite" }} />
          <circle cx="132" cy="42" r="9" fill={`hsla(${h2}, ${s}%, 80%, 0.15)`}
            style={{ animation: "softPulse 2s ease-in-out 0.8s infinite" }} />
        </g>
      </g>
    </svg>
  );
}

// ============================================================
//  Persistent Reminder
// ============================================================
function PersistentReminder({ text, type, onDismiss }) {
  const bg = type === "move" ? "rgba(255, 180, 100, 0.15)" : "rgba(130, 180, 255, 0.15)";
  const border = type === "move" ? "rgba(255, 180, 100, 0.35)" : "rgba(130, 180, 255, 0.35)";
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl" style={{
      background: bg, border: `1px solid ${border}`, backdropFilter: "blur(10px)",
      fontFamily: "'Courier New', monospace", fontSize: "13px", color: "rgba(255,255,255,0.9)",
      animation: "reminderPulse 3s ease-in-out infinite", maxWidth: 560,
    }}>
      <div className="flex-1" style={{ lineHeight: 1.4 }}>{text}</div>
      <button onClick={onDismiss} className="flex-shrink-0 px-3 py-1 rounded-xl cursor-pointer" style={{
        background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
        color: "rgba(255,255,255,0.9)", fontFamily: "'Courier New', monospace", fontSize: "12px",
        letterSpacing: "0.5px", transition: "all 0.2s ease",
      }}
        onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.25)"; }}
        onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.12)"; }}
      >done!</button>
    </div>
  );
}

// ============================================================
//  Main App
// ============================================================
function DesktopPet() {
  const [message, setMessage] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [isWellness, setIsWellness] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [squeezed, setSqueezed] = useState(false);
  const [mood, setMood] = useState(getTimeOfDay);
  const [colors, setColors] = useState(getColors);
  const [clickCount, setClickCount] = useState(0);
  const [moveReminder, setMoveReminder] = useState(null);
  const [eyesReminder, setEyesReminder] = useState(null);

  // ---- Personality state ----
  const [isPuffed, setIsPuffed] = useState(false);
  const [isPurring, setIsPurring] = useState(false);
  const [specialAnim, setSpecialAnim] = useState(null);
  const [antennaPerk, setAntennaPerk] = useState(false);
  const [wingTwitchSide, setWingTwitchSide] = useState(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [chasedBugId, setChasedBugId] = useState(null);
  const [currentMsgType, setCurrentMsgType] = useState(null);

  // ---- Drag state ----
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [isWandering, setIsWandering] = useState(false);
  const dragStartRef = useRef(null);
  const wanderTimerRef = useRef(null);
  const wanderDriftRef = useRef(null);
  const justDraggedRef = useRef(false);
  const dragVelocityRef = useRef([]);
  const shakeTimerRef = useRef(null);
  const [isShaken, setIsShaken] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // ---- Settings state ----
  const [showSettings, setShowSettings] = useState(false);
  const [wellnessInterval, setWellnessInterval] = useState(20);
  const [moveInterval, setMoveInterval] = useState(45);
  const [eyesInterval, setEyesInterval] = useState(20);

  // ---- Journal state ----
  const [showJournal, setShowJournal] = useState(false);
  const [journalView, setJournalView] = useState("write"); // "write" | "past"
  const [journalText, setJournalText] = useState("");
  const [journalPrompt, setJournalPrompt] = useState(() => pickRandom(JOURNAL_PROMPTS));
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalLoading, setJournalLoading] = useState(true);

  // ---- Refs ----
  const bubbleTimer = useRef(null);
  const idleTimer = useRef(null);
  const wellnessTimer = useRef(null);
  const happyTimer = useRef(null);
  const moveTimer = useRef(null);
  const eyesTimer = useRef(null);
  const lastWellnessRef = useRef("");
  const lastEncouragementRef = useRef("");
  const clickTimesRef = useRef([]);
  const lastInteractionRef = useRef(Date.now());
  const holdTimerRef = useRef(null);
  const creatureRef = useRef(null);
  const puffTimerRef = useRef(null);
  const specialTimerRef = useRef(null);
  const isSleepingRef = useRef(false);

  // ---- Time updates ----
  useEffect(() => {
    const iv = setInterval(() => { setMood(getTimeOfDay()); setColors(getColors()); }, 60000);
    return () => clearInterval(iv);
  }, []);

  // Keep sleep ref in sync
  useEffect(() => {
    isSleepingRef.current = specialAnim === "sleep";
  }, [specialAnim]);

  // ---- Journal: load/reload entries (called on mount and by sync service) ----
  const reloadJournal = useCallback(async () => {
    try {
      const result = await window.storage.get("glim-journal");
      if (result && result.value) {
        setJournalEntries(JSON.parse(result.value));
      }
    } catch {
      // No entries yet or storage unavailable
    }
    setJournalLoading(false);
  }, []);

  useEffect(() => { reloadJournal(); }, [reloadJournal]);

  // ---- Poke count: load/reload from persistent storage ----
  const reloadPokes = useCallback(async () => {
    try {
      const result = await window.storage.get("glim-pokes");
      if (result && result.value) {
        setClickCount(parseInt(result.value, 10) || 0);
      }
    } catch {
      // No saved pokes yet
    }
  }, []);

  useEffect(() => { reloadPokes(); }, [reloadPokes]);

  // ---- Poke count: save when it changes ----
  useEffect(() => {
    if (clickCount > 0) {
      window.storage.set("glim-pokes", String(clickCount)).catch(() => {});
    }
  }, [clickCount]);

  // ---- Settings: load/reload (called on mount and by sync service) ----
  const reloadSettings = useCallback(async () => {
    try {
      const result = await window.storage.get("glim-settings");
      if (result && result.value) {
        const s = JSON.parse(result.value);
        if (s.wellnessInterval) setWellnessInterval(s.wellnessInterval);
        if (s.moveInterval) setMoveInterval(s.moveInterval);
        if (s.eyesInterval) setEyesInterval(s.eyesInterval);
      }
    } catch {
      // No saved settings yet - use defaults
    }
  }, []);

  useEffect(() => { reloadSettings(); }, [reloadSettings]);

  // ---- Settings: save when any interval changes ----
  const settingsInitRef = useRef(false);
  useEffect(() => {
    // Skip the initial render to avoid overwriting storage with defaults
    // before the load effect has a chance to run
    if (!settingsInitRef.current) { settingsInitRef.current = true; return; }
    window.storage.set("glim-settings", JSON.stringify({
      wellnessInterval, moveInterval, eyesInterval,
      lastModified: new Date().toISOString(),
    })).catch(() => {});
  }, [wellnessInterval, moveInterval, eyesInterval]);

  // ---- Listen for sync service updates (cross-device data arriving) ----
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.domains?.includes('journal')) reloadJournal();
      if (e.detail?.domains?.includes('pokes')) reloadPokes();
      if (e.detail?.domains?.includes('settings')) reloadSettings();
    };
    window.addEventListener('glim-data-updated', handler);
    return () => window.removeEventListener('glim-data-updated', handler);
  }, [reloadJournal, reloadPokes, reloadSettings]);

  // ---- Eye tracking ----
  // Uses isSleepingRef so the callback is stable (no dep on specialAnim)
  const handleMouseMove = useCallback((e) => {
    if (!creatureRef.current || isSleepingRef.current) return;
    const rect = creatureRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.4;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 300;
    const norm = Math.min(dist / maxDist, 1);
    setPupilOffset({
      x: (dx / (dist || 1)) * norm,
      y: (dy / (dist || 1)) * norm,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // ---- Rare blink (every 45-90s, very infrequent) ----
  // Uses isPurringRef to avoid stale closure; cleanup kills old chain on unmount
  const isPurringRef = useRef(false);
  useEffect(() => { isPurringRef.current = isPurring; }, [isPurring]);

  useEffect(() => {
    const blinkTimer = { current: null };
    const scheduleBlink = () => {
      blinkTimer.current = setTimeout(() => {
        if (!isSleepingRef.current && !isPurringRef.current) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 250);
        }
        scheduleBlink();
      }, Math.random() * 45000 + 45000);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimer.current);
  }, []);

  // ---- Random wing twitches ----
  useEffect(() => {
    const twitchTimer = { current: null };
    const scheduleTwitch = () => {
      twitchTimer.current = setTimeout(() => {
        const side = Math.random() > 0.5 ? "left" : "right";
        setWingTwitchSide(side);
        setTimeout(() => setWingTwitchSide(null), 350);
        scheduleTwitch();
      }, Math.random() * 12000 + 6000);
    };
    scheduleTwitch();
    return () => clearTimeout(twitchTimer.current);
  }, []);

  // ---- Idle wandering ----
  useEffect(() => {
    const scheduleWander = () => {
      const delay = Math.random() * 20000 + 15000; // every 15-35s
      wanderTimerRef.current = setTimeout(() => {
        if (!isDragging && !isReturning && !specialAnim) {
          setIsWandering(true);
          const wx = (Math.random() - 0.5) * 40;
          const wy = (Math.random() - 0.5) * 25;
          setDragPos({ x: wx, y: wy });
          // Drift back slowly
          wanderDriftRef.current = setTimeout(() => {
            setDragPos({ x: 0, y: 0 });
            wanderDriftRef.current = setTimeout(() => setIsWandering(false), 3000);
          }, 2500);
        }
        scheduleWander();
      }, delay);
    };
    scheduleWander();
    return () => { clearTimeout(wanderTimerRef.current); clearTimeout(wanderDriftRef.current); };
  }, [isDragging, isReturning, specialAnim]);

  // ---- Antenna perk on message ----
  useEffect(() => {
    if (showBubble) {
      setAntennaPerk(true);
      const t = setTimeout(() => setAntennaPerk(false), 500);
      return () => clearTimeout(t);
    }
  }, [showBubble]);

  // ---- Unprompted behaviors ----
  // Single weighted random draw so documented percentages are exact.
  // Weights: secret 3%, sleep 3% (requires >15min idle), fly 20%,
  //          chase 25%, discovery 30%, nothing 19%.  Total = 100%.
  useEffect(() => {
    const scheduleSpecial = () => {
      const delay = Math.random() * 120000 + 90000; // every 90-210s
      specialTimerRef.current = setTimeout(() => {
        // If sleeping, don't do anything - just reschedule
        if (isSleepingRef.current) {
          scheduleSpecial();
          return;
        }

        const timeSinceInteraction = Date.now() - lastInteractionRef.current;
        const roll = Math.random() * 100;

        // ---- Secret spin: 3% (roll 0-3) ----
        if (roll < 3) {
          setSpecialAnim("secret");
          setTimeout(() => setSpecialAnim(null), 2200);

        // ---- Sleep: 3% (roll 3-6), only if idle >15 min ----
        } else if (roll < 6) {
          if (timeSinceInteraction > 900000) {
            setSpecialAnim("sleep");
          }
          // If not idle enough, effectively "nothing happens"

        // ---- Fly attempt: 20% (roll 6-26) ----
        } else if (roll < 26) {
          setSpecialAnim("flyAttempt");
          setTimeout(() => {
            setSpecialAnim(null);
            showMessage(pickRandom(MESSAGES.flyFail));
          }, 1600);

        // ---- Bug chase: 25% (roll 26-51) ----
        } else if (roll < 51) {
          const targetBug = Math.floor(Math.random() * 5);
          setChasedBugId(targetBug);
          setSpecialAnim("chaseBug");
          showMessage(pickRandom([
            "*eyes lock onto bug*", "...i see you.", "TARGET ACQUIRED",
            "*pupils dilate*", "don't move don't move don't move",
            "*predator mode activated*", "hoo... hoo...",
          ]));
          setTimeout(() => {
            setChasedBugId(null);
            setSpecialAnim(null);
            // 60% catch, 40% miss
            if (Math.random() < 0.6) {
              showMessage(pickRandom([
                "*got it!!*", "*CRUNCH* ...delicious", "hehe gotcha",
                "*triumphant wing flap*", "too slow, little bug!",
                "i'm a predator. a tiny glowing predator. fear me.",
              ]));
            } else {
              showMessage(pickRandom([
                "...it got away", "*dejected hoot*", "next time.",
                "i wasn't even trying. (i was.)", "that bug is too fast and i respect it",
                "what if they have a family. what am i doing.",
              ]));
            }
          }, 3000);

        // ---- Discovery: 30% (roll 51-81) ----
        } else if (roll < 81) {
          showMessage(pickRandom(DISCOVERIES));

        // ---- Nothing: 19% (roll 81-100) ----
        }

        scheduleSpecial();
      }, delay);
    };
    scheduleSpecial();
    return () => clearTimeout(specialTimerRef.current);
  }, []);

  // ---- Message system ----
  const showMessage = useCallback((text, wellness = false, msgType = null) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setMessage(text); setShowBubble(true); setIsWellness(wellness);
    setCurrentMsgType(msgType);
  }, []);

  // Show a message without waking Glim (for sleep talk)
  const showSleepMessage = useCallback((text) => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setMessage(text); setShowBubble(true); setIsWellness(false);
    setCurrentMsgType("sleep");
  }, []);

  // Explicitly wake Glim
  const wakeUp = useCallback(() => {
    if (isSleepingRef.current) {
      setSpecialAnim(null);
      isSleepingRef.current = false;
    }
  }, []);

  const triggerHappy = useCallback(() => {
    if (happyTimer.current) clearTimeout(happyTimer.current);
    setIsHappy(true); happyTimer.current = setTimeout(() => setIsHappy(false), 2000);
  }, []);

  const pickUnique = useCallback((pool, lastRef) => {
    let p = pickRandom(pool), a = 0;
    while (p === lastRef.current && a < 5) { p = pickRandom(pool); a++; }
    lastRef.current = p; return p;
  }, []);

  // ---- Journal save/delete ----
  const saveJournalEntry = useCallback(async (text) => {
    const entry = {
      id: crypto.randomUUID(),
      text: text.trim(),
      prompt: journalPrompt,
      date: new Date().toISOString(),
    };
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    setJournalText("");
    setJournalPrompt(pickRandom(JOURNAL_PROMPTS));
    try {
      await window.storage.set("glim-journal", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save journal:", e);
    }
    triggerHappy();
    showMessage(pickRandom([
      "saved! your words matter.", "got it. that one's safe with me.",
      "journaled! look at you being reflective.", "*tucks your entry away carefully*",
      "written and stored. future-you will appreciate this.",
      "that was good. you should do this more often.",
      "entry saved. you're building a record of being alive. that's cool.",
    ]));
  }, [journalEntries, journalPrompt, triggerHappy, showMessage]);

  const deleteJournalEntry = useCallback(async (id) => {
    // Soft delete: mark deletedAt rather than removing, so sync can propagate deletions
    const updated = journalEntries.map((e) =>
      e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e
    );
    setJournalEntries(updated);
    try {
      await window.storage.set("glim-journal", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update journal:", e);
    }
  }, [journalEntries]);

  // ---- Wellness timer ----
  useEffect(() => {
    if (wellnessTimer.current) clearTimeout(wellnessTimer.current);
    const baseMs = wellnessInterval * 60000;
    const jitter = baseMs * 0.3;
    const s = () => { wellnessTimer.current = setTimeout(() => {
      if (!isSleepingRef.current) {
        showMessage(pickUnique(MESSAGES.wellness, lastWellnessRef), true, "wellness");
      }
      s();
    }, baseMs + Math.random() * jitter); }; s();
    return () => clearTimeout(wellnessTimer.current);
  }, [showMessage, pickUnique, wellnessInterval]);

  // ---- Move reminder ----
  useEffect(() => {
    if (moveTimer.current) clearTimeout(moveTimer.current);
    const schedule = () => {
      moveTimer.current = setTimeout(() => {
        if (!isSleepingRef.current) {
          setMoveReminder(pickRandom(MOVE_REMINDERS));
        } else {
          schedule(); // try again later
        }
      }, moveInterval * 60000);
    };
    schedule();
    return () => clearTimeout(moveTimer.current);
  }, [moveInterval]);
  const dismissMove = useCallback(() => {
    wakeUp();
    setMoveReminder(null); triggerHappy(); showMessage(pickRandom(MOVE_DONE_RESPONSES));
    moveTimer.current = setTimeout(() => setMoveReminder(pickRandom(MOVE_REMINDERS)), moveInterval * 60000);
  }, [showMessage, triggerHappy, moveInterval, wakeUp]);

  // ---- Eyes reminder ----
  useEffect(() => {
    if (eyesTimer.current) clearTimeout(eyesTimer.current);
    const schedule = () => {
      eyesTimer.current = setTimeout(() => {
        if (!isSleepingRef.current) {
          setEyesReminder(pickRandom(EYES_REMINDERS));
        } else {
          schedule();
        }
      }, eyesInterval * 60000);
    };
    schedule();
    return () => clearTimeout(eyesTimer.current);
  }, [eyesInterval]);
  const dismissEyes = useCallback(() => {
    wakeUp();
    setEyesReminder(null); triggerHappy(); showMessage(pickRandom(EYES_DONE_RESPONSES));
    eyesTimer.current = setTimeout(() => setEyesReminder(pickRandom(EYES_REMINDERS)), eyesInterval * 60000);
  }, [showMessage, triggerHappy, eyesInterval, wakeUp]);

  // ---- Idle chatter ----
  useEffect(() => {
    const s = () => {
      const d = Math.random() * 25000 + 15000;
      idleTimer.current = setTimeout(() => {
        if (isSleepingRef.current) {
          showSleepMessage(pickRandom(MESSAGES.sleepTalk));
          s(); return;
        }
        const r = Math.random();
        if (r < 0.16) {
          triggerHappy();
          showMessage(pickUnique(MESSAGES.encouragement, lastEncouragementRef), false, "encouragement");
        } else if (r < 0.32) {
          showMessage(pickRandom(MINDFULNESS), false, "mindfulness");
        } else if (r < 0.37) {
          showMessage(pickRandom(JOURNAL_NUDGES), false, "journal");
        } else if (r < 0.45) {
          showMessage(pickRandom(SCIENCE_FACTS), false, "science");
        } else if (r < 0.65) {
          showMessage(pickRandom(MESSAGES.idle), false, "idle");
        } else {
          showMessage(pickRandom(MESSAGES[mood]), false, "time");
        }
        s();
      }, d);
    }; s();
    return () => clearTimeout(idleTimer.current);
  }, [mood, showMessage, showSleepMessage, triggerHappy, pickUnique]);

  // ---- Greeting ----
  useEffect(() => {
    const t = setTimeout(() => showMessage(pickRandom(MESSAGES[mood])), 1500);
    return () => clearTimeout(t);
  }, []);

  // ---- Click handling with rapid detection and startle ----
  const handleClick = (e) => {
    // Prevent double-click from also firing single click messages
    if (e.detail > 1) return;
    // Prevent click from firing after a drag release
    if (justDraggedRef.current) return;
    // Prevent click during purr (mouseup handles purr end)
    if (isPurring) return;

    lastInteractionRef.current = Date.now();

    // Wake up if sleeping
    if (specialAnim === "sleep") {
      setSpecialAnim(null);
      setIsPuffed(true);
      showMessage(pickRandom(MESSAGES.startled));
      if (puffTimerRef.current) clearTimeout(puffTimerRef.current);
      puffTimerRef.current = setTimeout(() => setIsPuffed(false), 1500);
      return;
    }

    setSqueezed(true);
    setClickCount((c) => c + 1);
    setTimeout(() => setSqueezed(false), 280);

    // Track rapid clicks
    const now = Date.now();
    clickTimesRef.current.push(now);
    clickTimesRef.current = clickTimesRef.current.filter((t) => now - t < 2000);

    // Check if startled (first click after >5 min idle, 50% chance)
    const timeSinceLast = now - (clickTimesRef.current[clickTimesRef.current.length - 2] || 0);
    if (clickTimesRef.current.length === 1 && timeSinceLast > 300000 && Math.random() < 0.5) {
      setIsPuffed(true);
      showMessage(pickRandom(MESSAGES.startled));
      if (puffTimerRef.current) clearTimeout(puffTimerRef.current);
      puffTimerRef.current = setTimeout(() => setIsPuffed(false), 1500);
      return;
    }

    // Rapid clicking (4+ clicks in 2s)
    if (clickTimesRef.current.length >= 4) {
      showMessage(pickRandom(MESSAGES.rapidClick));
      return;
    }

    // Context-aware clicking (if a mindfulness message is showing)
    if (currentMsgType === "mindfulness") {
      showMessage(pickRandom(MESSAGES.mindfulClick));
      return;
    }

    // Normal click
    const r = Math.random();
    if (r < 0.15) {
      triggerHappy();
      showMessage(pickUnique(MESSAGES.encouragement, lastEncouragementRef), false, "encouragement");
    } else if (r < 0.25) {
      showMessage(pickRandom(MESSAGES[mood]));
    } else {
      showMessage(pickRandom(MESSAGES.clicked));
    }
  };

  // ---- Double-click: fly attempt ----
  const handleDoubleClick = () => {
    if (justDraggedRef.current) return;
    lastInteractionRef.current = Date.now();
    if (specialAnim) return;
    setSpecialAnim("flyAttempt");
    setTimeout(() => {
      setSpecialAnim(null);
      showMessage(pickRandom(MESSAGES.flyFail));
    }, 1600);
  };

  // ---- Interaction: drag, purr, click all unified ----
  const handleCreatureMouseDown = (e) => {
    e.preventDefault();
    lastInteractionRef.current = Date.now();
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    // Start purr timer (cancelled if drag starts)
    holdTimerRef.current = setTimeout(() => {
      if (dragStartRef.current && !dragStartRef.current.moved) {
        setIsPurring(true);
        showMessage(pickRandom(MESSAGES.purr));
      }
    }, 500);
  };

  // Window-level move/up handles ALL drag logic
  useEffect(() => {
    const onMove = (e) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      // Threshold before drag activates
      if (!dragStartRef.current.moved && Math.sqrt(dx * dx + dy * dy) > 10) {
        dragStartRef.current.moved = true;
        setIsDragging(true);
        setIsWandering(false);
        clearTimeout(wanderDriftRef.current);
        setIsPurring(false);
        clearTimeout(holdTimerRef.current);
      }
      if (dragStartRef.current.moved) {
        setDragPos({ x: dx, y: dy });
        // Track velocity for shake detection
        const now = Date.now();
        dragVelocityRef.current.push({ x: e.clientX, y: e.clientY, t: now });
        // Keep only last 500ms of movement
        dragVelocityRef.current = dragVelocityRef.current.filter((p) => now - p.t < 500);
        // Detect shake: 4+ direction changes in 500ms
        if (dragVelocityRef.current.length >= 4) {
          let dirChanges = 0;
          for (let i = 2; i < dragVelocityRef.current.length; i++) {
            const prevDx = dragVelocityRef.current[i-1].x - dragVelocityRef.current[i-2].x;
            const currDx = dragVelocityRef.current[i].x - dragVelocityRef.current[i-1].x;
            if ((prevDx > 0 && currDx < 0) || (prevDx < 0 && currDx > 0)) dirChanges++;
          }
          if (dirChanges >= 3 && !isShaken) {
            setIsShaken(true);
            showMessage(pickRandom(MESSAGES.shaken));
            if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
            shakeTimerRef.current = setTimeout(() => setIsShaken(false), 2000);
            dragVelocityRef.current = [];
          }
        }
      }
    };

    const onUp = () => {
      if (!dragStartRef.current) return;
      clearTimeout(holdTimerRef.current);

      if (dragStartRef.current.moved) {
        // Was dragging - end drag with drift back
        setIsDragging(false);
        setIsReturning(true);
        justDraggedRef.current = true;
        dragVelocityRef.current = [];
        setTimeout(() => { justDraggedRef.current = false; }, 300);

        if (Math.random() < 0.6) {
          showMessage(pickRandom([
            "wheee!", "*drifts home*", "okay okay i'm going back",
            "that was fun. do it again.", "i can find my way home. probably.",
            "*floats back contentedly*", "you can't get rid of me that easy",
            "weeeee... *thud*", "i belong in the middle and i know it",
          ]));
        }
        // Wait one frame for transition to apply, THEN move to center
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setDragPos({ x: 0, y: 0 });
          });
        });
        // isReturning cleared after animation (safe - transition no longer changes on clear)
        setTimeout(() => setIsReturning(false), 3200);
      } else {
        // Was NOT dragging - stop purr if active
        if (isPurring) setIsPurring(false);
      }

      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPurring, isShaken, showMessage]);

  const { hue, sat } = colors;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        fontFamily: "'Courier New', monospace",
        background: "#040408",
      }}>
      <Background hue={hue} sat={sat} mood={mood} />

      <div className="absolute rounded-full pointer-events-none" style={{
        width: 420, height: 420,
        border: `1px solid hsla(${hue}, ${sat}%, 55%, 0.07)`,
        animation: "ringPulse 6s ease-in-out infinite",
      }} />

      <AmbientBugs hue={hue} chasedBugId={chasedBugId} />

      <div className="relative" style={{
        zIndex: 10,
        transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
        transition: isDragging ? "none" : "transform 3s cubic-bezier(0.15, 0.6, 0.35, 1)",
        animation: !isDragging && !isReturning ? (
          specialAnim === "chaseBug" ? "creatureChase 3s ease-in-out"
          : specialAnim === "flyAttempt" ? "creatureFly 1.5s ease-in-out"
          : "none"
        ) : "none",
        cursor: isDragging ? "grabbing" : "grab",
      }} ref={creatureRef} onMouseDown={handleCreatureMouseDown}>
        <SpeechBubble text={message} visible={showBubble} isWellness={isWellness} />
        <OwlMoth
          onClick={handleClick} onDoubleClick={handleDoubleClick}
          squeezed={squeezed} hue={hue} sat={sat} mood={mood}
          isHappy={isHappy} isPuffed={isPuffed}
          isPurring={isPurring} isBlinking={isBlinking} specialAnim={specialAnim}
          antennaPerk={antennaPerk} wingTwitchSide={wingTwitchSide}
          pupilOffset={pupilOffset}
        />
      </div>

      <div className="mt-1 text-center relative" style={{ zIndex: 10 }}>
        <div style={{
          color: `hsla(${hue}, ${sat}%, 75%, 0.8)`, fontSize: 14,
          letterSpacing: "3px", textTransform: "uppercase",
        }}>glim</div>
        <div style={{
          color: `hsla(${hue}, ${sat - 15}%, 55%, 0.4)`, fontSize: 10, marginTop: 3, letterSpacing: "1px",
        }}>
          click to say hi{clickCount > 0 && ` · poked ${clickCount} time${clickCount > 1 ? "s" : ""}`}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={() => {
            wakeUp();
            lastInteractionRef.current = Date.now();
            clearTimeout(moveTimer.current);
            setMoveReminder(null);
            moveTimer.current = setTimeout(() => setMoveReminder(pickRandom(MOVE_REMINDERS)), moveInterval * 60000);
            showMessage(pickRandom(["nice! timer reset.", "got it, you moved!", "noted. clock restarted."]));
          }} style={{
            background: "none", border: "none", cursor: "pointer",
            color: `hsla(${hue}, ${sat - 15}%, 55%, 0.25)`, fontSize: 10,
            fontFamily: "'Courier New', monospace", letterSpacing: "0.5px",
            transition: "color 0.2s ease", padding: "2px 6px",
          }}
            onMouseEnter={(e) => { e.target.style.color = `hsla(${hue}, ${sat}%, 70%, 0.7)`; }}
            onMouseLeave={(e) => { e.target.style.color = `hsla(${hue}, ${sat - 15}%, 55%, 0.25)`; }}
          >just moved</button>
          <button onClick={() => {
            wakeUp();
            lastInteractionRef.current = Date.now();
            clearTimeout(eyesTimer.current);
            setEyesReminder(null);
            eyesTimer.current = setTimeout(() => setEyesReminder(pickRandom(EYES_REMINDERS)), eyesInterval * 60000);
            showMessage(pickRandom(["good! eye timer reset.", "eyes rested! clock restarted.", "noted. see you in a bit."]));
          }} style={{
            background: "none", border: "none", cursor: "pointer",
            color: `hsla(${hue}, ${sat - 15}%, 55%, 0.25)`, fontSize: 10,
            fontFamily: "'Courier New', monospace", letterSpacing: "0.5px",
            transition: "color 0.2s ease", padding: "2px 6px",
          }}
            onMouseEnter={(e) => { e.target.style.color = `hsla(${hue}, ${sat}%, 70%, 0.7)`; }}
            onMouseLeave={(e) => { e.target.style.color = `hsla(${hue}, ${sat - 15}%, 55%, 0.25)`; }}
          >eyes rested</button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 mt-5 relative" style={{ minHeight: 20, zIndex: 10 }}>
        {eyesReminder && <PersistentReminder text={eyesReminder} type="eyes" onDismiss={dismissEyes} />}
        {moveReminder && <PersistentReminder text={moveReminder} type="move" onDismiss={dismissMove} />}
      </div>

      {/* ===== SETTINGS GEAR ===== */}
      <button onClick={() => { setShowSettings(!showSettings); setShowJournal(false); }}
        className="absolute cursor-pointer" style={{
          top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 16, zIndex: 50, width: 32, height: 32,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.4)", fontSize: 16, transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
      >&#9881;</button>

      {/* ===== SETTINGS PANEL ===== */}
      {showSettings && (
        <div className="absolute" style={{
          top: "calc(env(safe-area-inset-top, 0px) + 56px)", right: 16, zIndex: 50, padding: "16px 20px", borderRadius: 16,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.12)",
          fontFamily: "'Courier New', monospace", color: "rgba(255,255,255,0.85)",
          fontSize: 12, minWidth: 240,
        }}>
          <div style={{ marginBottom: 14, fontSize: 13, letterSpacing: "1px", opacity: 0.6 }}>settings</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span>wellness reminders</span>
              <span style={{ opacity: 0.5 }}>{wellnessInterval} min</span>
            </div>
            <input type="range" min="10" max="60" value={wellnessInterval}
              onChange={(e) => setWellnessInterval(Number(e.target.value))}
              style={{ width: "100%", accentColor: `hsl(${hue}, ${sat}%, 65%)` }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span>move reminders</span>
              <span style={{ opacity: 0.5 }}>{moveInterval} min</span>
            </div>
            <input type="range" min="15" max="90" value={moveInterval}
              onChange={(e) => setMoveInterval(Number(e.target.value))}
              style={{ width: "100%", accentColor: `hsl(${hue}, ${sat}%, 65%)` }} />
          </div>

          <div style={{ marginBottom: 4 }}>
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
              <span>eye break reminders</span>
              <span style={{ opacity: 0.5 }}>{eyesInterval} min</span>
            </div>
            <input type="range" min="10" max="60" value={eyesInterval}
              onChange={(e) => setEyesInterval(Number(e.target.value))}
              style={{ width: "100%", accentColor: `hsl(${hue}, ${sat}%, 65%)` }} />
          </div>
        </div>
      )}

      {/* ===== JOURNAL BUTTON ===== */}
      <button onClick={() => { setShowJournal(!showJournal); setShowSettings(false); }}
        className="absolute cursor-pointer" style={{
          top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 56, zIndex: 50, width: 32, height: 32,
          background: showJournal ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          color: showJournal ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
          fontSize: 15, transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = showJournal ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"; e.currentTarget.style.color = showJournal ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)"; }}
      >&#9997;</button>

      {/* ===== JOURNAL PANEL ===== */}
      {showJournal && (
        <div className="absolute" style={{
          top: "calc(env(safe-area-inset-top, 0px) + 56px)", right: 16, zIndex: 50, padding: "16px 20px", borderRadius: 16,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.12)",
          fontFamily: "'Courier New', monospace", color: "rgba(255,255,255,0.85)",
          fontSize: 12, width: 340, maxHeight: "70vh", display: "flex", flexDirection: "column",
        }}>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button onClick={() => setJournalView("write")} style={{
              flex: 1, padding: "6px 0", borderRadius: 8, cursor: "pointer",
              background: journalView === "write" ? `hsla(${hue}, ${sat}%, 50%, 0.3)` : "rgba(255,255,255,0.05)",
              border: `1px solid ${journalView === "write" ? `hsla(${hue}, ${sat}%, 60%, 0.4)` : "rgba(255,255,255,0.1)"}`,
              color: "rgba(255,255,255,0.85)", fontFamily: "'Courier New', monospace", fontSize: 12,
              letterSpacing: "1px",
            }}>write</button>
            <button onClick={() => setJournalView("past")} style={{
              flex: 1, padding: "6px 0", borderRadius: 8, cursor: "pointer",
              background: journalView === "past" ? `hsla(${hue}, ${sat}%, 50%, 0.3)` : "rgba(255,255,255,0.05)",
              border: `1px solid ${journalView === "past" ? `hsla(${hue}, ${sat}%, 60%, 0.4)` : "rgba(255,255,255,0.1)"}`,
              color: "rgba(255,255,255,0.85)", fontFamily: "'Courier New', monospace", fontSize: 12,
              letterSpacing: "1px",
            }}>
              past{journalEntries.filter(e => !e.deletedAt).length > 0 && ` (${journalEntries.filter(e => !e.deletedAt).length})`}
            </button>
          </div>

          {/* Write view */}
          {journalView === "write" && (
            <div>
              <div style={{
                padding: "10px 12px", borderRadius: 10, marginBottom: 12,
                background: `hsla(${hue}, ${sat}%, 50%, 0.1)`,
                border: `1px solid hsla(${hue}, ${sat}%, 60%, 0.15)`,
                fontSize: 12, lineHeight: 1.5, fontStyle: "italic",
                color: `hsla(${hue}, ${sat - 10}%, 80%, 0.8)`,
              }}>
                {journalPrompt}
              </div>
              <button onClick={() => setJournalPrompt(pickRandom(JOURNAL_PROMPTS))}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.35)", fontSize: 11, marginBottom: 10,
                  fontFamily: "'Courier New', monospace", padding: 0,
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => { e.target.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={(e) => { e.target.style.color = "rgba(255,255,255,0.35)"; }}
              >&#8635; different prompt</button>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="write here..."
                style={{
                  width: "100%", minHeight: 100, maxHeight: 200, padding: "10px 12px",
                  borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.9)",
                  fontFamily: "'Courier New', monospace", fontSize: 12,
                  lineHeight: 1.5, resize: "vertical", outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = `hsla(${hue}, ${sat}%, 60%, 0.4)`; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <span style={{ opacity: 0.3, fontSize: 11 }}>
                  {journalText.length > 0 && `${journalText.length} chars`}
                </span>
                <button
                  onClick={() => { if (journalText.trim()) saveJournalEntry(journalText); }}
                  disabled={!journalText.trim()}
                  style={{
                    padding: "6px 16px", borderRadius: 10, cursor: journalText.trim() ? "pointer" : "default",
                    background: journalText.trim() ? `hsla(${hue}, ${sat}%, 50%, 0.3)` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${journalText.trim() ? `hsla(${hue}, ${sat}%, 60%, 0.4)` : "rgba(255,255,255,0.08)"}`,
                    color: journalText.trim() ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
                    fontFamily: "'Courier New', monospace", fontSize: 12,
                    transition: "all 0.2s ease",
                  }}
                >save</button>
              </div>
            </div>
          )}

          {/* Past entries view */}
          {journalView === "past" && (
            <div style={{ overflowY: "auto", flex: 1, maxHeight: "55vh" }}>
              {journalLoading ? (
                <div style={{ opacity: 0.4, textAlign: "center", padding: 20 }}>loading...</div>
              ) : journalEntries.filter(e => !e.deletedAt).length === 0 ? (
                <div style={{ opacity: 0.4, textAlign: "center", padding: 20, lineHeight: 1.6 }}>
                  no entries yet.<br />go write something!
                </div>
              ) : (
                journalEntries.filter(e => !e.deletedAt).map((entry) => (
                  <div key={entry.id} style={{
                    padding: "12px 14px", borderRadius: 10, marginBottom: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ opacity: 0.4, fontSize: 11 }}>
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "numeric", minute: "2-digit",
                        })}
                      </span>
                      <button onClick={() => deleteJournalEntry(entry.id)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "0 2px",
                        fontFamily: "'Courier New', monospace", transition: "color 0.2s",
                      }}
                        onMouseEnter={(e) => { e.target.style.color = "rgba(255,100,100,0.6)"; }}
                        onMouseLeave={(e) => { e.target.style.color = "rgba(255,255,255,0.2)"; }}
                      >&#10005;</button>
                    </div>
                    {entry.prompt && (
                      <div style={{
                        fontSize: 11, fontStyle: "italic", opacity: 0.4, marginBottom: 6,
                        lineHeight: 1.4,
                      }}>{entry.prompt}</div>
                    )}
                    <div style={{ lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {entry.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateX(300px) translateY(150px); opacity: 0; }
        }
        @keyframes nebulaFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -15px) scale(1.15); }
          66% { transform: translate(-20px, 10px) scale(0.9); }
        }
        @keyframes nebulaFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-35px, 15px) scale(1.1); }
          70% { transform: translate(15px, -10px) scale(0.9); }
        }
        @keyframes nebulaFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 12px) scale(1.15); }
        }
        @keyframes owlFloat {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          50% { transform: scale(1.01, 0.99) translateY(3px); }
        }
        @keyframes purrRock {
          0%, 100% { transform: scale(1.04, 0.97) rotate(0deg); }
          25% { transform: scale(1.04, 0.97) rotate(5deg); }
          75% { transform: scale(1.04, 0.97) rotate(-5deg); }
        }
        @keyframes owlBounce {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          20% { transform: scale(0.92, 1.12) translateY(-10px); }
          40% { transform: scale(1.08, 0.9) translateY(0); }
          60% { transform: scale(0.96, 1.06) translateY(-5px); }
          80% { transform: scale(1.03, 0.97) translateY(0); }
        }
        @keyframes flyAttempt {
          0%, 100% { transform: scale(1, 1); }
          20% { transform: scale(1.05, 0.92); }
          40% { transform: scale(0.95, 1.06); }
          60% { transform: scale(1.03, 0.95); }
          80% { transform: scale(0.97, 1.03); }
        }
        @keyframes chaseBug {
          0%, 100% { transform: scale(1, 1); }
          30% { transform: scale(1.05, 0.95); }
          60% { transform: scale(0.97, 1.03); }
        }
        @keyframes creatureChase {
          0% { transform: translateX(0) translateY(0); }
          15% { transform: translateX(60px) translateY(-15px); }
          30% { transform: translateX(-40px) translateY(10px); }
          50% { transform: translateX(80px) translateY(-25px); }
          65% { transform: translateX(30px) translateY(5px); }
          80% { transform: translateX(-20px) translateY(-10px); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes creatureFly {
          0% { transform: translateY(0); }
          25% { transform: translateY(-60px); }
          40% { transform: translateY(-80px); }
          55% { transform: translateY(-50px); }
          75% { transform: translateY(-20px); }
          85% { transform: translateY(8px); }
          100% { transform: translateY(0); }
        }
        @keyframes secretSpin {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(10deg) scale(1.1); }
          50% { transform: rotate(0deg) scale(1.2); }
          75% { transform: rotate(-10deg) scale(1.1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes wingDriftL {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-4deg); }
        }
        @keyframes wingDriftR {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes wingFlapL {
          0% { transform: rotate(8deg); }
          50% { transform: rotate(-12deg); }
          100% { transform: rotate(8deg); }
        }
        @keyframes wingFlapR {
          0% { transform: rotate(-8deg); }
          50% { transform: rotate(12deg); }
          100% { transform: rotate(-8deg); }
        }
        @keyframes wingTwitchL {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes wingTwitchR {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes tailCurl {
          0%, 100% { transform: rotate(0deg) translateX(0); }
          50% { transform: rotate(3deg) translateX(2px); }
        }
        @keyframes tailPurr {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-3deg); }
        }
        @keyframes antennaL {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes antennaR {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(4deg); }
          75% { transform: rotate(-3deg); }
        }
        @keyframes antennaPerkL {
          0% { transform: rotate(0deg); }
          40% { transform: rotate(-12deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes antennaPerkR {
          0% { transform: rotate(0deg); }
          40% { transform: rotate(12deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes particleDrift {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-18px) translateX(8px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-7px); opacity: 0.3; }
          75% { transform: translateY(-25px) translateX(5px); opacity: 0.5; }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.06); opacity: 0.15; }
        }
        @keyframes reminderPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
        @keyframes bugPath0 {
          0%, 100% { left: 15%; top: 35%; }
          20% { left: 25%; top: 25%; }
          40% { left: 35%; top: 40%; }
          60% { left: 20%; top: 50%; }
          80% { left: 10%; top: 30%; }
        }
        @keyframes bugPath1 {
          0%, 100% { left: 75%; top: 30%; }
          25% { left: 65%; top: 20%; }
          50% { left: 80%; top: 45%; }
          75% { left: 70%; top: 35%; }
        }
        @keyframes bugPath2 {
          0%, 100% { left: 45%; top: 25%; }
          15% { left: 55%; top: 18%; }
          35% { left: 60%; top: 30%; }
          55% { left: 50%; top: 40%; }
          75% { left: 40%; top: 32%; }
        }
        @keyframes bugPath3 {
          0%, 100% { left: 85%; top: 50%; }
          30% { left: 75%; top: 38%; }
          50% { left: 80%; top: 28%; }
          70% { left: 90%; top: 42%; }
        }
        @keyframes bugPath4 {
          0%, 100% { left: 25%; top: 55%; }
          20% { left: 35%; top: 45%; }
          45% { left: 30%; top: 35%; }
          65% { left: 20%; top: 40%; }
          85% { left: 15%; top: 50%; }
        }
        @keyframes zzzFloat {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}


export default DesktopPet;
