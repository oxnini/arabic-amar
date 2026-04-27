import Link from "next/link";
import { getContent } from "@/lib/content-cache";
import { VocabularyTable } from "@/components/vocabulary-table";
import { RuleCard } from "@/components/rule-card";
import { ConversationDisplay } from "@/components/conversation-display";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = await getContent();
  const lesson = content.lessons.find((l) => l.id === id);
  if (!lesson) notFound();

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-amber-700">Lesson {lesson.number}</p>
        <h1 className="text-2xl font-bold text-stone-800">{lesson.title}</h1>
        {lesson.titleArabic && <p dir="rtl" lang="ar" className="font-arabic mt-1 text-xl text-stone-500">{lesson.titleArabic}</p>}
      </div>
      {lesson.vocabulary.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">Vocabulary</h2>
          <VocabularyTable entries={lesson.vocabulary} />
        </section>
      )}
      {lesson.grammarRules.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">Key Rules & Tips</h2>
          <div className="space-y-3">{lesson.grammarRules.map((rule, i) => <RuleCard key={i} rule={rule} />)}</div>
        </section>
      )}
      {lesson.conversations.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">Conversations</h2>
          <div className="space-y-4">{lesson.conversations.map((conv, i) => <ConversationDisplay key={i} conversation={conv} />)}</div>
        </section>
      )}
      {lesson.vocabulary.length >= 4 && (
        <section>
          <Link href={`/exercises/${lesson.topicSlugs[0]}`} className="inline-block rounded-lg bg-amber-100 px-6 py-3 font-medium text-amber-900 transition-colors hover:bg-amber-200">Practice Exercises</Link>
        </section>
      )}
    </div>
  );
}
