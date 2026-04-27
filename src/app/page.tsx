import Link from "next/link";
import { getContent } from "@/lib/content-cache";
import { RefreshButton } from "@/components/refresh-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let content;
  try {
    content = await getContent();
  } catch {
    return (
      <div className="text-center">
        <h1 className="font-arabic text-4xl font-bold text-stone-800">بِسْمِ اللَّهِ</h1>
        <p className="mt-2 text-stone-500">Welcome to Quranic Arabic Learning</p>
        <p className="mt-4 text-sm text-stone-400">Content not yet loaded. Configure your Google API credentials in .env.local and refresh.</p>
        <div className="mt-4"><RefreshButton /></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="font-arabic text-4xl font-bold text-stone-800">بِسْمِ اللَّهِ</h1>
        <p className="mt-2 text-stone-500">Quranic Arabic Learning Companion</p>
        <div className="mt-3 flex justify-center"><RefreshButton /></div>
        <p className="mt-2 text-xs text-stone-400">Last updated: {new Date(content.lastFetched).toLocaleString()}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-700">Topics</h2>
          <div className="space-y-2">
            {content.topics.slice(0, 8).map((topic) => (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="block rounded-lg border border-stone-200 bg-white p-3 transition-colors hover:border-amber-300">
                <span className="font-medium text-stone-800">{topic.name}</span>
                {topic.nameArabic && <span dir="rtl" lang="ar" className="font-arabic ml-2 text-stone-400">{topic.nameArabic}</span>}
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-700">Lessons</h2>
          <div className="space-y-2">
            {content.lessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="block rounded-lg border border-stone-200 bg-white p-3 transition-colors hover:border-amber-300">
                <span className="text-sm text-stone-400">Lesson {lesson.number}</span>
                <span className="ml-2 font-medium text-stone-800">{lesson.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
