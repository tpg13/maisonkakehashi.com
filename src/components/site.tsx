import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { LANGS, useI18n } from "@/lib/i18n";
import { CurrencySwitcher } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function ToriiEmblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 56" className={className} fill="none" aria-hidden>
      <path d="M2 10 Q32 2 62 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M8 18 H56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 11 V54 M47 11 V54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 10 V18" stroke="currentColor" strokeWidth="2" />
      <path d="M4 50 Q32 36 60 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const markIn = () => {
      el.classList.add("in");
    };

    // If already in viewport on mount, reveal immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      markIn();
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          markIn();
          io.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);

    // Failsafe timer: ensures content never stays hidden if IO doesn't trigger
    const timer = setTimeout(markIn, 400 + delay);

    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function LangSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={cn("flex items-center gap-1 text-xs tracking-[0.2em]", className)} role="group" aria-label="Language">
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-gold/30">·</span>}
          <button
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={cn("px-1 py-1 uppercase transition-colors", lang === l ? "text-gold" : "text-muted-foreground hover:text-foreground")}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, className, center }: { eyebrow: string; title: string; className?: string; center?: boolean }) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      <div className={cn("mb-5 flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-gold", center && "justify-center")}>
        <span className="h-px w-10 bg-gold/60" />
        {eyebrow}
      </div>
      <h2 className="text-4xl leading-[1.1] md:text-6xl">{title}</h2>
    </div>
  );
}

export function GoldButton({ to, children, variant = "solid" }: { to: "/book" | "/services" | "/story" | "/projects"; children: ReactNode; variant?: "solid" | "ghost" }) {
  const isBook = to === "/book";
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center justify-center px-8 py-4 text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-500",
        variant === "solid"
          ? "bg-gold-gradient text-primary-foreground shadow-elegant hover:brightness-110"
          : "border border-gold/50 text-gold hover:border-gold hover:bg-gold/10",
        isBook && "btn-book-glow",
      )}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [
    { to: "/services", label: t.nav.services },
    { to: "/story", label: t.nav.story },
    { to: "/projects", label: t.nav.projects },
    { to: "/faq", label: t.nav.faq },
  ] as const;
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-gold-gradient overflow-hidden whitespace-nowrap py-2 text-primary-foreground select-none">
        <div className="flex w-max animate-marquee items-center gap-10 text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span className="animate-spin-slow text-primary-foreground/90 text-xs">✦</span>
              <span>
                <strong className="underline decoration-primary-foreground/40 underline-offset-2">
                  {t.bannerOffer}
                </strong>{" "}
                — {t.bannerText}
              </span>
              <span className="text-primary-foreground/50 text-[10px]">•</span>
            </span>
          ))}
        </div>
      </div>
      <div className={cn("transition-all duration-500", scrolled || open ? "bg-background/90 backdrop-blur-md border-b" : "bg-transparent")}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <ToriiEmblem className="h-8 w-9 text-gold" />
            <span className="leading-none">
              <span className="block font-display text-xl tracking-wide">Maison Kakehashi</span>
              <span className="block text-[9px] uppercase tracking-[0.35em] text-gold">Japan Property Consulting</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-foreground/80 transition-colors hover:text-gold" activeProps={{ className: "text-gold" }}>
                {l.label}
              </Link>
            ))}
            <CurrencySwitcher />
            <LangSwitcher />
            <Link to="/book" className="border border-gold/60 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-primary-foreground btn-book-glow-soft">
              {t.nav.book}
            </Link>
          </div>
          <button className="lg:hidden text-gold" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </nav>
        {open && (
          <div className="flex flex-col gap-5 px-6 pb-8 lg:hidden">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-display text-2xl">
                {l.label}
              </Link>
            ))}
            <Link to="/book" onClick={() => setOpen(false)} className="font-display text-2xl text-gold">
              {t.nav.book}
            </Link>
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <CurrencySwitcher />
              <LangSwitcher />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export function CtaBand() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden border-y py-28 cedar-lines">
      <Reveal className="mx-auto max-w-3xl px-6 text-center">
        <ToriiEmblem className="mx-auto mb-8 h-14 w-16 text-gold" />
        <h2 className="text-4xl md:text-6xl text-gold-gradient">{t.cta.title}</h2>
        <p className="mt-6 text-lg text-muted-foreground">{t.cta.text}</p>
        <div className="mt-10">
          <GoldButton to="/book">{t.cta.button}</GoldButton>
        </div>
      </Reveal>
    </section>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t bg-background/60">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 border border-gold/40 px-6 py-5 text-center font-display text-xl text-gold md:text-2xl">
          {t.footer.consultant}
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <ToriiEmblem className="h-14 w-16 shrink-0 text-gold-bright" />
            <div>
              <div className="font-display text-2xl">Maison Kakehashi</div>
              <div className="text-xs uppercase tracking-[0.3em] text-gold">{t.footer.tagline}</div>
              <div className="mt-3 font-jp text-sm text-muted-foreground">メゾン・かけはし</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/services" className="hover:text-gold">{t.nav.services}</Link>
            <Link to="/story" className="hover:text-gold">{t.nav.story}</Link>
            <Link to="/projects" className="hover:text-gold">{t.nav.projects}</Link>
            <Link to="/faq" className="hover:text-gold">{t.nav.faq}</Link>
            <Link to="/book" className="hover:text-gold">{t.nav.book}</Link>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/legal" className="hover:text-gold">{t.footer.legal}</Link>
            <Link to="/privacy" className="hover:text-gold">{t.footer.privacy}</Link>
            <div className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.footer.lang}</div>
            <LangSwitcher />
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Maison Kakehashi. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}

export function PageHeader({ eyebrow, title, kanji }: { eyebrow: string; title: string; kanji?: string }) {
  return (
    <section className="relative px-6 pb-16 pt-48">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} />
          {kanji && <p className="mt-6 font-jp text-lg text-gold">{kanji}</p>}
        </Reveal>
      </div>
    </section>
  );
}
