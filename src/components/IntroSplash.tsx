import { useEffect, useState } from "react";
import AnimatedRobin from "./AnimatedRobin";

type Props = {
  onEnter: () => void;
  exiting?: boolean;
};

/**
 * Cinematic 2.4-second opening splash that plays once at app start.
 *
 * The scene is an Edinburgh-flavoured flat illustration (castle, tenements,
 * Scott-Monument-style spire) drawn in the existing pastel palette, with a
 * plane drifting overhead, clouds floating in, and the animated Robin
 * hopping into view. The title "Risk Robin" lands letter-by-letter with a
 * soft spring, and an `Enter` button fades in once the animation settles.
 *
 * Players can click anywhere to skip ahead to the Enter button. The button
 * itself calls `onEnter` to dismiss the splash and reveal the game beneath.
 */
export default function IntroSplash({ onEnter, exiting = false }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (ready) onEnter();
        else setReady(true);
      }
      if (e.key === "Escape") setReady(true);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [ready, onEnter]);

  return (
    <div
      className={`rr-splash ${exiting ? "rr-splash-exit" : ""}`}
      role="dialog"
      aria-label="Risk Robin"
      onClick={() => {
        if (!ready) setReady(true);
      }}
    >
      <style>{splashCss}</style>

      <div className="rr-splash-sky" aria-hidden="true" />

      {/* Drifting clouds */}
      <div className="rr-cloud rr-cloud-1" aria-hidden="true" />
      <div className="rr-cloud rr-cloud-2" aria-hidden="true" />
      <div className="rr-cloud rr-cloud-3" aria-hidden="true" />
      <div className="rr-cloud rr-cloud-4" aria-hidden="true" />

      {/* Plane with dashed contrail */}
      <div className="rr-plane-track" aria-hidden="true">
        <div className="rr-trail" />
        <svg className="rr-plane" viewBox="0 0 64 18">
          <path
            d="M2 9 L34 6 L48 2 L52 2 L46 8 L60 9 L46 10 L52 16 L48 16 L34 12 L2 9 Z"
            fill="#ffffff"
            stroke="#3b5566"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Edinburgh skyline */}
      <EdinburghSkyline />

      {/* Robin hops in from the left, sits in the foreground on the road.
          Aspect-[16/9] matches the Chief Analyst PNG so the bird fills its
          container with no vertical padding, letting the feet land on the
          pavement strip in the SVG below. */}
      <div className="rr-robin-stage" aria-hidden="true">
        <AnimatedRobin className="w-32 sm:w-40 md:w-48 aspect-[16/9]" />
      </div>

      {/* Centred content stack: title on top, Enter beneath */}
      <div className="rr-stack">
        <h1 className="rr-title font-display" aria-label="Risk Robin">
          <span className="rr-word rr-word-risk">
            {"Risk".split("").map((c, i) => (
              <span
                key={`r-${i}`}
                className="rr-letter"
                style={{ animationDelay: `${0.95 + i * 0.07}s` }}
              >
                {c}
              </span>
            ))}
          </span>
          <span className="rr-word-gap" aria-hidden="true">
            &nbsp;
          </span>
          <span className="rr-word rr-word-robin">
            {"Robin".split("").map((c, i) => (
              <span
                key={`b-${i}`}
                className="rr-letter rr-letter-orange"
                style={{ animationDelay: `${1.3 + i * 0.07}s` }}
              >
                {c}
              </span>
            ))}
          </span>
        </h1>

        <div className={`rr-enter-wrap ${ready ? "rr-enter-ready" : ""}`}>
          <button
            type="button"
            className="rr-enter"
            onClick={(e) => {
              e.stopPropagation();
              onEnter();
            }}
            aria-label="Enter Risk Robin"
          >
            Enter
            <span className="rr-enter-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Edinburgh skyline                                                         */
/* ------------------------------------------------------------------------ */

