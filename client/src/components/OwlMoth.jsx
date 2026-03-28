// -----------------------------------------------------------------------------
// Title:       OwlMoth.jsx
// Project:     Glim
// Author:      Reina Hastings (reinahastings13@gmail.com)
// Created:     2026-03-27
// Last Modified: 2026-03-27
// Purpose:     Renders Glim's creature SVG. All visual state (mood, animations,
//              eye tracking, body squish, puff, purr, sleep) is driven by
//              props. No internal state -- purely a function of its inputs.
// Inputs:      onClick, onDoubleClick (handlers), squeezed, hue, sat, mood,
//              isHappy, isPuffed, isPurring, isBlinking, specialAnim,
//              antennaPerk, wingTwitchSide, pupilOffset props
// Outputs:     SVG element (360x390)
// -----------------------------------------------------------------------------

export default function OwlMoth({ onClick, onDoubleClick,
  squeezed, hue, sat, mood, isHappy, isPuffed, isPurring, isBlinking,
  specialAnim, antennaPerk, wingTwitchSide, pupilOffset,
  width = 360, height = 390 }) {

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
    <svg viewBox="0 0 220 240" width={width} height={height}
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
            stroke={`hsla(${h}, ${h - 5}%, 60%, 0.7)`} strokeWidth="6" strokeLinecap="round" fill="none" />
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
