// SplashScreen.jsx
// Glim loading/splash screen - shown while Firebase auth state resolves.
// Displays the multi-hue Glim creature against a twilight starfield
// with the "oh hi, welcome back!" tagline.
//
// Usage in App.jsx:
//   if (user === undefined) return <SplashScreen />;   // auth loading
//   if (user === null) return <SignIn />;               // not signed in
//   return <DesktopPet />;                              // signed in
//
// The tagline randomly picks from a small pool on each mount.

import { useState } from "react";

const SPLASH_MESSAGES = [
  "oh hi, welcome back!",
  "hey, there you are",
  "missed you",
  "let's do today together",
  "hi friend",
];

export default function SplashScreen() {
  const [message] = useState(
    () => SPLASH_MESSAGES[Math.floor(Math.random() * SPLASH_MESSAGES.length)]
  );

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, #0d1028 0%, #10103a 30%, #150d32 65%, #0d0820 100%)",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Stars - five time-of-day colors: green, teal, periwinkle, lavender, pink */}
      {/* Large stars with halos */}
      <Star x="8%" y="7%" size={5} color="#86efac" opacity={0.5} halo />
      <Star x="88%" y="9%" size={4} color="#5eead4" opacity={0.55} halo />
      <Star x="20%" y="18%" size={3} color="#a5b4fc" opacity={0.45} />
      <Star x="82%" y="14%" size={4} color="#c4b5fd" opacity={0.5} halo />
      <Star x="5%" y="30%" size={3} color="#f9a8d4" opacity={0.35} />
      <Star x="93%" y="28%" size={3} color="#5eead4" opacity={0.4} />
      <Star x="12%" y="42%" size={3} color="#a5b4fc" opacity={0.4} />
      <Star x="45%" y="8%" size={3} color="#c4b5fd" opacity={0.4} />
      <Star x="91%" y="20%" size={3} color="#86efac" opacity={0.35} />
      {/* Lower stars */}
      <Star x="7%" y="75%" size={4} color="#a5b4fc" opacity={0.4} halo />
      <Star x="90%" y="72%" size={3} color="#5eead4" opacity={0.35} />
      <Star x="85%" y="82%" size={3} color="#f9a8d4" opacity={0.28} />
      <Star x="18%" y="85%" size={3} color="#c4b5fd" opacity={0.3} />
      <Star x="80%" y="90%" size={4} color="#86efac" opacity={0.3} />
      <Star x="30%" y="78%" size={2} color="#5eead4" opacity={0.3} />
      <Star x="60%" y="88%" size={2} color="#a5b4fc" opacity={0.25} />

      {/* Mountain silhouettes */}
      <svg style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "12vh",
      }} viewBox="0 0 400 80" preserveAspectRatio="none" width="100%" height="100%">
        <path d="M0 55 Q50 30 100 48 Q150 65 200 40 Q250 18 300 35 Q350 55 400 32 L400 80 L0 80 Z"
          fill="#08061a" opacity="0.6" />
        <path d="M0 65 Q60 48 120 60 Q180 72 240 52 Q300 35 400 50 L400 80 L0 80 Z"
          fill="#060512" opacity="0.75" />
      </svg>

      {/* Creature glow backdrop */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -58%)",
        width: "280px", height: "280px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(120,136,184,0.12) 0%, rgba(120,136,184,0) 70%)",
        pointerEvents: "none",
      }} />

      {/* Glim creature SVG - exact geometry from DesktopPet.jsx */}
      <svg viewBox="0 0 220 240" width="200" height="218"
        style={{ position: "relative", marginBottom: "20px" }}>
        <defs>
          <radialGradient id="splashBody" cx="48%" cy="40%" r="48%">
            <stop offset="0%" stopColor="#b0c0e0" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#8098c8" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#7870b8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#4838a0" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="splashGlow" cx="50%" cy="38%" r="35%">
            <stop offset="0%" stopColor="#c8d8f0" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8090c0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="splashBelly" cx="50%" cy="55%" r="30%">
            <stop offset="0%" stopColor="#c8d0e8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a0b0d8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="splashFace" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#d0d4e8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#98a0c8" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Tail (exact bezier, curls right) */}
        <path d="M110,185 Q115,200 125,208 Q140,218 148,210 Q155,200 145,195 Q135,192 132,198"
          stroke="#5870a8" strokeOpacity="0.7" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <circle cx="132" cy="198" r="3.5" fill="#a898d8" opacity="0.7" />

        {/* Wings (teal left, purple right) */}
        <ellipse cx="52" cy="125" rx="35" ry="22" fill="#507898" opacity="0.55" transform="rotate(-10 52 125)" />
        <ellipse cx="168" cy="125" rx="35" ry="22" fill="#6860a0" opacity="0.55" transform="rotate(10 168 125)" />

        {/* Body */}
        <ellipse cx="110" cy="130" rx="48" ry="55" fill="url(#splashBody)" />
        <ellipse cx="110" cy="130" rx="48" ry="55" fill="url(#splashGlow)" />
        <ellipse cx="110" cy="142" rx="28" ry="32" fill="url(#splashBelly)" />

        {/* Body dots (fawn markings) */}
        <circle cx="82" cy="115" r="2.2" fill="#90b0d8" opacity="0.28" />
        <circle cx="78" cy="128" r="1.6" fill="#9898d0" opacity="0.2" />
        <circle cx="85" cy="138" r="1.8" fill="#90b0d8" opacity="0.22" />
        <circle cx="138" cy="115" r="2.2" fill="#a090d0" opacity="0.28" />
        <circle cx="142" cy="128" r="1.6" fill="#9898d0" opacity="0.2" />
        <circle cx="135" cy="138" r="1.8" fill="#a090d0" opacity="0.22" />
        <circle cx="102" cy="145" r="1.6" fill="#b0c0e0" opacity="0.18" />
        <circle cx="118" cy="143" r="1.8" fill="#a8b0d8" opacity="0.16" />

        {/* Feet */}
        <ellipse cx="96" cy="182" rx="9" ry="5" fill="#7088b8" opacity="0.6" />
        <ellipse cx="124" cy="182" rx="9" ry="5" fill="#7088b8" opacity="0.6" />

        {/* Face disc */}
        <ellipse cx="110" cy="98" rx="32" ry="28" fill="url(#splashFace)" />

        {/* Eyes (white with dark pupils) */}
        <ellipse cx="97" cy="95" rx="12" ry="12" fill="rgba(255,255,255,0.95)" />
        <circle cx="97" cy="96" r="7" fill="#1a1530" />
        <circle cx="99" cy="92" r="2.5" fill="rgba(255,255,255,0.9)" />
        <ellipse cx="123" cy="95" rx="12" ry="12" fill="rgba(255,255,255,0.95)" />
        <circle cx="123" cy="96" r="7" fill="#1a1530" />
        <circle cx="125" cy="92" r="2.5" fill="rgba(255,255,255,0.9)" />

        {/* Beak */}
        <path d="M108,105 L110,109 L112,105" fill="#9080b8" opacity="0.8" />

        {/* Blush */}
        <ellipse cx="85" cy="103" rx="6" ry="3" fill="#d088c8" opacity="0.28" />
        <ellipse cx="135" cy="103" rx="6" ry="3" fill="#d088c8" opacity="0.28" />

        {/* Antennae (curved beziers, teal left bobble, lavender right) */}
        <path d="M98,75 Q92,55 88,42" stroke="#6890b0" strokeOpacity="0.6"
          strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="88" cy="42" r="5.5" fill="#98c0d8" opacity="0.85" />
        <circle cx="88" cy="42" r="8" fill="#98c0d8" opacity="0.15" />
        <path d="M122,75 Q128,55 132,42" stroke="#8068b0" strokeOpacity="0.6"
          strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="132" cy="42" r="5.5" fill="#c0a8e0" opacity="0.85" />
        <circle cx="132" cy="42" r="8" fill="#c0a8e0" opacity="0.15" />
      </svg>

      {/* Title */}
      <div style={{
        fontFamily: "-apple-system, system-ui, sans-serif",
        fontSize: 'var(--glim-text-splash-title)',
        fontWeight: 300,
        letterSpacing: "6px",
        color: "#c8d0e8",
        textTransform: "lowercase",
        marginBottom: "8px",
      }}>
        glim
      </div>

      {/* Tagline (Glim's voice, randomized per mount) */}
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 'var(--glim-text-splash-sub)',
        color: "#8898c0",
        opacity: 0.55,
        letterSpacing: "0.5px",
      }}>
        {message}
      </div>

      {/* Accent line */}
      <div style={{
        width: "28px",
        height: "2px",
        borderRadius: "1px",
        background: "linear-gradient(90deg, #6898b8, #8068b0)",
        opacity: 0.45,
        marginTop: "32px",
      }} />
    </div>
  );
}

// Helper component for stars
function Star({ x, y, size, color, opacity, halo }) {
  return (
    <>
      <div style={{
        position: "absolute",
        left: x, top: y,
        width: `${size}px`, height: `${size}px`,
        borderRadius: "50%",
        background: color,
        opacity,
        pointerEvents: "none",
      }} />
      {halo && (
        <div style={{
          position: "absolute",
          left: x, top: y,
          width: `${size * 2}px`, height: `${size * 2}px`,
          borderRadius: "50%",
          background: color,
          opacity: opacity * 0.15,
          transform: `translate(-${size * 0.5}px, -${size * 0.5}px)`,
          pointerEvents: "none",
        }} />
      )}
    </>
  );
}
