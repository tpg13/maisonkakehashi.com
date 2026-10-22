import { createFileRoute } from "@tanstack/react-router";
import { BookCall } from "@/components/sections";
import { PageHeader } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a 30-min discovery call | Maison Kakehashi" },
      { name: "description", content: "Book a free 30-minute call about your property project in Japan. Lunchtime and evening slots." },
      { property: "og:title", content: "Book a call | Maison Kakehashi" },
      { property: "og:description", content: "A 30-minute discovery call about your project in Japan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Book,
});

function Book() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow={t.book.eyebrow} title={t.book.title} />
      <BookCall />
    </>
  );
}
