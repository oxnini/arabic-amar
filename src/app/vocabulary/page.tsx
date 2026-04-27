import { getContent } from "@/lib/content-cache";
import { SearchFilter } from "@/components/search-filter";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const content = await getContent();
  const allEntries = content.lessons.flatMap((l) => l.vocabulary);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Vocabulary Bank</h1>
      <SearchFilter entries={allEntries} topics={content.topics} />
    </div>
  );
}
