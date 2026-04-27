"use client";

import { useState } from "react";
import type { VocabularyEntry } from "@/lib/types";

interface ExerciseFlashcardProps {
  entries: VocabularyEntry[];
}

export function ExerciseFlashcard({ entries }: ExerciseFlashcardProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (entries.length === 0) return null;
  const entry = entries[index];

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-sm text-stone-400">{index + 1} / {entries.length}</div>
      <button
        onClick={() => setFlipped(!flipped)}
        className="flex h-48 w-72 items-center justify-center rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        {flipped ? (
          <div className="text-center">
            <p className="text-lg font-medium text-stone-800">{entry.english}</p>
            <p className="mt-1 text-sm text-amber-700">{entry.transliteration}</p>
          </div>
        ) : (
          <p dir="rtl" lang="ar" className="font-arabic text-3xl font-semibold text-stone-900">{entry.arabic}</p>
        )}
      </button>
      <p className="mt-2 text-xs text-stone-400">Click to flip</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => { setFlipped(false); setIndex(Math.max(0, index - 1)); }} disabled={index === 0} className="rounded-md bg-stone-100 px-4 py-1.5 text-sm text-stone-600 hover:bg-stone-200 disabled:opacity-30">Previous</button>
        <button onClick={() => { setFlipped(false); setIndex(Math.min(entries.length - 1, index + 1)); }} disabled={index === entries.length - 1} className="rounded-md bg-stone-800 px-4 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-30">Next</button>
      </div>
    </div>
  );
}
