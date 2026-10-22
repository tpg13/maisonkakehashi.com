import { createFileRoute } from "@tanstack/react-router";
import { CasesGrid } from "@/components/sections";
import { PageHeader } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects & case studies | Maison Kakehashi" },
      { name: "description", content: "The Kōfu house in progress and houses analysed for clients in Japan." },
      { property: "og:title", content: "Projects | Maison Kakehashi" },
      { property: "og:description", content: "Real cases, real houses in Japan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projects,
});

function Projects() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow={t.cases.eyebrow} title={t.cases.title} />
      <CasesGrid />
    </>
  );
}
