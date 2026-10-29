import { useEffect, useRef, useState, useMemo, useCallback, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { z } from "zod";
import { Check, ChevronDown, Home, KeyRound, Plane, Building2, Sunrise, CalendarDays, ArrowDown } from "lucide-react";
import kofu from "@/assets/kofu-house.jpg";
import interior from "@/assets/interior.jpg";
import akiya from "@/assets/akiya.jpg";
import bridge from "@/assets/bridge.jpg";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { feeSchedule, purchaseFee, LISTING_CHECK_PRICE, TOUR_VISIT_PRICE } from "@/lib/pricing";
import { GoldButton, Reveal, SectionHeading, ToriiEmblem } from "@/components/site";
import { cn } from "@/lib/utils";
import { sendInquiry, RECIPIENT_EMAIL, type SendResult } from "@/lib/email-service";

// Frame images
const frameModules = import.meta.glob("@/assets/frame/*.jpg", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const frameUrls: string[] = Object.entries(frameModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

// Background images
const bgModules = import.meta.glob("@/assets/background/*.{jpg,jpeg,png}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const bgUrls: string[] = Object.entries(bgModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

export const images = { kofu, interior, akiya, bridge };

const WORDS = [
  { word: "ACQUIRE",   from: 0,  to: 49  },
  { word: "ARCHITECT", from: 50, to: 90  },
  { word: "AWAKEN",    from: 91, to: 157 },
] as const;
const TOTAL = frameUrls.length || 158;

/* ── Full-screen scroll-locked intro (Ultra-smooth Canvas Engine) ── */
export function HeroVideo() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const targetRef   = useRef(0);
  const rafRef      = useRef(0);
  const finishedRef = useRef(false);
  const imagesRef   = useRef<HTMLImageElement[]>([]);

  const [opacity, setOpacity]   = useState(1);
  const [visible, setVisible]   = useState(true);
  const [wordIdx, setWordIdx]   = useState(-1);
  const [wordP, setWordP]       = useState(0);

  // Pre-load all frames into memory
  useEffect(() => {
    const loadedImgs: HTMLImageElement[] = [];
    frameUrls.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      loadedImgs[i] = img;
    });
    imagesRef.current = loadedImgs;
  }, []);

  // Lock body scroll on mount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Canvas resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 60-120fps RAF rendering loop with direct Canvas drawing
  useEffect(() => {
    const tick = () => {
      const cur = progressRef.current;
      // Responsive smoothing (0.16) for instant, fluid feedback
      const next = cur + (targetRef.current - cur) * 0.16;
      progressRef.current = next;

      const fi = Math.min(TOTAL - 1, Math.max(0, Math.floor(next * (TOTAL - 1))));

      // Draw directly to canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = imagesRef.current[fi];
        if (ctx && img && img.complete && img.naturalWidth > 0) {
          const cw = canvas.width;
          const ch = canvas.height;
          const iw = img.naturalWidth;
          const ih = img.naturalHeight;
          const scale = Math.max(cw / iw, ch / ih);
          const nw = iw * scale;
          const nh = ih * scale;
          const nx = (cw - nw) / 2;
          const ny = (ch - nh) / 2;
          ctx.drawImage(img, nx, ny, nw, nh);
        }
      }

      // Word calculation
      let wi = -1, wp = 0;
      for (let i = 0; i < WORDS.length; i++) {
        const w = WORDS[i]!;
        if (fi >= w.from && fi <= w.to) {
          wi = i;
          wp = (fi - w.from) / Math.max(1, w.to - w.from);
          break;
        }
      }
      setWordIdx(wi);
      setWordP(wp);

      // Finish intro when scroll reaches end
      if (next >= 0.998 && !finishedRef.current) {
        finishedRef.current = true;
        setOpacity(0);
        setTimeout(() => {
          document.body.style.overflow = "";
          document.documentElement.style.overflow = "";
          setVisible(false);
          // Land cleanly at the top of the website
          window.scrollTo({ top: 0, behavior: "instant" });
        }, 550);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Responsive Wheel listener
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (finishedRef.current) return;
      e.preventDefault();
      // Sensitivity factor: 1.5 screen turns for full sequence
      const delta = e.deltaY / (window.innerHeight * 1.5);
      targetRef.current = Math.min(1, Math.max(0, targetRef.current + delta));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Touch listener
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0]!.clientY; };
    const onMove = (e: TouchEvent) => {
      if (finishedRef.current) return;
      e.preventDefault();
      const dy = startY - e.touches[0]!.clientY;
      const delta = dy / (window.innerHeight * 1.4);
      targetRef.current = Math.min(1, Math.max(0, targetRef.current + delta));
      startY = e.touches[0]!.clientY;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  // Keyboard listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finishedRef.current) return;
      if (["ArrowDown", " ", "PageDown"].includes(e.key)) {
        e.preventDefault();
        targetRef.current = Math.min(1, targetRef.current + 0.1);
      }
      if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        targetRef.current = Math.max(0, targetRef.current - 0.1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const skip = () => {
    targetRef.current = 1;
    progressRef.current = 0.99;
  };

  if (!visible) return null;

  const progress = progressRef.current;
  const entering = wordP < 0.18;
  const leaving  = wordP > 0.78;
  const tx = wordIdx === -1 ? 100 : entering ? (1 - wordP / 0.18) * 100 : leaving ? -((wordP - 0.78) / 0.22) * 100 : 0;
  const op = wordIdx === -1 ? 0   : entering ? wordP / 0.18             : leaving ? 1 - (wordP - 0.78) / 0.22      : 1;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden bg-black"
      style={{ opacity, transition: "opacity 0.55s ease-in-out" }}
    >
      {/* Canvas for zero-lag hardware-accelerated frame playback */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark veil */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Big word */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {WORDS.map((w, i) => (
          <span
            key={w.word}
            className="absolute font-display text-white select-none text-center px-4"
            style={{
              fontSize: "clamp(3.5rem, 13vw, 11rem)",
              letterSpacing: "0.16em",
              fontWeight: 500,
              textShadow: "0 2px 48px rgba(0,0,0,0.85)",
              opacity: wordIdx === i ? Math.max(0, Math.min(1, op)) : 0,
              transform: `translateX(${wordIdx === i ? tx : 100}px)`,
              transition: "opacity 0.05s linear, transform 0.05s linear",
            }}
          >
            {w.word}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/10">
        <div
          className="h-full bg-gold-gradient"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-white/50"
        style={{ opacity: Math.max(0, 1 - progress * 5) }}
      >
        SCROLL
        <ArrowDown className="h-3 w-3 animate-bounce" />
      </div>

      {/* Skip button */}
      <button
        onClick={skip}
        className="absolute top-6 right-6 text-[11px] uppercase tracking-[0.25em] text-white/50 hover:text-white transition-colors bg-black/40 px-3 py-1.5 rounded border border-white/20"
      >
        Skip Intro →
      </button>
    </div>
  );
}

/* ── Top Website Hero Banner (Starts immediately at top of page) ── */
export function WebsiteHero() {
  const { t } = useI18n();
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-32 pb-20 overflow-hidden">
      <div className="relative mx-auto max-w-7xl w-full">
        <Reveal>
          <div className="mb-6 flex items-center gap-4 text-xs uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-12 bg-gold" />
            {t.hero.eyebrow}
          </div>
          <h1 className="max-w-4xl text-5xl leading-[1.02] md:text-7xl lg:text-8xl text-foreground">
            {t.hero.title}
          </h1>
          <p className="mt-8 max-w-xl text-lg text-foreground/80 leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <GoldButton to="/book">{t.hero.cta}</GoldButton>
            <GoldButton to="/services" variant="ghost">{t.hero.secondary}</GoldButton>
          </div>
        </Reveal>

        <div className="mt-20 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <ArrowDown className="h-4 w-4 text-gold animate-bounce" />
          <span>Scroll down to explore services, properties & interactive map</span>
        </div>
      </div>
    </section>
  );
}

/* ── Scroll-driven background crossfade ─────────────────────────────────── */
export function ScrollBackground() {
  const [scrollY,    setScrollY]    = useState(0);
  const [maxScroll,  setMaxScroll]  = useState(1);

  useEffect(() => {
    const update = () => {
      setScrollY(window.scrollY);
      setMaxScroll(Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (bgUrls.length === 0) return null;

  const t      = Math.min(1, scrollY / maxScroll);
  const scaled = t * (bgUrls.length - 1);
  const idxA   = Math.floor(scaled);
  const idxB   = Math.min(bgUrls.length - 1, idxA + 1);
  const blend  = scaled - idxA;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <img src={bgUrls[idxA]} className="absolute inset-0 h-full w-full object-cover" alt="" />
      <img
        src={bgUrls[idxB]}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: blend }}
        alt=""
      />
      <div className="absolute inset-0 bg-background/70" />
    </div>
  );
}

/* ---------------- Project cards ---------------- */
const cardIcons = [Home, KeyRound, Building2, CalendarDays, Sunrise, Plane];

export function ProjectCards() {
  const { t } = useI18n();
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading eyebrow={t.projects.eyebrow} title={t.projects.title} />
        </Reveal>
        <div className="mt-16 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {t.projects.cards.map(([title, text], i) => {
            const Icon = cardIcons[i] ?? Home;
            return (
              <Reveal key={i} delay={i * 80} className="bg-background">
                <article className="group relative h-full overflow-hidden p-10 transition-colors duration-700 hover:bg-card">
                  <span className="absolute right-8 top-8 font-display text-5xl text-gold/15 transition-colors group-hover:text-gold/40">
                    0{i + 1}
                  </span>
                  <Icon className="h-7 w-7 text-gold" strokeWidth={1.2} />
                  <h3 className="mt-8 text-2xl leading-tight md:text-3xl">{title}</h3>
                  <p className="mt-4 text-muted-foreground">{text}</p>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-gold-gradient transition-all duration-700 group-hover:w-full" />
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{t.projects.note}</p>
      </div>
    </section>
  );
}

/* ---------------- 01 Free Discovery Call ---------------- */
export function FreeDiscoveryCall() {
  const { t } = useI18n();
  const s = t.services;
  return (
    <section className="px-6 py-24 border-b border-border/30">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex items-baseline gap-6">
            <span className="font-display text-7xl text-gold/30">01</span>
            <h2 className="text-4xl md:text-5xl">{s.s0}</h2>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{s.s0Subtitle}</p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 items-center">
          <Reveal className="lg:col-span-8">
            <div className="h-full border border-gold/40 bg-card/60 p-8 md:p-12 shadow-elegant relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-gold/5 blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold font-semibold">
                <span className="h-px w-8 bg-gold" />
                <span>30-Minute Free Discovery</span>
              </div>
              <h3 className="mt-4 font-display text-2xl md:text-3xl text-foreground">
                Get clarity on your journey to owning a home in Japan
              </h3>
              <ul className="mt-8 space-y-4">
                {s.s0Items.map((it) => (
                  <li key={it} className="flex items-start gap-3.5 text-base text-foreground/90">
                    <Check className="mt-1 h-5 w-5 shrink-0 text-gold" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap items-center gap-6 pt-6 border-t border-border/40">
                <GoldButton to="/book">{s.s0Cta}</GoldButton>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  No commitment · Lunchtime & evening slots available
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={120}>
            <div className="washi p-8 md:p-10 text-center flex flex-col items-center justify-center min-h-[320px] shadow-sm">
              <ToriiEmblem className="h-16 w-16 text-gold mb-6" />
              <span className="text-xs uppercase tracking-[0.35em] text-cedar font-semibold">Zero Cost</span>
              <div className="mt-2 font-display text-6xl text-cedar">{s.s0Free}</div>
              <p className="mt-4 text-xs text-washi-foreground/75 leading-relaxed max-w-xs">
                Discuss your criteria, budget, prefectures of interest, and key legal requirements with a Swiss-based owner.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 02 Purchase support & assistance ---------------- */
export function PurchaseSupport() {
  const { t } = useI18n();
  const { formatChf, currency } = useCurrency();
  const s = t.services;
  const [price, setPrice] = useState(45000);
  const fee = purchaseFee(price);
  const { deposit, balance } = feeSchedule(fee);
  const fmt = (n: number) => formatChf(n);

  const tiersFormatted = useMemo(() => {
    if (currency === "CHF") {
      return s.tiers;
    }
    return [
      [`0 – ${formatChf(12000)}`, formatChf(1350)],
      [`${formatChf(12000)} – ${formatChf(50000)}`, formatChf(1850)],
      [`${formatChf(50000)} – ${formatChf(95000)}`, formatChf(2750)],
      [`> ${formatChf(95000)}`, formatChf(3250)],
    ];
  }, [currency, s.tiers, formatChf]);

  const extrasFormatted = useMemo(() => {
    if (currency === "CHF") {
      return s.extras;
    }
    return s.extras.map(([k, v]) => {
      const kLower = k.toLowerCase();
      if (kLower.includes("renovation") || kLower.includes("rénovation") || kLower.includes("ristrutturazione") || kLower.includes("renovierung")) {
        return [k, `(Min. ${formatChf(5000)}) 9% • > ${formatChf(25000)}: 7.5%`];
      }
      return [k, v];
    });
  }, [currency, s.extras, formatChf]);

  return (
    <section className="px-6 py-24 border-b border-border/30">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex items-baseline gap-6">
            <span className="font-display text-7xl text-gold/30">02</span>
            <h2 className="text-4xl md:text-5xl">{s.s1}</h2>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {[
            [s.step1, s.step1Items],
            [s.step2, s.step2Items],
          ].map(([title, items], i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="h-full border border-border/60 bg-card/50 p-10 shadow-sm hover:border-gold/50 transition-colors">
                <div className="text-xs uppercase tracking-[0.25em] text-gold/80 mb-2">Step 0{i + 1}</div>
                <h3 className="text-2xl text-gold font-display">{title as string}</h3>
                <ul className="mt-6 space-y-3.5">
                  {(items as string[]).map((it) => (
                    <li key={it} className="flex gap-3 text-foreground/85 text-base">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-gold" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="washi h-full p-10 shadow-sm">
              <h3 className="text-3xl font-display">{s.pricing}</h3>
              <div className="mt-8 divide-y divide-washi-foreground/15">
                {tiersFormatted.map(([range, p]) => (
                  <div key={range} className="flex items-baseline justify-between py-4">
                    <span className="text-washi-foreground/75 font-medium">{range}</span>
                    <span className="font-display text-3xl text-cedar">{p}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-washi-foreground/70">{s.payment}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {extrasFormatted.map(([k, v]) => (
                  <div key={k} className="border-t border-cedar/40 pt-3">
                    <div className="text-xs uppercase tracking-widest text-cedar font-semibold">{k}</div>
                    <div className="mt-1 text-sm text-washi-foreground/80 leading-snug">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-2" delay={120}>
            <div className="h-full border border-gold/40 bg-card/60 p-10 shadow-elegant">
              <h3 className="text-2xl text-gold font-display">{s.calc}</h3>
              <label className="mt-6 block text-xs uppercase tracking-widest text-muted-foreground" htmlFor="price">
                {s.calcLabel.replace('(CHF)', `(${currency})`)}
              </label>
              <div className="mt-2 font-display text-4xl text-foreground">{fmt(price)}</div>
              <input
                id="price"
                type="range"
                min={2000}
                max={180000}
                step={2000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-4 w-full accent-[var(--gold)]"
              />
              <dl className="mt-8 space-y-4 text-sm border-t border-border/40 pt-6">
                <div className="flex justify-between items-baseline">
                  <dt className="text-foreground/90 font-medium">{s.calcFee}</dt>
                  <dd className="font-display text-3xl text-gold font-bold">{fmt(fee)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>{s.calcDeposit}</dt>
                  <dd className="font-mono">{fmt(deposit)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>{s.calcBalance}</dt>
                  <dd className="font-mono">{fmt(balance)}</dd>
                </div>
              </dl>
              <div className="mt-8 pt-4">
                <GoldButton to="/book">Inquire About Purchase Support</GoldButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 03 Listing check (Direct "Book a Call" Form to contact@maisonkakehashi.com) ---------------- */
const listingSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  link: z.string().trim().url().max(1000),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
});

const inputCls =
  "w-full border-b border-input bg-transparent py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none transition-colors";

export function ListingCheck() {
  const { t } = useI18n();
  const { formatChf } = useCurrency();
  const s = t.services;
  const f = t.form;

  const [selectedPlan, setSelectedPlan] = useState<"check" | "tour">("check");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; plan: string; result: SendResult } | null>(null);

  const activePrice = selectedPlan === "check" ? LISTING_CHECK_PRICE : TOUR_VISIT_PRICE;
  const activePriceLabel = formatChf(activePrice);
  const activePlanTitle = selectedPlan === "check" ? s.s2Option1Title : s.s2Option2Title;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = listingSchema.safeParse(data);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], true])));
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await sendInquiry(
        {
          name: r.data.name,
          email: r.data.email,
          link: r.data.link,
          service: `${activePlanTitle} (${activePriceLabel})`,
          message: r.data.message || "",
        },
        "Listing Check & Call Request"
      );

      setSubmittedData({ name: r.data.name, plan: activePlanTitle, result });
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setErrors({});
  };

  return (
    <section className="px-6 py-24" id="listing-check">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="flex items-baseline gap-6">
            <span className="font-display text-7xl text-gold/30">03</span>
            <h2 className="text-4xl md:text-5xl">{s.s2}</h2>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold font-semibold">{s.s2Subtitle}</p>
          <p className="mt-4 font-display text-2xl md:text-3xl leading-snug text-foreground/90">{s.s2Title}</p>
          
          <div className="mt-8 text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.s2Included}</div>
          <ul className="mt-4 space-y-3">
            {s.s2Items.map((it) => (
              <li key={it} className="flex gap-3 text-foreground/85">
                <Check className="mt-1 h-4 w-4 shrink-0 text-gold" />
                <span>{it}</span>
              </li>
            ))}
          </ul>

          {/* Gold edged squares for 75 CHF & 320 CHF */}
          <div className="mt-10 space-y-4">
            {/* 75 CHF Gold-edged square */}
            <div 
              onClick={() => setSelectedPlan("check")}
              className={cn(
                "cursor-pointer rounded border p-6 transition-all duration-300",
                selectedPlan === "check"
                  ? "border-gold bg-gold/10 shadow-elegant ring-1 ring-gold/60"
                  : "border-gold/40 bg-card/40 hover:border-gold/70"
              )}
            >
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                  {s.s2Option1Title}
                </div>
                <div className="font-display text-3xl font-bold text-gold">
                  {formatChf(LISTING_CHECK_PRICE)}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {s.s2Option1Desc}
              </p>
            </div>

            {/* 320 CHF Gold-bordered square */}
            <div 
              onClick={() => setSelectedPlan("tour")}
              className={cn(
                "cursor-pointer rounded border p-6 transition-all duration-300",
                selectedPlan === "tour"
                  ? "border-gold bg-gold/10 shadow-elegant ring-1 ring-gold/60"
                  : "border-border/60 bg-card/40 hover:border-gold/60"
              )}
            >
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-xs uppercase tracking-[0.25em] text-foreground font-semibold">
                  {s.s2Option2Title}
                </div>
                <div className="font-display text-3xl font-bold text-foreground">
                  {formatChf(TOUR_VISIT_PRICE)}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {s.s2Option2Desc}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="border bg-card/60 p-8 shadow-elegant md:p-10 sticky top-28">
            <div className="flex items-baseline justify-between mb-4 border-b border-border/40 pb-4">
              <div>
                <h3 className="text-2xl font-display">{s.order}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Direct inquiry to contact@maisonkakehashi.com</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-gold font-semibold">Verified Consulting</span>
            </div>

            <div className="mb-6 flex items-center justify-between rounded border border-gold/40 bg-gold/10 px-4 py-2.5">
              <span className="text-xs uppercase tracking-wider text-gold font-semibold">{activePlanTitle}</span>
              <span className="font-display text-xl font-bold text-gold">{activePriceLabel}</span>
            </div>

            {sent ? (
              <div className="py-8 text-center space-y-4">
                {submittedData?.result?.success ? (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold text-2xl font-bold">
                      ✓
                    </div>
                    <h4 className="font-display text-2xl text-foreground">
                      {submittedData?.name ? `Thank you, ${submittedData.name}!` : "Request Sent"}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                      Your listing verification request for <strong>{submittedData?.plan}</strong> has been sent to <strong>contact@maisonkakehashi.com</strong>.
                      We will review your listing and get back to you within 24 to 48 hours.
                    </p>
                  </>
                ) : (
                  <>
                    <ToriiEmblem className="mx-auto h-12 w-14 text-gold" />
                    <h4 className="font-display text-2xl text-foreground">
                      {submittedData?.name ? `Thank you, ${submittedData.name}!` : "Request Ready"}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                      Your request for <strong>{submittedData?.plan}</strong> is ready. Click below to deliver it directly to <strong>contact@maisonkakehashi.com</strong>:
                    </p>
                    <div className="pt-2 flex flex-col gap-3 max-w-sm mx-auto">
                      <a
                        href={submittedData?.result?.mailtoUrl}
                        className="w-full bg-gold-gradient py-3.5 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-elegant hover:brightness-110 transition-all inline-block text-center"
                      >
                        Send to contact@maisonkakehashi.com
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (submittedData?.result?.formattedBody) {
                            navigator.clipboard.writeText(submittedData.result.formattedBody);
                            alert("Request details copied to clipboard!");
                          }
                        }}
                        className="border border-gold/40 py-2.5 px-4 text-xs uppercase tracking-wider text-gold hover:bg-gold/10 transition-colors"
                      >
                        Copy Details to Clipboard
                      </button>
                    </div>
                  </>
                )}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs uppercase tracking-wider text-gold hover:underline"
                  >
                    Send another request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6" noValidate>
                {(["name", "email", "link"] as const).map((k) => (
                  <div key={k}>
                    <input
                      name={k}
                      type={k === "email" ? "email" : k === "link" ? "url" : "text"}
                      placeholder={f[k]}
                      disabled={isSubmitting}
                      className={inputCls}
                      maxLength={k === "link" ? 1000 : 255}
                    />
                    {errors[k] && <p className="mt-1 text-xs text-destructive">{f.required}</p>}
                  </div>
                ))}
                <div>
                  <textarea
                    name="message"
                    placeholder={f.message}
                    rows={3}
                    maxLength={1000}
                    disabled={isSubmitting}
                    className={inputCls}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-gradient py-4 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground shadow-elegant hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>SENDING...</span>
                    </>
                  ) : (
                    `BOOK A CALL (${activePriceLabel})`
                  )}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Story ---------------- */
export function StoryContent({ short }: { short?: boolean }) {
  const { t } = useI18n();
  const s = t.story;
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-start gap-16 lg:grid-cols-2">
        <Reveal className="lg:sticky lg:top-40">
          <div className="relative">
            <img src={kofu} alt="House in Kōfu, Yamanashi, with Mount Fuji" width={1280} height={896} loading="lazy" className="w-full object-cover shadow-elegant" />
            {!short && (
              <img src={interior} alt="Japanese interior with shoji screens" width={1280} height={896} loading="lazy" className="absolute -bottom-16 -right-4 hidden w-1/2 border-4 border-background object-cover shadow-elegant md:block" />
            )}
          </div>
        </Reveal>
        <div>
          {short && (
            <Reveal>
              <SectionHeading eyebrow={s.eyebrow} title={s.title} />
              <p className="mt-6 font-jp text-lg text-gold">{s.kanji}</p>
            </Reveal>
          )}
          <Reveal className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/85">
            <p>{s.p1}</p>
            <p>{s.p2}</p>
            {!short && <p>{s.p3}</p>}
            <p className="font-display text-2xl text-gold">{s.p4}</p>
          </Reveal>
          {short ? (
            <div className="mt-10"><GoldButton to="/story" variant="ghost">{t.nav.story}</GoldButton></div>
          ) : (
            <ol className="relative mt-16 border-l border-gold/30 pl-10">
              {s.timeline.map(([title, text], i) => (
                <Reveal key={i} delay={i * 80}>
                  <li className="relative pb-10">
                    <span className="absolute -left-[46px] top-1 h-3 w-3 rotate-45 border border-gold bg-background" />
                    <div className="text-xs uppercase tracking-[0.3em] text-gold">0{i + 1}</div>
                    <h3 className="mt-1 text-2xl">{title}</h3>
                    <p className="mt-1 text-muted-foreground">{text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Cases ---------------- */
export function CasesGrid() {
  const { t } = useI18n();
  const imgs = [kofu, akiya, interior];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl space-y-24">
        {t.cases.items.map(([title, text], i) => (
          <Reveal key={i}>
            <article className={cn("grid items-center gap-10 md:grid-cols-2", i % 2 && "md:[&>*:first-child]:order-2")}>
              <div className="overflow-hidden">
                <img src={imgs[i]} alt={title} width={1280} height={896} loading="lazy" className="w-full object-cover transition-transform duration-[2s] hover:scale-105" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-gold">{i === 0 ? "Kōfu, Yamanashi" : t.cases.hidden}</div>
                <h3 className="mt-3 text-3xl md:text-4xl">{title}</h3>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </article>
          </Reveal>
        ))}
        <Reveal className="text-center">
          <p className="font-display text-4xl italic text-gold">{t.cases.different}</p>
          <div className="mt-8"><GoldButton to="/book">{t.nav.book}</GoldButton></div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Book a call (Direct Client-Side Form to contact@maisonkakehashi.com) ---------------- */
const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().min(1).max(1000),
});

const LUNCH = ["12:00", "12:30", "13:00"];
const EVENING = ["18:30", "19:00", "19:30", "20:00"];

const RECIPIENT_EMAIL = "contact@maisonkakehashi.com";

export function BookCall() {
  const { t, lang } = useI18n();
  const b = t.book;
  const f = t.form;
  const formRef = useRef<HTMLFormElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    while (out.length < 6) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) out.push(new Date(d));
    }
    return out;
  }, []);

  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submittedData, setSubmittedData] = useState<{ name: string; slot: string | null; result: SendResult } | null>(null);

  const dayLabel = (d: Date) => d.toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short" });

  const activeSlotString = slot ? `${dayLabel(days[day]!)} · ${slot}` : null;

  const handleRequestSlot = () => {
    setBooked(true);
    // Smoothly scroll to the form and focus on the name input
    if (formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const firstInput = formContainerRef.current.querySelector('input[name="name"]') as HTMLInputElement | null;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
      }
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    const dataObj = Object.fromEntries(formData);
    const r = contactSchema.safeParse(dataObj);

    if (!r.success) {
      const errMap: Record<string, boolean> = {};
      r.error.issues.forEach((issue) => {
        if (issue.path[0]) errMap[issue.path[0] as string] = true;
      });
      setErrors(errMap);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const selectedSlotText = activeSlotString ? activeSlotString : "No slot selected (Direct message)";

    try {
      const sendResult = await sendInquiry(
        {
          name: r.data.name,
          email: r.data.email,
          phone: r.data.phone || "",
          slot: selectedSlotText,
          message: r.data.message,
        },
        "Discovery Call Inquiry"
      );

      setSubmittedData({
        name: r.data.name,
        slot: activeSlotString,
        result: sendResult,
      });
      setSent(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError("Failed to submit. Please use the direct email option below.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setBooked(false);
    setSlot(null);
    setErrors({});
    setSubmitError(null);
  };

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="border bg-card/60 p-8 md:p-10 shadow-sm">
            <p className="text-muted-foreground">{b.intro}</p>
            <div className="mt-8 text-xs uppercase tracking-[0.3em] text-gold font-semibold">{b.pick}</div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {days.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setDay(i); setSlot(null); setBooked(false); }}
                  className={cn("border px-2 py-3 text-xs capitalize transition-all duration-200", day === i ? "border-gold bg-gold/20 text-gold font-medium shadow-sm" : "hover:border-gold/60")}
                >
                  {dayLabel(d)}
                </button>
              ))}
            </div>
            {[[b.lunch, LUNCH], [b.evening, EVENING]].map(([label, slots]) => (
              <div key={label as string} className="mt-8">
                <div className="text-sm text-muted-foreground">{label as string}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(slots as string[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setSlot(s); setBooked(false); }}
                      className={cn("min-w-20 border px-4 py-2 text-sm transition-all duration-200", slot === s ? "border-gold bg-gold-gradient text-primary-foreground font-semibold shadow-md" : "hover:border-gold/60")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="mt-6 text-xs text-muted-foreground">{b.tz} · {b.calendly}</p>
            {slot && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{b.selected}</div>
                  <div className="font-display text-2xl capitalize text-gold">{activeSlotString}</div>
                </div>
                {booked ? (
                  <div className="flex items-center gap-2 rounded border border-gold/40 bg-gold/10 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-gold animate-pulse"></span>
                    <p className="text-xs text-gold font-medium">Slot chosen. Please complete your info on the right.</p>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={handleRequestSlot} 
                    className="bg-gold-gradient px-8 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground shadow-elegant hover:brightness-110 transition-all"
                  >
                    {b.confirm}
                  </button>
                )}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={120}>
          <div ref={formContainerRef} className="washi h-full p-8 md:p-10 shadow-sm relative">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-3xl font-display">{b.contact}</h3>
              <span className="text-[10px] text-muted-foreground font-mono">→ {RECIPIENT_EMAIL}</span>
            </div>

            {/* Display active slot badge if selected */}
            {activeSlotString && !sent && (
              <div className="mt-3 mb-4 rounded border border-cedar/30 bg-cedar/10 px-3 py-2 text-xs text-cedar flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cedar"></span>
                  <span>Slot: <strong>{activeSlotString}</strong></span>
                </div>
                <button 
                  type="button"
                  onClick={() => { setSlot(null); setBooked(false); }}
                  className="text-[10px] text-cedar/70 hover:text-cedar underline ml-2"
                >
                  Clear
                </button>
              </div>
            )}

            {sent ? (
              <div className="mt-8 space-y-4">
                {submittedData?.result?.success ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-cedar/15 text-cedar flex items-center justify-center font-bold text-2xl">
                      ✓
                    </div>
                    <h4 className="font-display text-2xl text-foreground">
                      {submittedData?.name ? `Thank you, ${submittedData.name}!` : f.sent}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your information has been sent directly to <strong>{RECIPIENT_EMAIL}</strong>.
                      {submittedData?.slot && (
                        <span className="block mt-2 text-gold font-medium">
                          Requested Slot: {submittedData.slot}
                        </span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-gold/15 text-gold flex items-center justify-center font-bold text-2xl">
                      ✉
                    </div>
                    <h4 className="font-display text-2xl text-foreground">
                      {submittedData?.name ? `Thank you, ${submittedData.name}!` : f.sent}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your message is prepared for <strong>{RECIPIENT_EMAIL}</strong>.
                      {submittedData?.slot && (
                        <span className="block mt-2 text-gold font-medium">
                          Requested Slot: {submittedData.slot}
                        </span>
                      )}
                    </p>
                    <div className="pt-2 flex flex-col gap-3">
                      <a
                        href={submittedData?.result?.mailtoUrl}
                        className="w-full bg-washi-foreground py-3.5 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-washi hover:opacity-90 transition-all inline-block text-center"
                      >
                        Send via Email ({RECIPIENT_EMAIL})
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          if (submittedData?.result?.formattedBody) {
                            navigator.clipboard.writeText(submittedData.result.formattedBody);
                            alert("Message copied to clipboard!");
                          }
                        }}
                        className="border border-washi-foreground/30 py-2.5 px-4 text-xs uppercase tracking-wider text-washi-foreground hover:bg-washi-foreground/10 transition-colors"
                      >
                        Copy Message to Clipboard
                      </button>
                    </div>
                  </>
                )}
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={submit} className="mt-6 space-y-5" noValidate>
                {(['name', 'email', 'phone'] as const).map((k) => (
                  <div key={k}>
                    <input
                      name={k}
                      type={k === 'email' ? 'email' : 'text'}
                      placeholder={f[k]}
                      maxLength={k === 'phone' ? 40 : 255}
                      disabled={isSubmitting}
                      className="w-full border-b border-washi-foreground/25 bg-transparent py-3 placeholder:text-washi-foreground/50 focus:border-cedar focus:outline-none disabled:opacity-50 transition-colors"
                    />
                    {errors[k] && (
                      <p className="mt-1 text-xs text-destructive">{f.required}</p>
                    )}
                  </div>
                ))}
                <div>
                  <textarea
                    name="message"
                    rows={4}
                    maxLength={1000}
                    placeholder={f.message}
                    disabled={isSubmitting}
                    className="w-full border-b border-washi-foreground/25 bg-transparent py-3 placeholder:text-washi-foreground/50 focus:border-cedar focus:outline-none disabled:opacity-50 transition-colors"
                  />
                  {errors['message'] && (
                    <p className="mt-1 text-xs text-destructive">{f.required}</p>
                  )}
                </div>

                {submitError && (
                  <p className="text-xs text-destructive">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-washi-foreground py-4 text-xs font-semibold uppercase tracking-[0.25em] text-washi hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-washi border-t-transparent"></span>
                      <span>SENDING...</span>
                    </>
                  ) : (
                    f.send
                  )}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
export function FaqList() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-4xl divide-y border-y">
        {t.faq.items.map(([q, a], i) => (
          <Reveal key={i} delay={i * 60}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-7 text-left" aria-expanded={open === i}>
              <span className="font-display text-2xl md:text-3xl">{q}</span>
              <ChevronDown className={cn("h-5 w-5 shrink-0 text-gold transition-transform duration-500", open === i && "rotate-180")} />
            </button>
            <div className={cn("grid transition-all duration-500", open === i ? "grid-rows-[1fr] pb-7" : "grid-rows-[0fr]")}>
              <p className="overflow-hidden text-lg leading-relaxed text-muted-foreground">{a}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
