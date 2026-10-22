import { createFileRoute } from "@tanstack/react-router";
import { StoryContent } from "@/components/sections";
import { CtaBand, PageHeader } from "@/components/site";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "My story — James Loder | Maison Kakehashi" },
      { name: "description", content: "From crane operator across Europe to owner of a house in Kōfu, bought remotely from Switzerland." },
      { property: "og:title", content: "My story | Maison Kakehashi" },
      { property: "og:description", content: "James Loder, the bridge (Kakehashi) between you and Japan." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Story,
});

function Story() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow={t.story.eyebrow} title={t.story.title} kanji={t.story.kanji} />
      <StoryContent />
      <CtaBand />
    </>
  );
}
