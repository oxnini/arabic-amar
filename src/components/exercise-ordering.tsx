"use client";

import { useState } from "react";
import type { VocabularyEntry } from "@/lib/types";

interface ExerciseOrderingProps {
  entries: VocabularyEntry[];
  onAnswer?: (questionId: string, correct: boolean) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function ExerciseOrdering({ entries, onAnswer }: ExerciseOrderingProps) {
  const [items, setItems] = useState(() => shuffleArray(entries.map((e, i) => ({ ...e, correctIndex: i }))));
  const [checked, setChecked] = useState(false);
  const isCorrect = items.every((item, i) => item.correctIndex === i);

  function moveItem(from: number, to: number) {
    if (checked || to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setItems(updated);
  }

  function handleCheck() {
    setChecked(true);
    onAnswer?.("ordering", isCorrect);
  }

  return (
    <div className="max-w-md">
      <p className="mb-4 text-lg font-medium text-stone-800">Put these in the correct order:</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.arabic} className={`flex items-center gap-2 rounded-lg border p-3 ${checked ? (item.correctIndex === i ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50") : "border-stone-200 bg-white"}`}>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveItem(i, i - 1)} disabled={checked || i === 0} className="text-xs text-stone-400 hover:text-stone-600 disabled:opacity-20">▲</button>
              <button onClick={() => moveItem(i, i + 1)} disabled={checked || i === items.length - 1} className="text-xs text-stone-400 hover:text-stone-600 disabled:opacity-20">▼</button>
            </div>
            <span dir="rtl" lang="ar" className="font-arabic text-lg">{item.arabic}</span>
            <span className="text-sm text-stone-400">{item.transliteration}</span>
          </div>
        ))}
      </div>
      {!checked && (
        <button onClick={handleCheck} className="mt-4 rounded-md bg-stone-800 px-4 py-1.5 text-sm text-white hover:bg-stone-700">Check Order</button>
      )}
      {checked && (
        <p className={`mt-4 font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
          {isCorrect ? "Correct!" : "Not quite — try to memorize the correct order."}
        </p>
      )}
    </div>
  );
}
