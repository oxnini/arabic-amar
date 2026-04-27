import Link from "next/link";
import { getContent } from "@/lib/content-cache";
import { VocabularyTable } from "@/components/vocabulary-table";
import { RuleCard } from "@/components/rule-card";
import { ConversationDisplay } from "@/components/conversation-display";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent();
  const topic = content.topics.find((t) => t.slug === slug);
  if (!topic) notFound();

  const lessons = content.lessons.filter((l) => topic.lessonIds.includes(l.id));
  const allVocabulary = lessons.flatMap((l) => l.vocabulary);
  const allRules = lessons.flatMap((l) => l.grammarRules);
  const allConversations = lessons.flatMap((l) => l.conversations);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">{topic.name}</h1>
        {topic.nameArabic && <p dir="rtl" lang="ar" className="font-arabic mt-1 text-xl text-stone-500">{topic.nameArabic}</p>}
      </div>
      {allVocabulary.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">Vocabulary</h2>
          <VocabularyTable entries={allVocabulary} />
        </section>
      )}
      {allRules.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">Key Rules & Tips</h2>
          <div className="space-y-3">{allRules.map((rule, i) => <RuleCard key={i} rule={rule} />)}</div>
        </section>
      )}
      {allConversations.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">Conversations</h2>
          <div className="space-y-4">{allConversations.map((conv, i) => <ConversationDisplay key={i} conversation={conv} />)}</div>
        </section>
      )}
      {allVocabulary.length >= 4 && (
        <section>
          <Link href={`/exercises/${slug}`} className="inline-block rounded-lg bg-amber-100 px-6 py-3 font-medium text-amber-900 transition-colors hover:bg-amber-200">Practice Exercises</Link>
        </section>
      )}
    </div>
  );
}
