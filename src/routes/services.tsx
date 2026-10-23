import { createFileRoute } from "@tanstack/react-router";
import { ListingCheck, PurchaseSupport } from "@/components/sections";
import { JapanPropertyMap } from '@/components/JapanPropertyMap';
import { CtaBand, PageHeader } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Purchase support & listing check | Maison Kakehashi" },
      { name: "description", content: "Purchase support in Japan from €1,250 and a €45 listing check before you pay. Clear, fixed fees." },
      { property: "og:title", content: "Services | Maison Kakehashi" },
      { property: "og:description", content: "Purchase support and listing checks for houses in Japan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

function Services() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow={t.services.eyebrow} title={t.services.title} />
      <PurchaseSupport />
      <ListingCheck />
      <JapanPropertyMap />
      <CtaBand />
    </>
  );
}
