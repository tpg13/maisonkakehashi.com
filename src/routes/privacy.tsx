import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy | Maison Kakehashi" },
      { name: "description", content: "How Maison Kakehashi handles the data you send through its forms." },
      { property: "og:title", content: "Privacy policy | Maison Kakehashi" },
      { property: "og:description", content: "Privacy policy of Maison Kakehashi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow="Maison Kakehashi" title={t.privacy.title} />
      <div className="mx-auto max-w-3xl space-y-5 px-6 pb-24 text-lg text-foreground/85">
        {t.privacy.body.map((p) => <p key={p}>{p}</p>)}
      </div>
    </>
  );
}
