import Link from "next/link";
import { getContent } from "@/lib/content-cache";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const content = await getContent();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Topics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.topics.map((topic) => (
          <Link key={topic.slug} href={`/topics/${topic.slug}`} className="rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md">
            <h2 className="font-semibold text-stone-800">{topic.name}</h2>
            {topic.nameArabic && <p dir="rtl" lang="ar" className="font-arabic mt-1 text-lg text-stone-500">{topic.nameArabic}</p>}
            <p className="mt-2 text-xs text-stone-400">{topic.lessonIds.length} lesson{topic.lessonIds.length !== 1 ? "s" : ""}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
