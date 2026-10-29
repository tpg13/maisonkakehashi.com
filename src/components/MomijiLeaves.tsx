import { useMemo, useEffect, useState } from "react";

// Accurate 7-lobe Japanese red maple (momiji) leaf path — as specified
const MOMIJI_PATH =
  "M50 95 L48 70 C48 70 42 60 35 55 C25 48 5 45 5 45 C5 45 22 42 32 38 C40 34 45 25 45 25 C45 25 44 15 47 5 C50 15 51 25 51 25 C51 25 58 34 66 38 C76 42 95 45 95 45 C95 45 75 48 65 55 C58 60 52 70 52 70 Z";

const COLORS: { fill: string; opacity: number }[] = [
  { fill: "#C0392B", opacity: 0.72 },
  { fill: "#900C3F", opacity: 0.65 },
  { fill: "#B71C1C", opacity: 0.70 },
  { fill: "#D4AF37", opacity: 0.55 },
  { fill: "#C0392B", opacity: 0.80 },
  { fill: "#900C3F", opacity: 0.60 },
  { fill: "#A93226", opacity: 0.68 },
  { fill: "#D4AF37", opacity: 0.50 },
];

type Leaf = {
  id: string;
  x: number;       // % of container width — starting X
  size: number;    // px
  color: { fill: string; opacity: number };
  fallDuration: number;   // s — total fall time
  swayDuration: number;   // s — horizontal sway period
  swayAmp: number;        // px — sway amplitude
  swayPhase: number;      // deg — initial phase in sway
  rotX: number;    // deg — 3-D tilt around X
  rotY: number;    // deg — 3-D tilt around Y
  rotZSpeed: number; // deg/s — spin speed
  delay: number;   // s — animation start delay
  side: "left" | "right";
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeLeaves(n: number, side: "left" | "right"): Leaf[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${side}-${i}`,
    x: rand(8, 88),
    size: rand(18, 32),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    fallDuration: rand(8, 15),
    swayDuration: rand(2.5, 4.5),
    swayAmp: rand(18, 40),
    swayPhase: rand(0, 360),
    rotX: rand(-30, 30),
    rotY: rand(-45, 45),
    rotZSpeed: rand(-50, 50),
    delay: rand(-14, 0),
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
          0%   { transform: translateY(-50px)
                            rotateX(${leaf.rotX}deg)
                            rotateY(${leaf.rotY}deg)
                            rotateZ(0deg);
                 opacity: 0; }
          6%   { opacity: ${leaf.color.opacity}; }
          50%  { transform: translateY(50vh)
                            rotateX(${-leaf.rotX * 0.6}deg)
                            rotateY(${-leaf.rotY}deg)
                            rotateZ(${rotZEnd * 0.5}deg); }
          94%  { opacity: ${leaf.color.opacity}; }
          100% { transform: translateY(108vh)
                            rotateX(${leaf.rotX * 0.3}deg)
                            rotateY(${leaf.rotY * 0.5}deg)
                            rotateZ(${rotZEnd}deg);
                 opacity: 0; }
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
        <svg
          width={leaf.size}
          height={leaf.size}
          viewBox="0 0 100 100"
          style={{
            animation: `${kFall} ${leaf.fallDuration}s ${leaf.delay}s ease-in infinite`,
            fill: leaf.color.fill,
            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
            willChange: "transform, opacity",
            transformOrigin: "center center",
            display: "block",
            pointerEvents: "none",
          }}
          aria-hidden
        >
          <path d={MOMIJI_PATH} />
        </svg>
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
    const check = () => setVisible(window.innerWidth > 1340);
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
