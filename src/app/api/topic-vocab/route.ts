import { NextRequest, NextResponse } from "next/server";
import { getContent } from "@/lib/content-cache";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ entries: [] });

  try {
    const content = await getContent();
    const topic = content.topics.find((t) => t.slug === slug);
    if (!topic) return NextResponse.json({ entries: [] });

    const lessons = content.lessons.filter((l) => topic.lessonIds.includes(l.id));
    const entries = lessons.flatMap((l) => l.vocabulary.filter((v) => !v.isExtra));
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}
