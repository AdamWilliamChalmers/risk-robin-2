type Props = {
  /** Tailwind sizing classes, e.g. "w-20 h-20 sm:w-24 sm:h-24" */
  className?: string;
  /** If true, the robin sits still. */
  still?: boolean;
  title?: string;
};

const ROBIN_SRC = "/Chief Analyst Robin.png";

/**
 * Cheeky animated Robin using the real `Chief Analyst Robin.png` as the
 * visible artwork. The earlier vector copy drifted too far from the reference,
 * so this keeps the original image intact and layers subtle moving slices and
 * overlays on top.
 */
export default function AnimatedRobin({
  className = "w-24 h-24",
  still = false,
  title = "Chief Analyst Robin",
}: Props) {
  return (
    <span
      className={`rr-robin ${className} ${still ? "rr-still" : "rr-anim"}`}
      role="img"
      aria-label={title}
    >
      <style>{robinCss}</style>
      <span className="rr-bird" aria-hidden="true">
        <span className="rr-art">
          <img className="rr-base" src={ROBIN_SRC} alt="" draggable={false} />

          {/* Tiny slices of the same PNG, clipped and animated in place. */}
          <img className="rr-slice rr-tail" src={ROBIN_SRC} alt="" draggable={false} />
          <img className="rr-slice rr-wing" src={ROBIN_SRC} alt="" draggable={false} />
          <img className="rr-slice rr-beak" src={ROBIN_SRC} alt="" draggable={false} />

          {/* Duplicated feet that animate. The base image clips the feet area
              out (see .rr-base) so the static feet don't peek through. */}
          <img className="rr-slice rr-foot rr-foot-left" src={ROBIN_SRC} alt="" draggable={false} />
          <img className="rr-slice rr-foot rr-foot-right" src={ROBIN_SRC} alt="" draggable={false} />

          {/* Eye overlays: a sharper user-facing glance plus orange blinks. */}
          <span className="rr-eye-white" />
          <span className="rr-eye-iris" />
          <span className="rr-eye-shine" />
          <span className="rr-lid" />
        </span>
      </span>
      <span className="rr-shadow" aria-hidden="true" />
    </span>
  );
}

