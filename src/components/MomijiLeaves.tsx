import { useMemo, useEffect, useState } from "react";

// Authentic Japanese Momiji maple leaves from high-res transparent artwork
const LEAF_IMAGES: { src: string; opacity: number }[] = [
  { src: "/images/leaves/leaf-red.png",   opacity: 0.85 },
  { src: "/images/leaves/leaf-amber.png", opacity: 0.80 },
  { src: "/images/leaves/leaf-gold.png",  opacity: 0.78 },
  { src: "/images/leaves/leaf-red.png",   opacity: 0.72 },
  { src: "/images/leaves/leaf-amber.png", opacity: 0.70 },
  { src: "/images/leaves/leaf-gold.png",  opacity: 0.65 },
];

type Leaf = {
  id: string;
  x: number;       // % of container width — starting X
  size: number;    // px width
  image: { src: string; opacity: number };
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
    x: rand(6, 84),
    size: rand(24, 42),
    image: LEAF_IMAGES[Math.floor(Math.random() * LEAF_IMAGES.length)],
    fallDuration: rand(9, 16),
    swayDuration: rand(2.6, 4.6),
    swayAmp: rand(20, 44),
    swayPhase: rand(0, 360),
    rotX: rand(-32, 32),
    rotY: rand(-48, 48),
    rotZSpeed: rand(-55, 55),
    delay: rand(-15, 0),
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
          0%   { transform: translateY(-60px)
                            rotateX(${leaf.rotX}deg)
                            rotateY(${leaf.rotY}deg)
                            rotateZ(0deg);
                 opacity: 0; }
          6%   { opacity: ${leaf.image.opacity}; }
          50%  { transform: translateY(50vh)
                            rotateX(${-leaf.rotX * 0.7}deg)
                            rotateY(${-leaf.rotY}deg)
                            rotateZ(${rotZEnd * 0.5}deg); }
          94%  { opacity: ${leaf.image.opacity}; }
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
        <img
          src={leaf.image.src}
          alt=""
          width={leaf.size}
          height={Math.round(leaf.size * 1.09)}
          style={{
            animation: `${kFall} ${leaf.fallDuration}s ${leaf.delay}s ease-in infinite`,
            filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.45))",
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
