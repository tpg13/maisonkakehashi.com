import { useEffect, useRef, useState, useCallback } from "react";

// Authentic Japanese ambient background track (Bamboo Flute / Shakuhachi)
const TRACK_URL = "/ambient-japan.mp3";

const TARGET_VOLUME = 0.30;
const FADE_STEPS    = 40;
const FADE_MS       = 40; // ms per step → ~1.6 s total fade

export function AmbientPlayer() {
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const fadeRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playing, setPlaying] = useState(false);

  /* ── lazy-create audio element ── */
  const getAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;
    const a = new Audio(TRACK_URL);
    a.loop    = true;
    a.volume  = 0;
    a.preload = "none";
    a.addEventListener("canplaythrough", () => {/* ready */}, { once: true });
    audioRef.current = a;
    return a;
  }, []);

  /* ── smooth fade in ── */
  const fadeIn = useCallback((a: HTMLAudioElement) => {
    if (fadeRef.current) clearInterval(fadeRef.current);
    a.volume = 0;
    const step = TARGET_VOLUME / FADE_STEPS;
    fadeRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const next = Math.min(audioRef.current.volume + step, TARGET_VOLUME);
      audioRef.current.volume = next;
      if (next >= TARGET_VOLUME) { clearInterval(fadeRef.current!); fadeRef.current = null; }
    }, FADE_MS);
  }, []);

  /* ── smooth fade out then pause ── */
  const fadeOut = useCallback((a: HTMLAudioElement, cb: () => void) => {
    if (fadeRef.current) clearInterval(fadeRef.current);
    const step = Math.max(a.volume / FADE_STEPS, 0.001);
    fadeRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const next = Math.max(audioRef.current.volume - step, 0);
      audioRef.current.volume = next;
      if (next <= 0) { clearInterval(fadeRef.current!); fadeRef.current = null; cb(); }
    }, FADE_MS);
  }, []);

  const toggle = useCallback(async () => {
    const a = getAudio();
    if (playing) {
      fadeOut(a, () => a.pause());
      setPlaying(false);
    } else {
      try {
        await a.play();
        fadeIn(a);
        setPlaying(true);
      } catch {
        /* autoplay blocked – silently do nothing; user can tap again */
      }
    }
  }, [playing, getAudio, fadeIn, fadeOut]);

  /* ── cleanup ── */
  useEffect(() => () => {
    if (fadeRef.current) clearInterval(fadeRef.current);
    audioRef.current?.pause();
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Mute ambient music" : "Play ambient music"}
      title={playing ? "Click to mute" : "Click to play ambient music"}
      style={{
        position: "fixed",
        bottom: "22px",
        right: "22px",
        zIndex: 60,
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        border: `1.5px solid ${playing ? "rgba(212,175,55,0.9)" : "rgba(212,175,55,0.45)"}`,
        background: playing
          ? "rgba(15,36,29,0.95)"
          : "rgba(15,36,29,0.80)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "border-color 0.35s, box-shadow 0.35s, background 0.35s",
        boxShadow: playing
          ? "0 0 16px 3px rgba(212,175,55,0.35), 0 4px 14px rgba(0,0,0,0.55)"
          : "0 4px 12px rgba(0,0,0,0.45)",
        padding: 0,
        outline: "none",
      }}
    >
      {/* Breathing ring when playing */}
      {playing && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "50%",
            border: "1.5px solid rgba(212,175,55,0.4)",
            animation: "ambi-ring 2.2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Music-note icon (SVG) or muted version */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        style={{ flexShrink: 0 }}
      >
        {playing ? (
          /* Single filled music note */
          <path
            d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
            stroke="#D4AF37"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          /* Same note but dimmed + small mute cross */
          <>
            <path
              d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
              stroke="rgba(212,175,55,0.55)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </button>
  );
}
