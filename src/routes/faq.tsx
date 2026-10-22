import { createFileRoute } from "@tanstack/react-router";
import { FaqList } from "@/components/sections";
import { CtaBand, PageHeader } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Buying a house in Japan | Maison Kakehashi" },
      { name: "description", content: "Can a foreigner buy in Japan? Do you need to travel? What does a house really cost? Answers here." },
      { property: "og:title", content: "FAQ | Maison Kakehashi" },
      { property: "og:description", content: "Frequently asked questions about buying property in Japan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Faq,
});

function Faq() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow={t.faq.eyebrow} title={t.faq.title} />
      <FaqList />
      <CtaBand />
    </>
  );
}
