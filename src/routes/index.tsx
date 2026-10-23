import { createFileRoute } from "@tanstack/react-router";
import { HeroVideo, WebsiteHero, ProjectCards, StoryContent, ScrollBackground, images } from "@/components/sections";
import { JapanPropertyMap } from '@/components/JapanPropertyMap';
import { CtaBand, GoldButton, Reveal, SectionHeading } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Kakehashi — Buy a house in Japan, remotely" },
      { name: "description", content: "Construction professional, Swiss resident, property owner in Japan. Japan Property Consulting: search, analysis and remote purchase." },
      { property: "og:title", content: "Maison Kakehashi — Japan is closer than you think" },
      { property: "og:description", content: "Japan Property Consulting by a Swiss-based construction professional who bought his own house in Kōfu remotely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <>
      <ScrollBackground />
      <HeroVideo />
      <WebsiteHero />
      <ProjectCards />
      <section className="relative overflow-hidden px-6 py-32">
        <img src={images.bridge} alt="" width={1280} height={896} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading eyebrow={t.services.eyebrow} title={t.services.title} />
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {[
              [t.services.s1, t.services.step1Items.concat(t.services.step2Items.slice(0, 2)), t.services.tiers[0]![1]],
              [t.services.s2, t.services.s2Items.slice(0, 4), "€45"],
            ].map(([title, items, from], i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="h-full border bg-background/70 p-10 backdrop-blur">
                  <span className="font-display text-6xl text-gold/30">0{i + 1}</span>
                  <h3 className="mt-2 text-3xl">{title as string}</h3>
                  <ul className="mt-6 space-y-2 text-muted-foreground">
                    {(items as string[]).map((x) => <li key={x}>— {x}</li>)}
                  </ul>
                  <div className="mt-8 font-display text-3xl text-gold">{from as string}{i === 0 ? "+" : ""}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12"><GoldButton to="/services" variant="ghost">{t.hero.secondary}</GoldButton></div>
        </div>
      </section>
      <JapanPropertyMap />
      <StoryContent short />
      <CtaBand />
    </>
  );
}
