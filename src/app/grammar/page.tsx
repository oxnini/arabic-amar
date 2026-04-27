import { getContent } from "@/lib/content-cache";
import { RuleCard } from "@/components/rule-card";

export const dynamic = "force-dynamic";

export default async function GrammarPage() {
  const content = await getContent();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Grammar & Key Rules</h1>
      <div className="space-y-6">
        {content.lessons.filter((l) => l.grammarRules.length > 0).map((lesson) => (
          <section key={lesson.id}>
            <h2 className="mb-3 text-lg font-semibold text-stone-700">Lesson {lesson.number}: {lesson.title}</h2>
            <div className="space-y-3">{lesson.grammarRules.map((rule, i) => <RuleCard key={i} rule={rule} />)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
