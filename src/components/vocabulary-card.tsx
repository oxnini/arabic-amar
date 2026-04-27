interface VocabularyCardProps {
  arabic: string;
  transliteration: string;
  english: string;
  isExtra?: boolean;
}

export function VocabularyCard({
  arabic,
  transliteration,
  english,
  isExtra,
}: VocabularyCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-shadow hover:shadow-md ${
        isExtra
          ? "border-stone-200 bg-stone-50 opacity-80"
          : "border-stone-200 bg-white"
      }`}
    >
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-2xl font-semibold leading-relaxed text-stone-900"
      >
        {arabic}
      </p>
      <p className="mt-1 text-sm text-amber-700">{transliteration}</p>
      <p className="mt-0.5 text-sm text-stone-500">{english}</p>
    </div>
  );
}
