import Link from "next/link";
import { getContent } from "@/lib/content-cache";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const content = await getContent();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Lessons</h1>
      <div className="space-y-3">
        {content.lessons.map((lesson) => (
          <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="block rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md">
            <span className="text-sm font-medium text-amber-700">Lesson {lesson.number}</span>
            <h2 className="mt-1 text-lg font-semibold text-stone-800">{lesson.title}</h2>
            {lesson.titleArabic && <p dir="rtl" lang="ar" className="font-arabic mt-1 text-stone-500">{lesson.titleArabic}</p>}
            <p className="mt-2 text-xs text-stone-400">{lesson.vocabulary.length} vocabulary entries{lesson.grammarRules.length > 0 && ` · ${lesson.grammarRules.length} rules`}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
