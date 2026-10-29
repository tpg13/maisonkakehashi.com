import { useMemo, useEffect, useState } from "react";

// Authentic Japanese Momiji maple leaves from high-res transparent artwork
const LEAF_SRCS = [
  "/images/leaves/leaf-red.png",
  "/images/leaves/leaf-amber.png",
  "/images/leaves/leaf-gold.png",
];

type Leaf = {
  id: string;
  x: number;              // % of container width — starting X
  size: number;           // px width
  src: string;            // image source
  opacity: number;        // randomized gentle opacity (0.28 to 0.62)
  fallDuration: number;   // s — total fall time
  swayDuration: number;   // s — horizontal sway period
  swayAmp: number;        // px — sway amplitude
  swayPhase: number;      // deg — initial phase in sway
  rotX: number;           // deg — 3-D tilt around X
  rotY: number;           // deg — 3-D tilt around Y
  rotZSpeed: number;      // deg/s — spin speed
  delay: number;          // s — animation start delay
  side: "left" | "right";
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeLeaves(n: number, side: "left" | "right"): Leaf[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${side}-${i}`,
    x: rand(8, 82),
    size: rand(20, 36),
    src: LEAF_SRCS[Math.floor(Math.random() * LEAF_SRCS.length)],
    // Varied subtle opacities so they don't distract visitors
    opacity: Number(rand(0.28, 0.62).toFixed(2)),
    fallDuration: rand(10, 17),
    swayDuration: rand(2.8, 4.8),
    swayAmp: rand(18, 38),
    swayPhase: rand(0, 360),
    rotX: rand(-30, 30),
    rotY: rand(-45, 45),
    rotZSpeed: rand(-50, 50),
    delay: rand(-16, 0),
    side,
  }));
}

/* ─── Single leaf with inline keyframes ─── */
function MomijiLeaf({ leaf }: { leaf: Leaf }) {
  // Each leaf gets its own uniquely-named keyframe set so they are independent
  const kFall = `mf-fall-${leaf.id}`;
  const kSway = `mf-sway-${leaf.id}`;

  const rotZEnd = leaf.rotZSpeed * leaf.fallDuration;

  return (
    <>
      <style>{`
        @keyframes ${kFall} {
          0% {
            transform: translateY(-60px)
                      rotateX(${leaf.rotX}deg)
                      rotateY(${leaf.rotY}deg)
                      rotateZ(0deg);
            opacity: 0;
          }
          10% {
            /* Gentle fade-in at the top */
            opacity: ${leaf.opacity};
          }
          58% {
            /* Mid-screen floating */
            opacity: ${leaf.opacity};
            transform: translateY(54vh)
                      rotateX(${-leaf.rotX * 0.7}deg)
                      rotateY(${-leaf.rotY}deg)
                      rotateZ(${rotZEnd * 0.55}deg);
          }
          75% {
            /* Starts dissolving softly as it approaches the ground */
            opacity: ${(leaf.opacity * 0.4).toFixed(3)};
          }
          86% {
            /* Completely disappears before reaching the ground */
            opacity: 0;
            transform: translateY(82vh)
                      rotateX(${leaf.rotX * 0.3}deg)
                      rotateY(${leaf.rotY * 0.5}deg)
                      rotateZ(${rotZEnd * 0.86}deg);
          }
          100% {
            transform: translateY(88vh)
                      rotateX(${leaf.rotX * 0.2}deg)
                      rotateY(${leaf.rotY * 0.3}deg)
                      rotateZ(${rotZEnd}deg);
            opacity: 0;
          }
        }
        @keyframes ${kSway} {
          0%   { margin-left: 0px; }
          25%  { margin-left:  ${leaf.swayAmp}px; }
          75%  { margin-left: ${-leaf.swayAmp}px; }
          100% { margin-left: 0px; }
        }
      `}</style>
      {/* Outer wrapper handles horizontal sway */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: `${leaf.x}%`,
          top: 0,
          animation: `${kSway} ${leaf.swayDuration}s ${leaf.delay}s ease-in-out infinite`,
          willChange: "margin-left",
          pointerEvents: "none",
        }}
      >
        {/* Inner wrapper handles vertical fall + 3-D rotation */}
        <img
          src={leaf.src}
          alt=""
          width={leaf.size}
          height={Math.round(leaf.size * 1.09)}
          style={{
            animation: `${kFall} ${leaf.fallDuration}s ${leaf.delay}s ease-in infinite`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.30))",
            willChange: "transform, opacity",
            transformOrigin: "center center",
            display: "block",
            pointerEvents: "none",
            userSelect: "none",
          }}
          aria-hidden
        />
      </div>
    </>
  );
}

/* ─── Left / right side column ─── */
function LeafColumn({ side }: { side: "left" | "right" }) {
  // useMemo so leaves are stable between renders but differ per side
  const leaves = useMemo(() => makeLeaves(14, side), [side]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        [side]: 0,
        width: "clamp(48px, calc((100vw - 1280px) / 2), 130px)",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9,
        overflow: "hidden",
        perspective: "600px",
      }}
    >
      {leaves.map((leaf) => (
        <MomijiLeaf key={leaf.id} leaf={leaf} />
      ))}
    </div>
  );
}

/* ─── Public component ─── */
export function MomijiLeaves() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(window.innerWidth > 1100);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!visible) return null;

  return (
    <>
      <LeafColumn side="left" />
      <LeafColumn side="right" />
    </>
  );
}
