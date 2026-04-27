"use client";

import { useState } from "react";
import { ExerciseFeedback } from "./exercise-feedback";
import type { VocabularyEntry } from "@/lib/types";

interface ExerciseFillBlankProps {
  entries: VocabularyEntry[];
  onAnswer?: (questionId: string, correct: boolean) => void;
}

export function ExerciseFillBlank({ entries, onAnswer }: ExerciseFillBlankProps) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (entries.length === 0) return null;
  const entry = entries[index];
  const isCorrect = input.trim().toLowerCase() === entry.transliteration.toLowerCase();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSubmitted(true);
    onAnswer?.(`fb-${index}-${entry.arabic}`, isCorrect);
  }

  function handleNext() {
    const nextIndex = (index + 1) % entries.length;
    setIndex(nextIndex);
    setInput("");
    setSubmitted(false);
  }

  return (
    <div className="max-w-md">
      <p className="mb-1 text-sm text-stone-400">{index + 1} / {entries.length}</p>
      <p className="mb-2 text-lg font-medium text-stone-800">Type the transliteration for:</p>
      <p dir="rtl" lang="ar" className="font-arabic mb-4 text-3xl font-semibold text-stone-900">{entry.arabic}</p>
      <form onSubmit={handleSubmit}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={submitted} placeholder="Type transliteration..." className="w-full rounded-lg border border-stone-200 px-4 py-2 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
        {!submitted && (
          <button type="submit" className="mt-2 rounded-md bg-stone-800 px-4 py-1.5 text-sm text-white hover:bg-stone-700">Check</button>
        )}
      </form>
      {submitted && (
        <ExerciseFeedback isCorrect={isCorrect} correctAnswer={entry.arabic} transliteration={entry.transliteration} english={entry.english} onNext={handleNext} />
      )}
    </div>
  );
}
