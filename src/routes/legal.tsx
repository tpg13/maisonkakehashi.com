import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal notice | Maison Kakehashi" },
      { name: "description", content: "Legal notice of Maison Kakehashi — consultant, not a real estate agent." },
      { property: "og:title", content: "Legal notice | Maison Kakehashi" },
      { property: "og:description", content: "Legal information about Maison Kakehashi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Legal,
});

function Legal() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow="Maison Kakehashi" title={t.legal.title} />
      <div className="mx-auto max-w-3xl space-y-5 px-6 pb-24 text-lg text-foreground/85">
        {t.legal.body.map((p) => <p key={p}>{p}</p>)}
      </div>
    </>
  );
}