const robinCss = `
.rr-robin {
  display: inline-block;
  position: relative;
  overflow: visible;
}

.rr-bird {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: 52% 82%;
}

.rr-art {
  position: absolute;
  inset: 0;
  /* The source PNG is 16:9. This keeps every overlay aligned to the real art. */
  aspect-ratio: 16 / 9;
  height: auto;
  margin-block: auto;
  top: 0;
  bottom: 0;
  overflow: visible;
  transform-origin: 52% 82%;
}

.rr-base,
.rr-slice {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  user-select: none;
  pointer-events: none;
}

.rr-base {
  display: block;
  /* Cut a notch out of the original PNG where the static feet are, so the
     animated duplicate feet can move freely without leaving a "still" pair
     behind. Lets the Robin sit on any background colour. */
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 100%,
    56% 100%, 56% 73%, 37% 73%, 37% 100%,
    0% 100%
  );
}

.rr-slice {
  transform-box: fill-box;
  transform-origin: center;
}

.rr-shadow {
  position: absolute;
  left: 24%;
  right: 18%;
  bottom: 16%;
  height: 5%;
  border-radius: 999px;
  background: rgba(75, 45, 25, 0.22);
  filter: blur(1px);
  transform-origin: center;
}

/* Clipped slices from the real PNG. Percentages are source-image coordinates. */
.rr-tail {
  clip-path: polygon(18% 31%, 29% 40%, 33% 53%, 22% 50%);
  transform-origin: 31% 45%;
}

.rr-wing {
  clip-path: polygon(31% 45%, 53% 38%, 61% 56%, 49% 66%, 30% 57%);
  transform-origin: 52% 45%;
}

.rr-beak {
  clip-path: polygon(66% 24%, 74% 25%, 74% 36%, 66% 36%);
  transform-origin: 66% 30%;
}

.rr-foot-left {
  clip-path: polygon(38% 74%, 44% 74%, 46% 96%, 37% 96%);
  transform-origin: 41.5% 75%;
}

.rr-foot-right {
  clip-path: polygon(47% 74%, 54% 74%, 55% 96%, 46% 96%);
  transform-origin: 50.5% 75%;
}

.rr-foot {
  z-index: 3;
}

.rr-eye-white,
.rr-eye-iris,
.rr-eye-shine,
.rr-lid {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.rr-eye-white {
  left: 57.25%;
  top: 18.2%;
  width: 5.2%;
  height: 9.1%;
  background: #fff;
  z-index: 4;
}

.rr-eye-iris {
  left: 59.05%;
  top: 21.1%;
  width: 2.8%;
  height: 5.1%;
  background: radial-gradient(circle at 35% 28%, #ffffff 0 11%, #4b6f8f 13% 54%, #1f2f3d 56% 100%);
  z-index: 5;
  transform-origin: center;
}

.rr-eye-shine {
  left: 59.35%;
  top: 20.3%;
  width: 0.95%;
  height: 1.7%;
  background: #fff;
  z-index: 6;
}

.rr-lid {
  left: 56.9%;
  top: 17.5%;
  width: 5.8%;
  height: 10%;
  background: #d24b25;
  z-index: 7;
  transform: scaleY(0);
  transform-origin: 50% 8%;
}

.rr-anim .rr-bird {
  animation:
    rrHop 9s ease-in-out infinite,
    rrLean 5.6s ease-in-out infinite,
    rrBreathe 2.3s ease-in-out infinite;
}

.rr-anim .rr-shadow {
  animation: rrShadow 9s ease-in-out infinite;
}

.rr-anim .rr-tail {
  animation: rrTail 3.7s ease-in-out infinite;
}

.rr-anim .rr-wing {
  animation: rrWing 5.1s ease-in-out infinite;
}

.rr-anim .rr-beak {
  animation: rrBeak 6.8s ease-in-out infinite;
}

.rr-anim .rr-foot-left {
  animation: rrFootLeft 4.3s ease-in-out infinite;
}

.rr-anim .rr-foot-right {
  animation: rrFootRight 4.3s ease-in-out infinite;
  animation-delay: 0.55s;
}

.rr-anim .rr-eye-iris,
.rr-anim .rr-eye-shine {
  animation: rrLook 6.1s ease-in-out infinite;
}

.rr-anim .rr-lid {
  animation: rrBlink 3.35s ease-in-out infinite;
}

.rr-robin:hover .rr-bird {
  animation-duration: 5.5s, 2.6s, 1.35s;
}

.rr-robin:hover .rr-wing {
  animation-duration: 1.25s;
}

@keyframes rrBreathe {
  0%, 100% { scale: 1; }
  50% { scale: 1.025 0.985; }
}

@keyframes rrLean {
  0%, 100% { rotate: 0deg; }
  18%, 28% { rotate: -7deg; }
  42% { rotate: 0deg; }
  58%, 68% { rotate: 8deg; }
  78% { rotate: 0deg; }
}

@keyframes rrHop {
  0%, 69%, 100% { translate: 0 0; }
  73% { translate: 0 -13%; }
  77% { translate: 0 -3%; }
  81% { translate: 0 -9%; }
  86% { translate: 0 0; }
}

@keyframes rrShadow {
  0%, 69%, 86%, 100% { transform: scaleX(1); opacity: 0.22; }
  73%, 81% { transform: scaleX(0.58); opacity: 0.1; }
}

@keyframes rrTail {
  0%, 55%, 100% { transform: rotate(0deg); }
  61% { transform: rotate(-12deg); }
  69% { transform: rotate(9deg); }
  77% { transform: rotate(-6deg); }
  85% { transform: rotate(0deg); }
}

@keyframes rrWing {
  0%, 70%, 100% { transform: rotate(0deg); }
  73% { transform: rotate(-9deg) translateY(-1.2%); }
  77% { transform: rotate(5deg); }
  82% { transform: rotate(-7deg); }
  88% { transform: rotate(0deg); }
}

@keyframes rrBeak {
  0%, 84%, 100% { transform: rotate(0deg) scale(1); }
  87% { transform: rotate(-5deg) scale(1.04); }
  90% { transform: rotate(4deg) scale(0.98); }
  93% { transform: rotate(-3deg) scale(1.03); }
  96% { transform: rotate(0deg) scale(1); }
}

@keyframes rrFootLeft {
  0%, 48%, 100% { transform: rotate(0deg) translateY(0); }
  54% { transform: rotate(-10deg) translateY(-2%); }
  63% { transform: rotate(4deg) translateY(0); }
  72% { transform: rotate(0deg); }
}

@keyframes rrFootRight {
  0%, 48%, 100% { transform: rotate(0deg) translateY(0); }
  54% { transform: rotate(11deg) translateY(-2%); }
  63% { transform: rotate(-4deg) translateY(0); }
  72% { transform: rotate(0deg); }
}

@keyframes rrLook {
  0%, 18%, 100% { transform: translate(0, 0); }
  25%, 34% { transform: translate(20%, 12%); }
  44% { transform: translate(0, 0); }
  55%, 64% { transform: translate(-24%, -10%); }
  74%, 82% { transform: translate(6%, 18%); }
  90% { transform: translate(0, 0); }
}

@keyframes rrBlink {
  0%, 38%, 100% { transform: scaleY(0); }
  40%, 43% { transform: scaleY(1); }
  46% { transform: scaleY(0); }
  88% { transform: scaleY(0); }
  90%, 92% { transform: scaleY(1); }
  94% { transform: scaleY(0); }
  95%, 97% { transform: scaleY(1); }
  99% { transform: scaleY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .rr-anim .rr-bird,
  .rr-anim .rr-shadow,
  .rr-anim .rr-tail,
  .rr-anim .rr-wing,
  .rr-anim .rr-beak,
  .rr-anim .rr-foot-left,
  .rr-anim .rr-foot-right,
  .rr-anim .rr-eye-iris,
  .rr-anim .rr-eye-shine,
  .rr-anim .rr-lid {
    animation: none !important;
  }
}
`;
