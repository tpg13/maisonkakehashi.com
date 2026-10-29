import { useEffect, useRef, useState, useCallback } from "react";

// A free, public-domain Japanese ambient music URL
// Using a koto/shakuhachi style ambient loop from Pixabay (royalty-free)
// We'll use a CDN-hosted royalty-free traditional Japanese track
const TRACK_URL =
  "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3";

const FADE_STEPS = 30;
const FADE_INTERVAL_MS = 50;
const TARGET_VOLUME = 0.3;

export function AmbientPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Create audio element lazily on first interaction
  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(TRACK_URL);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "none";
    audio.addEventListener("canplaythrough", () => setLoaded(true));
    audio.addEventListener("error", () => setError(true));
    audioRef.current = audio;
    return audio;
  }, []);

  const fadeIn = useCallback((audio: HTMLAudioElement) => {
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    audio.volume = 0;
    const step = TARGET_VOLUME / FADE_STEPS;
    fadeTimerRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const next = Math.min(audioRef.current.volume + step, TARGET_VOLUME);
      audioRef.current.volume = next;
      if (next >= TARGET_VOLUME) {
        clearInterval(fadeTimerRef.current!);
        fadeTimerRef.current = null;
      }
    }, FADE_INTERVAL_MS);
  }, []);

  const fadeOut = useCallback((audio: HTMLAudioElement, onDone: () => void) => {
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    const step = audio.volume / FADE_STEPS;
    fadeTimerRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const next = Math.max(audioRef.current.volume - step, 0);
      audioRef.current.volume = next;
      if (next <= 0) {
        clearInterval(fadeTimerRef.current!);
        fadeTimerRef.current = null;
        onDone();
      }
    }, FADE_INTERVAL_MS);
  }, []);

  const toggle = useCallback(async () => {
    const audio = ensureAudio();

    if (playing) {
      fadeOut(audio, () => audio.pause());
      setPlaying(false);
    } else {
      try {
        await audio.play();
        fadeIn(audio);
        setPlaying(true);
      } catch {
        // Autoplay blocked — show error state briefly
        setError(true);
        setTimeout(() => setError(false), 2500);
      }
    }
  }, [playing, ensureAudio, fadeIn, fadeOut]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const title = error
    ? "⚠ Audio unavailable"
    : playing
    ? "🔊 Sound On"
    : "🎵 Ambient Sound";

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Pause ambient music" : "Play ambient music"}
      title={title}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        borderRadius: "9999px",
        border: "1px solid rgba(212,175,55,0.5)",
        background: "rgba(15,36,29,0.88)",
        backdropFilter: "blur(12px)",
        color: playing ? "#D4AF37" : "rgba(197,168,128,0.85)",
        fontSize: "12px",
        fontFamily: "var(--font-sans, system-ui)",
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "border-color 0.3s, color 0.3s, box-shadow 0.3s",
        boxShadow: playing
          ? "0 0 14px 2px rgba(212,175,55,0.28), 0 4px 16px rgba(0,0,0,0.55)"
          : "0 4px 16px rgba(0,0,0,0.45)",
        whiteSpace: "nowrap",
      }}
    >
      {/* Animated pulse ring when playing */}
      {playing && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            border: "1px solid rgba(212,175,55,0.4)",
            animation: "audio-pulse 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Equalizer bars when playing */}
      {playing ? (
        <span
          aria-hidden
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "2px",
            height: "12px",
            marginRight: "2px",
          }}
        >
          {[1, 2, 3, 2].map((h, i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: "2.5px",
                borderRadius: "1px",
                background: "#D4AF37",
                animationName: "eq-bar",
                animationDuration: `${0.5 + i * 0.13}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
                height: `${h * 4}px`,
              }}
            />
          ))}
        </span>
      ) : (
        <span aria-hidden style={{ fontSize: "14px" }}>
          🎵
        </span>
      )}
      <span>{playing ? "Sound On" : "Ambient Sound"}</span>
    </button>
  );
}
