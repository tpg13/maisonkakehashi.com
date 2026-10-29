import { createFileRoute } from "@tanstack/react-router";
import { FreeDiscoveryCall, ListingCheck, PurchaseSupport } from "@/components/sections";
import { JapanPropertyMap } from '@/components/JapanPropertyMap';
import { CtaBand, PageHeader } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Purchase support & listing check | Maison Kakehashi" },
      { name: "description", content: "Free discovery call, purchase support in Japan from 1,350 CHF and a 75 CHF listing check before you pay. Clear, transparent fees." },
      { property: "og:title", content: "Services | Maison Kakehashi" },
      { property: "og:description", content: "Free discovery call, purchase support and listing checks for houses in Japan." },
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
      <FreeDiscoveryCall />
      <PurchaseSupport />
      <ListingCheck />
      <JapanPropertyMap />
      <CtaBand />
    </>
  );
}
