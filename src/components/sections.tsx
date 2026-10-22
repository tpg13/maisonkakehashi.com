import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { Check, ChevronDown, Home, KeyRound, Plane, Building2, Sunrise, CalendarDays, ArrowDown } from "lucide-react";
import heroVideo from "@/assets/hero-transformation.mp4.asset.json";
import kofu from "@/assets/kofu-house.jpg";
import interior from "@/assets/interior.jpg";
import akiya from "@/assets/akiya.jpg";
import bridge from "@/assets/bridge.jpg";
import { useI18n } from "@/lib/i18n";
import { feeSchedule, purchaseFee, LISTING_CHECK_PRICE } from "@/lib/pricing";
import { GoldButton, Reveal, SectionHeading, ToriiEmblem } from "@/components/site";
import { cn } from "@/lib/utils";

export const images = { kofu, interior, akiya, bridge };

/* ---------------- Hero with scroll-scrubbed video ---------------- */
export function HeroVideo() {
  const { t } = useI18n();
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = video.current;
    const w = wrap.current;
    if (!v || !w) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      v.loop = true;
      v.play().catch(() => {});
      return;
    }
    let target = 0;
    let current = 0;
    let raf = 0;
    const onScroll = () => {
      const r = w.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = Math.min(1, Math.max(0, -r.top / total));
    };
    const tick = () => {
      current += (target - current) * 0.12;
      setProgress(current);
      if (v.duration && Math.abs(v.currentTime - current * v.duration) > 0.03) {
        v.currentTime = current * (v.duration - 0.05);
      }
      raf = requestAnimationFrame(tick);
    };
    v.pause();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={wrap} className="relative h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <video
          ref={video}
          src={heroVideo.url}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `scale(${1.08 - progress * 0.08})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
        <div
          className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 pt-24"
          style={{ opacity: Math.max(0, 1 - progress * 1.6), transform: `translateY(${progress * -80}px)` }}
        >
          <div className="mb-6 flex items-center gap-4 text-xs uppercase tracking-[0.4em] text-gold">
            <span className="h-px w-12 bg-gold" />
            {t.hero.eyebrow}
          </div>
          <h1 className="max-w-4xl text-5xl leading-[1.02] md:text-7xl lg:text-8xl">{t.hero.title}</h1>
          <p className="mt-8 max-w-xl text-lg text-foreground/80">{t.hero.subtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <GoldButton to="/book">{t.hero.cta}</GoldButton>
            <GoldButton to="/services" variant="ghost">{t.hero.secondary}</GoldButton>
          </div>
        </div>
        <div
          className="absolute bottom-10 right-6 hidden text-right md:block"
          style={{ opacity: Math.min(1, progress * 2) }}
        >
          <div className="font-jp text-6xl text-gold/80">かけはし</div>
          <div className="mt-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">Kakehashi</div>
        </div>
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          {t.hero.scroll}
          <div className="h-16 w-px bg-border">
            <div className="w-px bg-gold" style={{ height: `${progress * 100}%` }} />
          </div>
          <ArrowDown className="h-3 w-3 text-gold" />
        </div>
      </div>
    </section>
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
            const Icon = cardIcons[i];
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

/* ---------------- Purchase support ---------------- */
export function PurchaseSupport() {
  const { t } = useI18n();
  const s = t.services;
  const [price, setPrice] = useState(30000);
  const fee = purchaseFee(price);
  const { deposit, balance } = feeSchedule(fee);
  const fmt = (n: number) => `€${n.toLocaleString("en-US")}`;
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex items-baseline gap-6">
            <span className="font-display text-7xl text-gold/30">01</span>
            <h2 className="text-4xl md:text-5xl">{s.s1}</h2>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {[
            [s.step1, s.step1Items],
            [s.step2, s.step2Items],
          ].map(([title, items], i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="h-full border bg-card/50 p-10">
                <h3 className="text-2xl text-gold">{title as string}</h3>
                <ul className="mt-6 space-y-3">
                  {(items as string[]).map((it) => (
                    <li key={it} className="flex gap-3 text-foreground/85">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-gold" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="washi h-full p-10">
              <h3 className="text-3xl">{s.pricing}</h3>
              <div className="mt-8 divide-y divide-washi-foreground/15">
                {s.tiers.map(([range, p]) => (
                  <div key={range} className="flex items-baseline justify-between py-4">
                    <span className="text-washi-foreground/75">{range}</span>
                    <span className="font-display text-3xl">{p}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-washi-foreground/70">{s.payment}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {s.extras.map(([k, v]) => (
                  <div key={k} className="border-t border-cedar/40 pt-3">
                    <div className="text-xs uppercase tracking-widest text-cedar">{k}</div>
                    <div className="mt-1 text-sm">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-2" delay={120}>
            <div className="h-full border border-gold/40 p-10">
              <h3 className="text-2xl text-gold">{s.calc}</h3>
              <label className="mt-6 block text-xs uppercase tracking-widest text-muted-foreground" htmlFor="price">
                {s.calcLabel}
              </label>
              <div className="mt-2 font-display text-4xl">{fmt(price)}</div>
              <input
                id="price"
                type="range"
                min={1000}
                max={150000}
                step={1000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-4 w-full accent-[var(--gold)]"
              />
              <dl className="mt-8 space-y-3 text-sm">
                <div className="flex justify-between"><dt>{s.calcFee}</dt><dd className="font-display text-2xl text-gold">{fmt(fee)}</dd></div>
                <div className="flex justify-between text-muted-foreground"><dt>{s.calcDeposit}</dt><dd>{fmt(deposit)}</dd></div>
                <div className="flex justify-between text-muted-foreground"><dt>{s.calcBalance}</dt><dd>{fmt(balance)}</dd></div>
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Listing check with simulated checkout ---------------- */
const listingSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  link: z.string().trim().url().max(1000),
  message: z.string().trim().max(1000),
});

const inputCls =
  "w-full border-b border-input bg-transparent py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none transition-colors";

export function ListingCheck() {
  const { t } = useI18n();
  const s = t.services;
  const f = t.form;
  const [stage, setStage] = useState<"form" | "pay" | "done">("form");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = listingSchema.safeParse(data);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], true])));
      return;
    }
    setErrors({});
    setStage("pay");
  };
  const pay = (e: FormEvent) => {
    e.preventDefault();
    const ok = {
      num: card.num.replace(/\s/g, "").length >= 12,
      exp: /^\d{2}\/\d{2}$/.test(card.exp),
      cvc: /^\d{3,4}$/.test(card.cvc),
    };
    if (!ok.num || !ok.exp || !ok.cvc) {
      setErrors({ num: !ok.num, exp: !ok.exp, cvc: !ok.cvc });
      return;
    }
    setErrors({});
    setStage("done");
  };

  return (
    <section className="px-6 py-24" id="listing-check">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="flex items-baseline gap-6">
            <span className="font-display text-7xl text-gold/30">02</span>
            <h2 className="text-4xl md:text-5xl">{s.s2}</h2>
          </div>
          <p className="mt-8 font-display text-3xl leading-snug text-gold">{s.s2Title}</p>
          <div className="mt-8 text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.s2Included}</div>
          <ul className="mt-4 space-y-3">
            {s.s2Items.map((it) => (
              <li key={it} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-gold" />{it}</li>
            ))}
          </ul>
          <div className="mt-10 inline-flex items-baseline gap-4 border border-gold/40 px-8 py-5">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.fixed}</span>
            <span className="font-display text-5xl text-gold-gradient">€{LISTING_CHECK_PRICE}</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="border bg-card/60 p-8 shadow-elegant md:p-10">
            {stage === "form" && (
              <form onSubmit={submit} className="space-y-6" noValidate>
                <h3 className="text-2xl">{s.order}</h3>
                {(["name", "email", "link"] as const).map((k) => (
                  <div key={k}>
                    <input name={k} type={k === "email" ? "email" : k === "link" ? "url" : "text"} placeholder={f[k]} className={inputCls} maxLength={k === "link" ? 1000 : 255} />
                    {errors[k] && <p className="mt-1 text-xs text-destructive">{f.required}</p>}
                  </div>
                ))}
                <textarea name="message" placeholder={f.message} rows={3} maxLength={1000} className={inputCls} />
                <button className="w-full bg-gold-gradient py-4 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground">
                  {f.continue}
                </button>
              </form>
            )}
            {stage === "pay" && (
              <form onSubmit={pay} className="space-y-6" noValidate>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl">{s.s2}</h3>
                  <span className="font-display text-3xl text-gold">€{LISTING_CHECK_PRICE}</span>
                </div>
                <div>
                  <input placeholder={f.card} inputMode="numeric" maxLength={19} value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value.replace(/[^\d ]/g, "") })} className={inputCls} />
                  {errors.num && <p className="mt-1 text-xs text-destructive">{f.required}</p>}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <input placeholder={f.expiry} maxLength={5} value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} className={inputCls} />
                    {errors.exp && <p className="mt-1 text-xs text-destructive">{f.required}</p>}
                  </div>
                  <div>
                    <input placeholder={f.cvc} inputMode="numeric" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "") })} className={inputCls} />
                    {errors.cvc && <p className="mt-1 text-xs text-destructive">{f.required}</p>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{f.secure}</p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStage("form")} className="border px-6 py-4 text-xs uppercase tracking-[0.2em]">{f.back}</button>
                  <button className="flex-1 bg-gold-gradient py-4 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground">{f.pay}</button>
                </div>
              </form>
            )}
            {stage === "done" && (
              <div className="py-10 text-center">
                <ToriiEmblem className="mx-auto h-14 w-16 text-gold" />
                <p className="mt-6 font-display text-2xl">{f.paid}</p>
              </div>
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

/* ---------------- Book a call ---------------- */
const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40),
  message: z.string().trim().min(1).max(1000),
});

const LUNCH = ["12:00", "12:30", "13:00"];
const EVENING = ["18:30", "19:00", "19:30", "20:00"];

export function BookCall() {
  const { t, lang } = useI18n();
  const b = t.book;
  const f = t.form;
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
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const dayLabel = (d: Date) => d.toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short" });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = contactSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], true])));
      return;
    }
    setErrors({});
    setSent(true);
  };

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="border bg-card/60 p-8 md:p-10">
            <p className="text-muted-foreground">{b.intro}</p>
            <div className="mt-8 text-xs uppercase tracking-[0.3em] text-gold">{b.pick}</div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setDay(i); setSlot(null); setBooked(false); }}
                  className={cn("border px-2 py-3 text-xs capitalize transition-colors", day === i ? "border-gold bg-gold/15 text-gold" : "hover:border-gold/60")}
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
                      onClick={() => { setSlot(s); setBooked(false); }}
                      className={cn("min-w-20 border px-4 py-2 text-sm transition-colors", slot === s ? "border-gold bg-gold-gradient text-primary-foreground" : "hover:border-gold/60")}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="mt-6 text-xs text-muted-foreground">{b.tz} · {b.calendly}</p>
            {slot && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{b.selected}</div>
                  <div className="font-display text-2xl capitalize">{dayLabel(days[day])} · {slot}</div>
                </div>
                {booked ? (
                  <p className="max-w-xs text-sm text-gold">{b.confirmed}</p>
                ) : (
                  <button onClick={() => setBooked(true)} className="bg-gold-gradient px-8 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground">
                    {b.confirm}
                  </button>
                )}
              </div>
            )}
          </div>
        </Reveal>
        <Reveal className="lg:col-span-2" delay={120}>
          <div className="washi h-full p-8 md:p-10">
            <h3 className="text-3xl">{b.contact}</h3>
            {sent ? (
              <p className="mt-8 font-display text-2xl">{f.sent}</p>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
                {(["name", "email", "phone"] as const).map((k) => (
                  <div key={k}>
                    <input name={k} type={k === "email" ? "email" : "text"} placeholder={f[k]} maxLength={k === "phone" ? 40 : 255} className="w-full border-b border-washi-foreground/25 bg-transparent py-3 placeholder:text-washi-foreground/50 focus:border-cedar focus:outline-none" />
                    {errors[k] && <p className="mt-1 text-xs text-destructive">{f.required}</p>}
                  </div>
                ))}
                <div>
                  <textarea name="message" rows={4} maxLength={1000} placeholder={f.message} className="w-full border-b border-washi-foreground/25 bg-transparent py-3 placeholder:text-washi-foreground/50 focus:border-cedar focus:outline-none" />
                  {errors.message && <p className="mt-1 text-xs text-destructive">{f.required}</p>}
                </div>
                <button className="w-full bg-washi-foreground py-4 text-xs font-semibold uppercase tracking-[0.25em] text-washi">{f.send}</button>
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
