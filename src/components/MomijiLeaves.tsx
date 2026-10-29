import { useMemo, useEffect, useState } from "react";

// SVG path for a detailed Japanese maple (momiji) leaf
const MAPLE_LEAF_PATH =
  "M12,2 C12,2 10,5 8,6 C6,7 4,6 3,8 C2,10 4,12 4,12 C4,12 2,14 3,16 C4,18 7,17 7,17 C7,17 7,20 9,21 C11,22 12,20 12,20 C12,20 13,22 15,21 C17,20 17,17 17,17 C17,17 20,18 21,16 C22,14 20,12 20,12 C20,12 22,10 21,8 C20,6 18,7 16,6 C14,5 12,2 12,2 Z";

type Leaf = {
  id: number;
  x: number; // percentage of container width
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  swayAmount: number;
  swaySpeed: number;
  side: "left" | "right";
};

const COLORS = [
  "#C0392B",
  "#B71C1C",
  "#D32F2F",
  "#C62828",
  "#D4AF37",
  "#B7950B",
  "#C0392B",
  "#B71C1C",
  "#D4AF37",
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateLeaves(count: number, side: "left" | "right"): Leaf[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(5, 90),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(16, 28),
    duration: randomBetween(7, 13),
    delay: randomBetween(-12, 0),
    rotation: randomBetween(0, 360),
    swayAmount: randomBetween(12, 28),
    swaySpeed: randomBetween(2.5, 4.5),
    side,
  }));
}

function LeafParticle({ leaf }: { leaf: Leaf }) {
  const keyframeName = `fall-${leaf.side}-${leaf.id}`;

  return (
    <>
      <style>{`
        @keyframes ${keyframeName} {
          0% {
            transform: translateY(-40px) rotate(${leaf.rotation}deg) translateX(0px);
            opacity: 0;
          }
          8% {
            opacity: 0.85;
          }
          50% {
            transform: translateY(50vh) rotate(${leaf.rotation + 180}deg) translateX(${leaf.swayAmount}px);
          }
          100% {
            transform: translateY(105vh) rotate(${leaf.rotation + 360}deg) translateX(${-leaf.swayAmount / 2}px);
            opacity: 0;
          }
        }
      `}</style>
      <svg
        width={leaf.size}
        height={leaf.size}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: `${leaf.x}%`,
          top: 0,
          animation: `${keyframeName} ${leaf.duration}s ${leaf.delay}s ease-in-out infinite`,
          filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.35))`,
          willChange: "transform, opacity",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <path d={MAPLE_LEAF_PATH} fill={leaf.color} />
        {/* Leaf vein details */}
        <path
          d="M12,2 L12,20 M12,11 L7,8 M12,11 L17,8 M12,14 L8,12 M12,14 L16,12"
          stroke={leaf.color === "#D4AF37" || leaf.color === "#B7950B" ? "#8B6914" : "#8B1A1A"}
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.5"
          fill="none"
        />
      </svg>
    </>
  );
}

function LeafContainer({ side }: { side: "left" | "right" }) {
  const leaves = useMemo(() => generateLeaves(12, side), [side]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        [side]: 0,
        width: "clamp(40px, calc((100vw - 1280px) / 2), 120px)",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9,
        overflow: "hidden",
      }}
    >
      {leaves.map((leaf) => (
        <LeafParticle key={leaf.id} leaf={leaf} />
      ))}
    </div>
  );
}

export function MomijiLeaves() {
  const [visible, setVisible] = useState(false);

  // Only show on wide screens where side margins actually exist
  useEffect(() => {
    const check = () => setVisible(window.innerWidth > 1340);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!visible) return null;

  return (
    <>
      <LeafContainer side="left" />
      <LeafContainer side="right" />
    </>
  );
}