function EdinburghSkyline() {
  return (
    <svg
      className="rr-skyline"
      viewBox="0 0 1600 520"
      preserveAspectRatio="xMidYEnd meet"
      aria-hidden="true"
    >
      {/* Distant hill behind the castle (Arthur's Seat vibe) */}
      <path
        className="rr-layer rr-layer-far"
        d="M0 360 Q 220 280 460 320 T 980 330 T 1600 360 L 1600 520 L 0 520 Z"
        fill="#cbe0d0"
      />

      {/* Mid-distance buildings (soft pastel block) */}
      <g className="rr-layer rr-layer-mid">
        <rect x="970" y="300" width="80" height="160" fill="#F4D1B7" />
        <rect x="1060" y="270" width="100" height="190" fill="#E4D9EE" />
        <rect x="1170" y="290" width="70" height="170" fill="#FCE9D6" />
        <rect x="1250" y="260" width="110" height="200" fill="#F7D7DE" />
        <rect x="1370" y="290" width="80" height="170" fill="#DCEFD8" />
        <rect x="1460" y="310" width="120" height="150" fill="#E4D9EE" />
        {/* Mid-building windows (tiny dots) */}
        {[
          [990, 320], [990, 360], [990, 400],
          [1080, 290], [1080, 330], [1080, 370], [1080, 410],
          [1190, 310], [1190, 350], [1190, 390],
          [1280, 280], [1280, 320], [1280, 360], [1280, 400],
          [1390, 310], [1390, 350], [1390, 390],
          [1490, 330], [1490, 370], [1490, 410],
        ].map(([x, y], i) => (
          <rect
            key={`mw-${i}`}
            x={x}
            y={y}
            width="12"
            height="12"
            fill="#3b5566"
            opacity="0.18"
            rx="1"
          />
        ))}
      </g>

      {/* Edinburgh Castle — on a rocky outcrop, left of centre */}
      <g className="rr-layer rr-layer-castle">
        {/* Castle Rock */}
        <path
          d="M40 460 Q 60 380 130 360 L 360 340 Q 440 330 470 360 L 470 520 L 40 520 Z"
          fill="#5e4f3f"
        />
        <path
          d="M40 460 Q 60 380 130 360 L 360 340 Q 440 330 470 360 L 470 410 Q 360 400 240 410 Q 130 420 40 460 Z"
          fill="#73624f"
        />

        {/* Curtain wall */}
        <rect x="140" y="290" width="280" height="80" fill="#9c8770" />
        <rect x="140" y="290" width="280" height="12" fill="#7a6852" />

        {/* Battlements along the wall */}
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={`bw-${i}`}
            x={146 + i * 23}
            y={282}
            width="11"
            height="12"
            fill="#9c8770"
          />
        ))}

        {/* Half-Moon Battery */}
        <path
          d="M140 320 Q 100 340 100 370 L 100 370 L 140 370 Z"
          fill="#7a6852"
        />

        {/* Main keep / Crown Square tower */}
        <rect x="220" y="220" width="80" height="100" fill="#a48f74" />
        {Array.from({ length: 5 }).map((_, i) => (
          <rect
            key={`bk-${i}`}
            x={224 + i * 16}
            y={212}
            width="9"
            height="10"
            fill="#a48f74"
          />
        ))}
        {/* Tower windows */}
        <rect x="240" y="248" width="10" height="20" rx="2" fill="#2a3a4a" />
        <rect x="270" y="248" width="10" height="20" rx="2" fill="#2a3a4a" />
        <rect x="240" y="280" width="10" height="20" rx="2" fill="#2a3a4a" />
        <rect x="270" y="280" width="10" height="20" rx="2" fill="#2a3a4a" />

        {/* Smaller flanking tower */}
        <rect x="320" y="250" width="48" height="70" fill="#9c8770" />
        {Array.from({ length: 3 }).map((_, i) => (
          <rect
            key={`bs-${i}`}
            x={324 + i * 16}
            y={242}
            width="9"
            height="10"
            fill="#9c8770"
          />
        ))}
        <rect x="335" y="278" width="10" height="18" rx="2" fill="#2a3a4a" />

        {/* Flagpole + flag */}
        <line x1="260" y1="158" x2="260" y2="212" stroke="#2a2218" strokeWidth="2.4" />
        <path
          className="rr-flag"
          d="M260 160 L 294 166 L 288 178 L 294 190 L 260 184 Z"
          fill="#D24B25"
        />
      </g>

      {/* Royal Mile tenements */}
      <g className="rr-layer rr-layer-tenements">
        {/* Tenement 1 */}
        <rect x="520" y="200" width="160" height="270" fill="#e8c89e" />
        <polygon points="510,200 690,200 680,184 520,184" fill="#7a5d44" />
        {/* chimneys */}
        <rect x="540" y="160" width="14" height="28" fill="#8a6d54" />
        <rect x="640" y="160" width="14" height="28" fill="#8a6d54" />
        {/* sash windows (4 rows × 3 cols) */}
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 3 }).map((__, col) => (
            <g key={`t1-${row}-${col}`}>
              <rect
                x={540 + col * 42}
                y={220 + row * 56}
                width="28"
                height="38"
                fill="#3b5566"
                rx="2"
              />
              <line
                x1={540 + col * 42}
                y1={239 + row * 56}
                x2={568 + col * 42}
                y2={239 + row * 56}
                stroke="#fef6ec"
                strokeWidth="1.2"
              />
              <line
                x1={554 + col * 42}
                y1={220 + row * 56}
                x2={554 + col * 42}
                y2={258 + row * 56}
                stroke="#fef6ec"
                strokeWidth="1.2"
              />
            </g>
          ))
        )}
        {/* door */}
        <rect x="592" y="416" width="36" height="54" fill="#7a3a25" rx="3" />
        <circle cx="620" cy="446" r="1.6" fill="#f1c97a" />

        {/* Tenement 2 (slightly shorter, dusty pink) */}
        <rect x="700" y="240" width="120" height="230" fill="#e9b8b3" />
        <polygon points="694,240 826,240 820,226 700,226" fill="#7a5d44" />
        <rect x="715" y="200" width="12" height="28" fill="#8a6d54" />
        <rect x="790" y="200" width="12" height="28" fill="#8a6d54" />
        {Array.from({ length: 3 }).map((_, row) =>
          Array.from({ length: 2 }).map((__, col) => (
            <g key={`t2-${row}-${col}`}>
              <rect
                x={720 + col * 50}
                y={260 + row * 56}
                width="32"
                height="40"
                fill="#3b5566"
                rx="2"
              />
              <line
                x1={720 + col * 50}
                y1={280 + row * 56}
                x2={752 + col * 50}
                y2={280 + row * 56}
                stroke="#fef6ec"
                strokeWidth="1.2"
              />
            </g>
          ))
        )}

        {/* Tenement 3 (tall, cream) */}
        <rect x="840" y="170" width="100" height="300" fill="#f1dfb6" />
        <polygon points="834,170 946,170 940,156 840,156" fill="#7a5d44" />
        <rect x="855" y="130" width="12" height="28" fill="#8a6d54" />
        <rect x="910" y="130" width="12" height="28" fill="#8a6d54" />
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 2 }).map((__, col) => (
            <g key={`t3-${row}-${col}`}>
              <rect
                x={858 + col * 42}
                y={190 + row * 52}
                width="28"
                height="36"
                fill="#3b5566"
                rx="2"
              />
              <line
                x1={858 + col * 42}
                y1={208 + row * 52}
                x2={886 + col * 42}
                y2={208 + row * 52}
                stroke="#fef6ec"
                strokeWidth="1.2"
              />
            </g>
          ))
        )}
      </g>

      {/* Scott Monument-style gothic spire */}
      <g className="rr-layer rr-layer-spire">
        {/* base block */}
        <rect x="1380" y="380" width="80" height="90" fill="#a89378" />
        {/* tapered arches */}
        <path d="M1380 380 L 1395 320 L 1445 320 L 1460 380 Z" fill="#bda88c" />
        {/* arched cutouts */}
        <path d="M1410 360 Q 1420 340 1430 360 L 1430 380 L 1410 380 Z" fill="#7a5f48" />
        {/* mid tower */}
        <path d="M1395 320 L 1405 250 L 1435 250 L 1445 320 Z" fill="#cdb89a" />
        <rect x="1413" y="270" width="14" height="32" rx="2" fill="#7a5f48" />
        {/* spire top */}
        <path d="M1405 250 L 1415 200 L 1425 200 L 1435 250 Z" fill="#bda88c" />
        <path d="M1415 200 L 1420 150 L 1425 200 Z" fill="#a89378" />
        <circle cx="1420" cy="148" r="3" fill="#f1c97a" />
      </g>

      {/* Foreground trees + lamp posts */}
      <g className="rr-layer rr-layer-fg">
        {/* Trees */}
        {[
          [320, 470, 1],
          [480, 480, 0.9],
          [950, 480, 1.1],
          [1320, 480, 0.95],
        ].map(([x, y, s], i) => (
          <g key={`tree-${i}`} transform={`translate(${x},${y}) scale(${s})`}>
            <rect x="-3" y="-6" width="6" height="22" fill="#6e4c2c" />
            <circle cx="0" cy="-18" r="22" fill="#7FB93C" />
            <circle cx="-12" cy="-10" r="14" fill="#9bc665" />
            <circle cx="12" cy="-12" r="16" fill="#a8d075" />
          </g>
        ))}
        {/* Lamp posts */}
        {[260, 880, 1240].map((x, i) => (
          <g key={`lamp-${i}`} transform={`translate(${x},478)`}>
            <rect x="-1.5" y="-60" width="3" height="60" fill="#3b3328" />
            <circle cx="0" cy="-66" r="6" fill="#f1c97a" />
            <circle cx="0" cy="-66" r="3" fill="#fff3c4" />
          </g>
        ))}
        {/* Edinburgh tram — friendly maroon */}
        <g className="rr-tram" transform="translate(1080, 446)">
          <rect x="0" y="-30" width="160" height="34" rx="6" fill="#7a2233" />
          <rect x="0" y="-30" width="160" height="6" rx="3" fill="#3b3328" />
          <rect x="6" y="-22" width="24" height="14" rx="2" fill="#d5e5f0" />
          <rect x="34" y="-22" width="24" height="14" rx="2" fill="#d5e5f0" />
          <rect x="62" y="-22" width="24" height="14" rx="2" fill="#d5e5f0" />
          <rect x="90" y="-22" width="24" height="14" rx="2" fill="#d5e5f0" />
          <rect x="118" y="-22" width="24" height="14" rx="2" fill="#d5e5f0" />
          <circle cx="22" cy="6" r="6" fill="#1f1812" />
          <circle cx="138" cy="6" r="6" fill="#1f1812" />
        </g>
        {/* Pavement strip across the whole scene */}
        <rect x="0" y="468" width="1600" height="4" fill="#b8a98c" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Styles                                                                    */
/* ------------------------------------------------------------------------ */

const splashCss = `
.rr-splash {
  position: fixed;
  inset: 0;
  z-index: 60;
  overflow: hidden;
  isolation: isolate;
  background: #fdf2e1;
  animation: rrSplashIn 0.35s ease-out both;
  cursor: pointer;
}

.rr-splash-exit {
  animation: rrSplashOut 0.55s cubic-bezier(.65,.05,.36,1) both;
  pointer-events: none;
}

.rr-splash-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(900px 500px at 18% -10%, #FCE9D6 0%, transparent 60%),
    radial-gradient(900px 500px at 110% 10%, #E4D9EE 0%, transparent 55%),
    linear-gradient(180deg, #d8ecf3 0%, #f3e3c8 70%, #f9e9cf 100%);
  animation: rrSkyIn 0.6s ease-out both;
}

/* ---- Clouds ---- */
.rr-cloud {
  position: absolute;
  background: #fff;
  border-radius: 999px;
  filter: drop-shadow(0 4px 8px rgba(80, 60, 40, 0.08));
  opacity: 0;
}
.rr-cloud::before,
.rr-cloud::after {
  content: "";
  position: absolute;
  background: #fff;
  border-radius: 999px;
}

.rr-cloud-1 { top: 8%;  left: -10%; width: 140px; height: 36px; animation: rrCloudL 14s linear infinite, rrCloudFade 1s 0.2s ease-out both; }
.rr-cloud-1::before { left: 18%; top: -16px; width: 60px; height: 36px; }
.rr-cloud-1::after  { right: 14%; top: -22px; width: 48px; height: 30px; }

.rr-cloud-2 { top: 14%; left: 120%; width: 100px; height: 28px; animation: rrCloudR 18s linear infinite, rrCloudFade 1s 0.45s ease-out both; }
.rr-cloud-2::before { left: 20%; top: -12px; width: 40px; height: 26px; }
.rr-cloud-2::after  { right: 16%; top: -16px; width: 34px; height: 22px; }

.rr-cloud-3 { top: 22%; left: -10%; width: 180px; height: 42px; animation: rrCloudL 22s 1s linear infinite, rrCloudFade 1s 0.6s ease-out both; }
.rr-cloud-3::before { left: 18%; top: -18px; width: 70px; height: 40px; }
.rr-cloud-3::after  { right: 12%; top: -24px; width: 56px; height: 34px; }

.rr-cloud-4 { top: 5%; left: 120%; width: 120px; height: 32px; animation: rrCloudR 26s 0.5s linear infinite, rrCloudFade 1s 0.8s ease-out both; }
.rr-cloud-4::before { left: 22%; top: -14px; width: 48px; height: 28px; }
.rr-cloud-4::after  { right: 14%; top: -20px; width: 40px; height: 26px; }

@keyframes rrCloudL {
  from { transform: translateX(0); }
  to   { transform: translateX(140vw); }
}
@keyframes rrCloudR {
  from { transform: translateX(0); }
  to   { transform: translateX(-140vw); }
}
@keyframes rrCloudFade {
  from { opacity: 0; }
  to   { opacity: 0.92; }
}

/* ---- Plane + dashed contrail ---- */
.rr-plane-track {
  position: absolute;
  top: 14%;
  left: -20%;
  width: 60%;
  height: 60px;
  display: flex;
  align-items: center;
  animation: rrPlane 4.5s 0.4s cubic-bezier(.4,.05,.55,1) both;
}
.rr-trail {
  flex: 1;
  height: 2px;
  background-image: linear-gradient(to right, #ffffff 50%, transparent 50%);
  background-size: 14px 2px;
  background-repeat: repeat-x;
  opacity: 0.7;
}
.rr-plane {
  width: 64px;
  height: 18px;
  margin-left: -4px;
}

@keyframes rrPlane {
  0%   { transform: translateX(0)      translateY(2px); }
  100% { transform: translateX(210%)   translateY(-6px); }
}

/* ---- Skyline ---- */
.rr-skyline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 56%;
  max-height: 520px;
  display: block;
}

.rr-layer {
  transform-origin: center bottom;
  opacity: 0;
}

.rr-layer-far       { animation: rrRise 0.7s 0.15s cubic-bezier(.2,.7,.2,1) both; }
.rr-layer-mid       { animation: rrRise 0.7s 0.30s cubic-bezier(.2,.7,.2,1) both; }
.rr-layer-castle    { animation: rrRise 0.7s 0.45s cubic-bezier(.2,.7,.2,1.1) both; }
.rr-layer-tenements { animation: rrRise 0.7s 0.55s cubic-bezier(.2,.7,.2,1.1) both; }
.rr-layer-spire     { animation: rrRise 0.7s 0.65s cubic-bezier(.2,.7,.2,1.2) both; }
.rr-layer-fg        { animation: rrRise 0.7s 0.80s cubic-bezier(.2,.7,.2,1.1) both; }

@keyframes rrRise {
  0%   { opacity: 0; transform: translateY(30px) scale(0.98); }
  60%  { opacity: 1; transform: translateY(-4px) scale(1.005); }
  100% { opacity: 1; transform: translateY(0)   scale(1); }
}

.rr-flag {
  transform-origin: 260px 162px;
  animation: rrFlag 2.4s 1.1s ease-in-out infinite;
}
@keyframes rrFlag {
  0%, 100% { transform: skewX(0deg) scaleX(1); }
  50%      { transform: skewX(-8deg) scaleX(0.95); }
}

.rr-tram {
  animation: rrTram 14s 1.2s linear infinite;
}
@keyframes rrTram {
  0%   { transform: translate(1700px, 446px); }
  100% { transform: translate(-220px, 446px); }
}

@keyframes rrSplashIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes rrSplashOut {
  0%   { opacity: 1; transform: scale(1); filter: blur(0px); }
  100% { opacity: 0; transform: scale(1.04); filter: blur(2px); }
}
@keyframes rrSkyIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ---- Robin entry ----
   The Chief Analyst Robin PNG ships with a white background. We use
   mix-blend-mode: multiply so the PNG's white pixels multiply out to the
   underlying sky (white * anything = anything) while every coloured
   pixel of the bird stays fully opaque. Combined with a perch high up
   on the castle keep — sitting against the sky rather than over the
   dark stone — the Robin reads as a solid little character throughout
   its hop-in. */
.rr-robin-stage {
  position: absolute;
  bottom: clamp(180px, 36vh, 320px);
  left: clamp(80px, 14vw, 240px);
  transform: translate(-220%, 20px);
  animation: rrRobinIn 1.2s 0.9s cubic-bezier(.34,1.3,.5,1) both;
  z-index: 6;
  mix-blend-mode: multiply;
}
@keyframes rrRobinIn {
  0%   { transform: translate(-220%, 60px); }
  35%  { transform: translate(-110%, -10px); }
  55%  { transform: translate(-70%, 20px); }
  75%  { transform: translate(-35%, -6px); }
  90%  { transform: translate(-6%, 20px); }
  100% { transform: translate(0, 20px); }
}

/* ---- Centred stack: title on top, Enter beneath ---- */
.rr-stack {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: clamp(40px, 9vh, 120px);
  gap: clamp(12px, 2.4vh, 28px);
  pointer-events: none;
  z-index: 10;
}

.rr-title {
  margin: 0;
  text-align: center;
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.02em;
  font-size: clamp(56px, 13vw, 180px);
  color: #2b1f15;
  text-shadow:
    0 4px 0 rgba(255,255,255,0.6),
    0 14px 40px rgba(60, 30, 10, 0.22);
  white-space: nowrap;
}

.rr-word {
  display: inline-block;
}
.rr-word-gap {
  display: inline-block;
  width: 0.36em;
}

.rr-letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(-90px) scale(0.6) rotate(-6deg);
  animation: rrLetter 0.7s cubic-bezier(.34, 1.56, .64, 1) forwards;
}

.rr-letter-orange { color: #D24B25; }

@keyframes rrLetter {
  0%   { opacity: 0; transform: translateY(-90px) scale(0.5) rotate(-8deg); }
  55%  { opacity: 1; transform: translateY(8px) scale(1.08) rotate(2deg); }
  78%  { transform: translateY(-3px) scale(0.99) rotate(-1deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
}

/* ---- Enter button ---- */
.rr-enter-wrap {
  display: flex;
  justify-content: center;
  opacity: 0;
  transform: translateY(14px) scale(0.92);
  transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(.34, 1.56, .64, 1);
  pointer-events: none;
}
.rr-enter-ready {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.rr-enter {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 2.4rem;
  border-radius: 999px;
  font-family: "Fredoka", "Nunito", system-ui, sans-serif;
  font-weight: 600;
  font-size: clamp(20px, 2.4vw, 28px);
  letter-spacing: 0.02em;
  color: #fff;
  background: #D24B25;
  border: none;
  box-shadow:
    0 14px 30px -8px rgba(60, 30, 10, 0.35),
    0 0 0 0 rgba(210, 75, 37, 0.55),
    0 0 24px 0 rgba(232, 121, 70, 0.35);
  cursor: pointer;
  animation: rrEnterPulse 2.2s 0.6s ease-in-out infinite;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}
.rr-enter:hover {
  transform: translateY(-2px) scale(1.03);
  filter: brightness(1.06);
}
.rr-enter:active { transform: translateY(0) scale(0.99); }
.rr-enter-arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}
.rr-enter:hover .rr-enter-arrow { transform: translateX(4px); }

@keyframes rrEnterPulse {
  0%, 100% {
    box-shadow:
      0 14px 30px -8px rgba(60, 30, 10, 0.35),
      0 0 0 0 rgba(210, 75, 37, 0.55),
      0 0 24px 0 rgba(232, 121, 70, 0.35);
  }
  50% {
    box-shadow:
      0 14px 30px -8px rgba(60, 30, 10, 0.35),
      0 0 0 14px rgba(210, 75, 37, 0),
      0 0 36px 8px rgba(232, 121, 70, 0.55);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rr-splash,
  .rr-splash-sky,
  .rr-layer,
  .rr-cloud,
  .rr-plane-track,
  .rr-flag,
  .rr-tram,
  .rr-robin-stage,
  .rr-letter,
  .rr-enter {
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
  .rr-cloud { display: none; }
  .rr-plane-track { display: none; }
}
`;
